// src/pages/Roles/Roles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useCreateRoleModuleMutation,
  useGetPermissionsQuery,
  useGetRolesModulesQuery,
} from "../../redux/permissionModule/permissionModuleApi";
import toast from "react-hot-toast";

const slug = (s = "") =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function OldRoles() {
  const location = useLocation();
  const isEdit = location.pathname === "/roles/select-update";

  // APIs
  const { data: permissions } = useGetPermissionsQuery();
  const { data: rolesData } = useGetRolesModulesQuery();
  const [createRoleModule,{error,isLoading}] = useCreateRoleModuleMutation();

  const parentData = rolesData?.data || [];


  const { MODULES, PERMISSIONS, MODULE_INDEX } = useMemo(() => {
  const modules = [];
  const byModule = {};
  const bySlug = {};

  (permissions?.data || []).forEach((section) => {
    const modSlug = slug(section.name);
    const modIdReal = section.moduleId ?? section._id ?? section.id;   // <-- real backend id

    const modObj = {
      id: modSlug,            // UI key (slug)
      label: section.name,    // moduleName
      moduleId: modIdReal,    // <-- keep real id
    };
    modules.push(modObj);
    bySlug[modSlug] = modObj;

    byModule[modSlug] = (section.components || []).map((c) => ({
      id: slug(c.name),                                         // UI key
      label: c.name,                                            // componentName
      componentId: c.componentId ?? c._id ?? c.id,              // <-- real id
      allow: new Set(c.permissions || []),
    }));
  });

  return { MODULES: modules, PERMISSIONS: byModule, MODULE_INDEX: bySlug };
}, [permissions]);

  // ---------- Defaults (all ON by default) ----------
  const { initialEnabled, initialPerms } = useMemo(() => {
    const en = {};
    const pr = {};
    Object.entries(PERMISSIONS).forEach(([mod, comps]) => {
      comps.forEach((c) => {
        const k = `${mod}.${c.id}`;
        en[k] = true;
        pr[`${k}.view`] = true;
        pr[`${k}.create`] = true;
      });
    });
    return { initialEnabled: en, initialPerms: pr };
  }, [PERMISSIONS]);

  // ---------- State ----------
  const [roleName, setRoleName] = useState("");
  const [parentRole, setParentRole] = useState("");
  const [selectedModules, setSelectedModules] = useState({}); // { [modId]: true }
  const [enabled, setEnabled] = useState({});
  const [perms, setPerms] = useState({});

  // seed maps when API changes
  useEffect(() => {
    setEnabled(initialEnabled);
    setPerms(initialPerms);
  }, [initialEnabled, initialPerms]);

  // Edit prefill
  const buildEnabledFrom = (active = []) =>
    Object.keys(initialEnabled).reduce((acc, k) => ((acc[k] = active.includes(k)), acc), {});
  const buildPermsFrom = (selected = []) =>
    Object.keys(initialPerms).reduce((acc, k) => ((acc[k] = selected.includes(k)), acc), {});

  useEffect(() => {
    const passed = location.state?.role;
    const role = passed ;
    if (!isEdit || !role) return;

    console.log("role to update :", role)
    setRoleName(role.roleName || "");
    setParentRole(role.parentRole || "parent");
    if (Array.isArray(role.permissions) && role.permissions.length) {
      setSelectedModules(role.permissions.reduce((m, id) => ({ ...m, [id]: true }), {}));
    }
    setEnabled(buildEnabledFrom(role.permissions.components || []));
    setPerms(buildPermsFrom(role.permissions || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, JSON.stringify(location.state?.role), initialEnabled, initialPerms]);

  // ---------- Derived ----------
  const activeModIds = useMemo(
    () => Object.keys(selectedModules).filter((k) => selectedModules[k]),
    [selectedModules]
  );

  // Header shows last selected module (user-friendly)
  const primaryModuleId = useMemo(
    () => (activeModIds.length ? activeModIds[activeModIds.length - 1] : null),
    [activeModIds]
  );
  const primaryModuleLabel = useMemo(
    () => (primaryModuleId ? MODULES.find((m) => m.id === primaryModuleId)?.label || primaryModuleId : null),
    [primaryModuleId, MODULES]
  );
  const headerTitle = primaryModuleLabel ?? (isEdit ? "Update Role & Permissions" : "Role & Permissions");

  // ---------- Handlers ----------
  const toggleModule = (modId) =>
    setSelectedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

  const togglePerm = (permKey) => {
    setPerms((prev) => {
      const next = { ...prev, [permKey]: !prev[permKey] };
      const compKey = permKey.replace(/\.view$|\.create$/, "");
      const anyOn = !!next[`${compKey}.view`] || !!next[`${compKey}.create`];
      setEnabled((e) => ({ ...e, [compKey]: anyOn }));
      return next;
    });
  };

  const toggleComponent = (modId, compId) => {
    const k = `${modId}.${compId}`;
    const next = !enabled[k];
    setEnabled((e) => ({ ...e, [k]: next }));
    setPerms((p) => ({
      ...p,
      [`${k}.view`]: next ? true : false,
      [`${k}.create`]: next ? p[`${k}.create`] : false,
    }));
  };

  const CreateRoleModule =async () => {
    try {
      
      if(roleName === "" || parentRole === ""){
        alert("Role name and parent role are required");
        return;
      }
      // modules the user actually selected
      const modules = activeModIds;

      // build the permissions array in the required shape
      const permissionsArray = modules
        .map((modId) => {
          const modMeta = MODULES.find((m) => m.id === modId);
          const comps = PERMISSIONS[modId] || [];

          const selectedComponents = comps
            .map((c) => {
              const compKey = `${modId}.${c.id}`;
              if (!enabled[compKey]) return null; // component not enabled

              // collect only allowed + checked perms
              const picked = [];
              ["view", "create", "edit", "delete"].forEach((k) => {
                if (c.allow.has(k) && perms[`${compKey}.${k}`]) picked.push(k);
              });

              if (picked.length === 0) return null;

              return {
                componentId: c.componentId,
                componentName: c.label,
                permissions: picked,
              };
            })
            .filter(Boolean);

          if (!selectedComponents.length) return null;

          return {
            moduleId: modMeta.moduleId,
            moduleName: modMeta.label,
            components: selectedComponents,
          };
        })
        .filter(Boolean);

      const newPayload = {
        roleName:roleName,
        parentRole:parentRole,
        permissions: permissionsArray,
      };

      const result = await createRoleModule(newPayload);
      console.log("resp :",result)
      if(result?.error){
        toast.error(result.error?.data?.message || "An error occurred");
      }else{
        toast.success("Role created successfully");
      }
    // createRoleModule
    } catch (error) {
      console.log("error",error)
    }
  };

  // ---------- UI classes ----------
  const pillBase = "rounded-xl border px-4 py-2 text-sm transition shadow-sm";
  const pillSelected = "border-purple-300 bg-white ring-2 ring-purple-200 text-purple-700";
  const pill = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";






  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-2xl font-bold text-[#1E1C28]">Role & Permissions</h1>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className="w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
          />

          <div className="relative">
            <select
              value={parentRole}
              onChange={(e) => setParentRole(e.target.value)}
              className="appearance-none w-48 rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select parent role</option>
              {parentData?.map((p) => (
                <option key={p._id || p.id} value={p.roleName}>
                  {p.roleName}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Module multi-select chips */}
        <div className="rounded-2xl mt-3 bg-white py-12 px-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-2xl font-bold text-[#1E1C28]">Select modules</h2>
          <p className="mt-1 text-lg font-semibold text-[#1E1C28B2]">Please select your roles</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {MODULES.map((m) => {
              const active = !!selectedModules[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleModule(m.id)}
                  className={`${pillBase} ${active ? pillSelected : pill}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column-wise: show ALL selected modules */}
        {activeModIds.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
            Select one or more modules to configure components & permissions.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-1">
            {activeModIds.map((modId) => {
              const modLabel = MODULES.find((m) => m.id === modId)?.label || modId;
              const comps = PERMISSIONS[modId] || [];
              return (
                <div key={modId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">{modLabel}</h3>
                    <button onClick={() => toggleModule(modId)} className="text-xs text-rose-600 hover:underline">
                      Remove
                    </button>
                  </div>

                  {comps.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No components.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {comps.map((c) => {
                        const compKey = `${modId}.${c.id}`;
                        const kView = `${compKey}.view`;
                        const kCreate = `${compKey}.create`;
                        const isOn = !!enabled[compKey];

                        return (
                          <li key={c.id} className="grid grid-cols-1 items-center gap-3 px-2 py-3 sm:grid-cols-2">
                            {/* Component toggle */}
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isOn}
                                onChange={() => toggleComponent(modId, c.id)}
                                className="h-4 w-4 rounded border-gray-300 accent-purple-600"
                              />
                              <span className="text-sm text-gray-800">{c.label}</span>
                            </label>

                            {/* View / Create */}
                            <div className="flex items-center gap-8">
                              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={!!perms[kView]}
                                  onChange={() => togglePerm(kView)}
                                  disabled={!isOn}
                                  className="h-4 w-4 rounded border-gray-300 accent-purple-600 disabled:opacity-40"
                                />
                                <span>View</span>
                              </label>
                              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={!!perms[kCreate]}
                                  onChange={() => togglePerm(kCreate)}
                                  disabled={!isOn}
                                  className="h-4 w-4 rounded border-gray-300 accent-purple-600 disabled:opacity-40"
                                />
                                <span>Create</span>
                              </label>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end py-6">
          {activeModIds.length > 0 && (
            <button
              onClick={CreateRoleModule}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {isEdit ? "Update role" : "Save role"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
