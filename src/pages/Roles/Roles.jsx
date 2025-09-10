

// // src/pages/Roles/Roles.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   useCreateRoleModuleMutation,
//   useGetPermissionsQuery,
//   useGetRolesModulesQuery,
//   useUpdateRoleModuleMutation,
// } from "../../redux/permissionModule/permissionModuleApi";
// import toast from "react-hot-toast";
// import { Loader } from "../../Components";

// const slug = (s = "") =>
//   s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// export default function Roles() {
//   const location = useLocation();
//   const isEdit = location.pathname === "/roles/select-update";
//   const isRolepath = location.pathname === "/roles";

//   // APIs
//   const { data: permissions,error: permissionsError,isLoading: permissionsLoading } = useGetPermissionsQuery();
//   const { data: rolesData } = useGetRolesModulesQuery();
//   const [createRoleModule,{error,isLoading}] = useCreateRoleModuleMutation();
//   const [updateRoleModule, {error: updateError , isLoading: updateLoading}] =useUpdateRoleModuleMutation();

//   const parentData = rolesData?.data || [];

//   console.log("permissions :",permissions?.data)

//   // ---------- Build MODULES / PERMISSIONS from API ----------
//   const { MODULES, PERMISSIONS } = useMemo(() => {
//     const modules = [];
//     const byModule = {};

//     (permissions?.data || []).forEach((section) => {
//       const modSlug = slug(section.name);
//       const modIdReal = section.moduleId ?? section._id ?? section.id; // real backend id

//       const modObj = {
//         id: modSlug,         // UI key (slug)
//         label: section.name, // module name
//         moduleId: modIdReal, // real id (for payload/prefill)
//       };
//       modules.push(modObj);

//       byModule[modSlug] = (section.components || []).map((c) => ({
//         id: slug(c.name),                                   // UI key (slug)
//         label: c.name,                                      // component name
//         componentId: c.componentId ?? c._id ?? c.id,        // real id
//         allow: new Set(c.permissions || []),
//       }));
//     });

//     return { MODULES: modules, PERMISSIONS: byModule };
//   }, [permissions]);
  
//   // ✅ lookup maps (real ids -> slugs) for correct PREFILL
//   const MODULE_BY_ID = useMemo(() => {
//     const map = {};
//     MODULES.forEach((m) => { map[m.moduleId] = m.id; });
//     return map;
//   }, [MODULES]);

//   const COMPONENT_BY_ID = useMemo(() => {
//     const map = {};
//     Object.entries(PERMISSIONS).forEach(([modSlug, comps]) => {
//       map[modSlug] = {};
//       comps.forEach((c) => { map[modSlug][c.componentId] = c.id; });
//     });
//     return map;
//   }, [PERMISSIONS]);

//   // ---------- Defaults (all ON by default) ----------
//   const { initialEnabled, initialPerms } = useMemo(() => {
//     const en = {};
//     const pr = {};
//     Object.entries(PERMISSIONS).forEach(([mod, comps]) => {
//       comps.forEach((c) => {
//         const k = `${mod}.${c.id}`;
//         en[k] = true;
//         pr[`${k}.view`] = true;
//         pr[`${k}.create`] = true;
//       });
//     });
//     return { initialEnabled: en, initialPerms: pr };
//   }, [PERMISSIONS]);

//   // ---------- State ----------
//   const [roleName, setRoleName] = useState("");
//   const [parentRole, setParentRole] = useState("");
//   const [parentRoleId, setParentRoleId] = useState("");
//   const [selectedModules, setSelectedModules] = useState({}); // { [modSlug]: true }
//   const [enabled, setEnabled] = useState({});
//   const [perms, setPerms] = useState({});
//   const [roleId, setRoleId] = useState("");
//   // seed maps when API changes (create defaults)
//   useEffect(() => {
//     setEnabled(initialEnabled);
//     setPerms(initialPerms);
//   }, [initialEnabled, initialPerms]);

//   // ❌ OLD prefill ko hata kar ✅ sahi prefill (IDs -> slugs)
//   useEffect(() => {
//     const role = location.state?.role;        // AllRoles se aaya
//     if (!isEdit || !role) return;
//     setRoleId(role?._id || role?.id || "");
//     setRoleName(role.roleName || "");
//     setParentRole(role.parentRole?.roleName ?? "");
//     setParentRoleId(role.parentRole?._id || role.parentRole?.id || "");
//     const nextSelectedModules = {};
//     const nextEnabled = {};
//     const nextPerms = {};

//     (role.permissions || []).forEach((pm) => {
//       const modSlug = MODULE_BY_ID[pm.moduleId];
//       if (!modSlug) return;

//       nextSelectedModules[modSlug] = true;

//       (pm.components || []).forEach((c) => {
//         const compSlug = COMPONENT_BY_ID[modSlug]?.[c.componentId];
//         if (!compSlug) return;

//         const compKey = `${modSlug}.${compSlug}`;
//         nextEnabled[compKey] = true;

//         // keep all perms that backend sent (even if UI show view/create only)
//         (c.permissions || []).forEach((p) => {
//           nextPerms[`${compKey}.${p}`] = true;
//         });
//       });
//     });

//     // Ensure baqi sab keys false hon (taki toggles sahi render hon)
//     Object.keys(PERMISSIONS).forEach((modSlug) => {
//       (PERMISSIONS[modSlug] || []).forEach((c) => {
//         const compKey = `${modSlug}.${c.id}`;
//         if (!(compKey in nextEnabled)) nextEnabled[compKey] = false;
//         ["view","create","edit","delete"].forEach((p) => {
//           const key = `${compKey}.${p}`;
//           if (!(key in nextPerms)) nextPerms[key] = false;
//         });
//       });
//     });

//     setSelectedModules(nextSelectedModules);
//     setEnabled(nextEnabled);
//     setPerms(nextPerms);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isEdit, JSON.stringify(location.state?.role), MODULE_BY_ID, COMPONENT_BY_ID, PERMISSIONS]);

//   // ---------- Derived ----------
//   const activeModIds = useMemo(
//     () => Object.keys(selectedModules).filter((k) => selectedModules[k]),
//     [selectedModules]
//   );

//   // Handlers (unchanged)
//   const toggleModule = (modId) =>
//     setSelectedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

//   const togglePerm = (permKey) => {
//     setPerms((prev) => {
//       const next = { ...prev, [permKey]: !prev[permKey] };
//       const compKey = permKey.replace(/\.view$|\.create$/, "");
//       const anyOn = !!next[`${compKey}.view`] || !!next[`${compKey}.create`];
//       setEnabled((e) => ({ ...e, [compKey]: anyOn }));
//       return next;
//     });
//   };

//   const toggleComponent = (modId, compId) => {
//     const k = `${modId}.${compId}`;
//     const next = !enabled[k];
//     setEnabled((e) => ({ ...e, [k]: next }));
//     setPerms((p) => ({
//       ...p,
//       [`${k}.view`]: next ? true : false,
//       [`${k}.create`]: next ? p[`${k}.create`] : false,
//     }));
//   };


//   //   // ---------- UI classes ----------
//   const pillBase = "rounded-xl border px-4 py-2 text-sm transition shadow-sm";
//   const pillSelected = "border-purple-300 bg-white ring-2 ring-purple-200 text-purple-700";
//   const pill = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";




//   const CreateRoleModule =async () => {
//     try {
      
//       if(roleName === "" || parentRole === ""){
//         alert("Role name and parent role are required");
//         return;
//       }
//       // modules the user actually selected
//       const modules = activeModIds;

//       // build the permissions array in the required shape
//       const permissionsArray = modules
//         .map((modId) => {
//           const modMeta = MODULES.find((m) => m.id === modId);
//           const comps = PERMISSIONS[modId] || [];

//           const selectedComponents = comps
//             .map((c) => {
//               const compKey = `${modId}.${c.id}`;
//               if (!enabled[compKey]) return null; // component not enabled

//               // collect only allowed + checked perms
//               const picked = [];
//               ["view", "create", "edit", "delete"].forEach((k) => {
//                 if (c.allow.has(k) && perms[`${compKey}.${k}`]) picked.push(k);
//               });

//               if (picked.length === 0) return null;

//               return {
//                 componentId: c.componentId,
//                 componentName: c.label,
//                 permissions: picked,
//               };
//             })
//             .filter(Boolean);

//           if (!selectedComponents.length) return null;

//           return {
//             moduleId: modMeta.moduleId,
//             moduleName: modMeta.label,
//             components: selectedComponents,
//           };
//         })
//         .filter(Boolean);

//       const newPayload = {
//         roleName:roleName,
//         parentRole:parentRoleId,
//         permissions: permissionsArray,
//       };

//       const result = await createRoleModule(newPayload);
//       console.log("resp :",result)
//       if(result?.error){
//         toast.error(result.error?.data?.message || "An error occurred");
//       }else{
//         toast.success("Role created successfully");
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   };



//   // update role
//   const UpdateRoleModule=async () => {
//     // modules the user actually selected
//     const modules = activeModIds;

//     // build the permissions array in the required shape
//     const permissionsArray = modules
//       .map((modId) => {
//         const modMeta = MODULES.find((m) => m.id === modId);
//         const comps = PERMISSIONS[modId] || [];

//         const selectedComponents = comps
//           .map((c) => {
//             const compKey = `${modId}.${c.id}`;
//             if (!enabled[compKey]) return null; // component not enabled

//             // collect only allowed + checked perms
//             const picked = [];
//             ["view", "create", "edit", "delete"].forEach((k) => {
//               if (c.allow.has(k) && perms[`${compKey}.${k}`]) picked.push(k);
//             });

//             if (picked.length === 0) return null;

//             return {
//               componentId: c.componentId,
//               componentName: c.label,
//               permissions: picked,
//             };
//           })
//           .filter(Boolean);

//         if (!selectedComponents.length) return null;

//         return {
//           moduleId: modMeta.moduleId,
//           moduleName: modMeta.label,
//           components: selectedComponents,
//         };
//       })
//       .filter(Boolean);
//     const newPayload = {
//       id: roleId,
//       roleName: roleName,
//       parentRole: parentRoleId,
//       permissions: permissionsArray,
//     };
//     const response = await updateRoleModule(newPayload);
//     if (response?.error) {
//       toast.error(response.error?.data?.message || "An error occurred");
//     } else {
//       toast.success("Role updated successfully");
//     }
//   }

//   // console.log("perms :",perms)


//   // useEffect(() => {
//   //   if (!isRolepath) return;

//   //   setRoleName("");
//   //   setParentRole("");
//   //   setSelectedModules({});
//   //   setEnabled({});  
//   //   setPerms({});        
//   // }, [isRolepath]);


//   if(permissionsLoading){
//     return(
//     <>
//       <Loader
//         show={permissionsLoading}
//         fullscreen
//         overlay
//         variant="spinner"      // 'spinner' | 'dots' | 'bar'
//         text="Data Loading..."
//       />

//     </>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="mx-auto max-w-6xl px-6 py-6">
//         {/* Header */}
//         <div className="mb-4 flex flex-wrap items-center gap-3">
//           <h1 className="mr-auto text-2xl font-bold text-[#1E1C28]">Role & Permissions</h1>
//           <input
//             type="text"
//             value={roleName}
//             onChange={(e) => setRoleName(e.target.value)}
//             placeholder="Enter role name"
//             className="w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
//           />

//           <div className="relative">
//             <select
//               value={parentRole}
//               onChange={(e) => {
//                 const name = e.target.value; // selected name
//                 const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
//                 setParentRole(name);
//                 setParentRoleId(id);
//               }}
//               className="appearance-none w-48 rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
//             >
//               <option value="">Select parent role</option>
//               {parentData?.map((p) => (
//                 <option key={p._id || p.id} value={p.roleName} data-id={p._id || p.id}>
//                   {p.roleName}
//                 </option>
//               ))}
//             </select>
//             <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
//             </svg>
//           </div>
//         </div>

//         {/* Module multi-select chips */}
//         <div className="rounded-2xl mt-3 bg-white py-12 px-6 shadow-sm ring-1 ring-gray-100">
//           <h2 className="text-2xl font-bold text-[#1E1C28]">Select modules</h2>
//           <p className="mt-1 text-lg font-semibold text-[#1E1C28B2]">Please select your roles</p>

//           <div className="mt-5 flex flex-wrap gap-3">
//             {MODULES.map((m) => {
//               const active = !!selectedModules[m.id];
//               return (
//                 <button
//                   key={m.id}
//                   type="button"
//                   onClick={() => toggleModule(m.id)}
//                   className={`${pillBase} ${active ? pillSelected : pill}`}
//                 >
//                   {m.label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Column-wise: show ALL selected modules */}
//         {activeModIds.length === 0 ? (
//           <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
//             Select one or more modules to configure components & permissions.
//           </div>
//         ) : (
//           <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-1">
//             {activeModIds.map((modId) => {
//               const modLabel = MODULES.find((m) => m.id === modId)?.label || modId;
//               const comps = PERMISSIONS[modId] || [];
//               return (
//                 <div key={modId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
//                   <div className="mb-3 flex items-center justify-between">
//                     <h3 className="text-sm font-semibold text-gray-800">{modLabel}</h3>
//                     <button onClick={() => toggleModule(modId)} className="text-xs text-rose-600 hover:underline">
//                       Remove
//                     </button>
//                   </div>

//                   {comps.length === 0 ? (
//                     <div className="p-4 text-sm text-gray-500">No components.</div>
//                   ) : (
//                     <ul className="divide-y divide-gray-100">
//                       {comps.map((c) => {
//                         const compKey = `${modId}.${c.id}`;
//                         const kView = `${compKey}.view`;
//                         const kCreate = `${compKey}.create`;
//                         const isOn = !!enabled[compKey];

//                         return (
//                           <li key={c.id} className="grid grid-cols-1 items-center gap-3 px-2 py-3 sm:grid-cols-2">
//                             {/* Component toggle */}
//                             <label className="flex items-center gap-3">
//                               <input
//                                 type="checkbox"
//                                 checked={isOn}
//                                 onChange={() => toggleComponent(modId, c.id)}
//                                 className="h-4 w-4 rounded border-gray-300 accent-purple-600"
//                               />
//                               <span className="text-sm text-gray-800">{c.label}</span>
//                             </label>

//                             {/* View / Create */}
//                             <div className="flex items-center gap-8">
//                               <label className="inline-flex items-center gap-2 text-sm text-gray-700">
//                                 <input
//                                   type="checkbox"
//                                   checked={!!perms[kView]}
//                                   onChange={() => togglePerm(kView)}
//                                   disabled={!isOn}
//                                   className="h-4 w-4 rounded border-gray-300 accent-purple-600 disabled:opacity-40"
//                                 />
//                                 <span>View</span>
//                               </label>
//                               <label className="inline-flex items-center gap-2 text-sm text-gray-700">
//                                 <input
//                                   type="checkbox"
//                                   checked={!!perms[kCreate]}
//                                   onChange={() => togglePerm(kCreate)}
//                                   disabled={!isOn}
//                                   className="h-4 w-4 rounded border-gray-300 accent-purple-600 disabled:opacity-40"
//                                 />
//                                 <span>Create</span>
//                               </label>
//                             </div>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Save */}
//         <div className="flex justify-end py-6">
//           {activeModIds.length > 0 && (
//             <button
//               onClick={isEdit ? UpdateRoleModule : CreateRoleModule}
//               className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
//             >
//               {isEdit ? "Update role" : "Save role"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



// src/pages/Roles/Roles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useCreateRoleModuleMutation,
  useGetPermissionsQuery,
  useGetRolesModulesQuery,
  useUpdateRoleModuleMutation,
} from "../../redux/permissionModule/permissionModuleApi";
import toast from "react-hot-toast";
import { Loader } from "../../Components";

const slug = (s = "") =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Roles() {
  const location = useLocation();
  const isEdit = location.pathname === "/roles/select-update";
  const isRolepath = location.pathname === "/roles";

  // APIs
  const {
    data: permissions,
    error: permissionsError,
    isLoading: permissionsLoading,
  } = useGetPermissionsQuery();
  const { data: rolesData } = useGetRolesModulesQuery();
  const [createRoleModule, { error, isLoading }] = useCreateRoleModuleMutation();
  const [updateRoleModule, { error: updateError, isLoading: updateLoading }] =
    useUpdateRoleModuleMutation();

  const parentData = rolesData?.data || [];

  // ---------- Build MODULES / PERMISSIONS from API ----------
  const { MODULES, PERMISSIONS } = useMemo(() => {
    const modules = [];
    const byModule = {};

    (permissions?.data || []).forEach((section) => {
      const modSlug = slug(section.name);
      const modIdReal = section.moduleId ?? section._id ?? section.id; // real backend id

      const modObj = {
        id: modSlug, // UI key (slug)
        label: section.name, // module name
        moduleId: modIdReal, // real id (for payload/prefill)
      };
      modules.push(modObj);

      byModule[modSlug] = (section.components || []).map((c) => ({
        id: slug(c.name), // UI key (slug)
        label: c.name, // component name
        componentId: c.componentId ?? c._id ?? c.id, // real id
        allow: new Set(c.permissions || []), // <- dynamic allowed perms from API
      }));
    });

    return { MODULES: modules, PERMISSIONS: byModule };
  }, [permissions]);

  // ✅ lookup maps (real ids -> slugs) for correct PREFILL
  const MODULE_BY_ID = useMemo(() => {
    const map = {};
    MODULES.forEach((m) => {
      map[m.moduleId] = m.id;
    });
    return map;
  }, [MODULES]);

  const COMPONENT_BY_ID = useMemo(() => {
    const map = {};
    Object.entries(PERMISSIONS).forEach(([modSlug, comps]) => {
      map[modSlug] = {};
      comps.forEach((c) => {
        map[modSlug][c.componentId] = c.id;
      });
    });
    return map;
  }, [PERMISSIONS]);

  // ---------- Defaults (dynamic; based on API allowed perms) ----------
  const { initialEnabled, initialPerms } = useMemo(() => {
    const en = {};
    const pr = {};
    Object.entries(PERMISSIONS).forEach(([mod, comps]) => {
      comps.forEach((c) => {
        const compKey = `${mod}.${c.id}`;
        // default ON for component; change to false if you prefer OFF-by-default
        en[compKey] = true;
        // seed only allowed permission keys (dynamic)
        [...c.allow].forEach((p) => {
          // default ON for perms; change to false if you prefer unchecked initially
          pr[`${compKey}.${p}`] = true;
        });
      });
    });
    return { initialEnabled: en, initialPerms: pr };
  }, [PERMISSIONS]);

  // ---------- State ----------
  const [roleName, setRoleName] = useState("");
  const [parentRole, setParentRole] = useState("");
  const [parentRoleId, setParentRoleId] = useState("");
  const [selectedModules, setSelectedModules] = useState({}); // { [modSlug]: true }
  const [enabled, setEnabled] = useState({});
  const [perms, setPerms] = useState({});
  const [roleId, setRoleId] = useState("");

  // seed maps when API changes (create defaults)
  useEffect(() => {
    setEnabled(initialEnabled);
    setPerms(initialPerms);
  }, [initialEnabled, initialPerms]);

  // ✅ sahi prefill (IDs -> slugs) + dynamic keys
  useEffect(() => {
    const role = location.state?.role; // AllRoles se aaya
    if (!isEdit || !role) return;

    setRoleId(role?._id || role?.id || "");
    setRoleName(role.roleName || "");
    setParentRole(role.parentRole?.roleName ?? "");
    setParentRoleId(role.parentRole?._id || role.parentRole?.id || "");

    const nextSelectedModules = {};
    const nextEnabled = {};
    const nextPerms = {};

    (role.permissions || []).forEach((pm) => {
      const modSlug = MODULE_BY_ID[pm.moduleId];
      if (!modSlug) return;

      nextSelectedModules[modSlug] = true;

      (pm.components || []).forEach((c) => {
        const compSlug = COMPONENT_BY_ID[modSlug]?.[c.componentId];
        if (!compSlug) return;

        const compKey = `${modSlug}.${compSlug}`;
        nextEnabled[compKey] = true;

        // mark whatever backend sent
        (c.permissions || []).forEach((p) => {
          nextPerms[`${compKey}.${p}`] = true;
        });
      });
    });

    // Ensure baqi allowed keys bhi present (false) so toggles render correctly
    Object.keys(PERMISSIONS).forEach((modSlug) => {
      (PERMISSIONS[modSlug] || []).forEach((c) => {
        const compKey = `${modSlug}.${c.id}`;
        if (!(compKey in nextEnabled)) nextEnabled[compKey] = false;

        [...c.allow].forEach((p) => {
          const key = `${compKey}.${p}`;
          if (!(key in nextPerms)) nextPerms[key] = false;
        });
      });
    });

    setSelectedModules(nextSelectedModules);
    setEnabled(nextEnabled);
    setPerms(nextPerms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, JSON.stringify(location.state?.role), MODULE_BY_ID, COMPONENT_BY_ID, PERMISSIONS]);

  // ---------- Derived ----------
  const activeModIds = useMemo(
    () => Object.keys(selectedModules).filter((k) => selectedModules[k]),
    [selectedModules]
  );

  // Handlers
  const toggleModule = (modId) =>
    setSelectedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

  const togglePerm = (permKey) => {
    setPerms((prev) => {
      const next = { ...prev, [permKey]: !prev[permKey] };
      // compKey is "modId.compId"
      const compKey = permKey.split(".").slice(0, 2).join(".");
      const [modId, compId] = compKey.split(".");
      const comp = (PERMISSIONS[modId] || []).find((x) => x.id === compId);
      const allowed = comp ? [...comp.allow] : [];
      const anyOn = allowed.some((p) => !!next[`${compKey}.${p}`]);
      setEnabled((e) => ({ ...e, [compKey]: anyOn }));
      return next;
    });
  };

  const toggleComponent = (modId, compId) => {
    const k = `${modId}.${compId}`;
    const next = !enabled[k];
    setEnabled((e) => ({ ...e, [k]: next }));
    setPerms((p) => {
      const comp = (PERMISSIONS[modId] || []).find((x) => x.id === compId);
      const allowed = comp ? [...comp.allow] : [];
      const updates = {};
      allowed.forEach((perm) => {
        updates[`${k}.${perm}`] = next ? (p[`${k}.${perm}`] ?? false) : false;
      });
      return { ...p, ...updates };
    });
  };

  //   // ---------- UI classes ----------
  const pillBase =
    "rounded-xl border px-4 py-2 text-sm transition shadow-sm";
  const pillSelected =
    "border-purple-300 bg-white ring-2 ring-purple-200 text-purple-700";
  const pill = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";

  const CreateRoleModule = async () => {
    try {
      if (roleName === "" || parentRole === "") {
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

              // collect only allowed + checked perms (dynamic)
              const picked = [...c.allow].filter(
                (k) => perms[`${compKey}.${k}`]
              );

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
        roleName: roleName,
        parentRole: parentRoleId,
        permissions: permissionsArray,
      };

      const result = await createRoleModule(newPayload);
      if (result?.error) {
        toast.error(result.error?.data?.message || "An error occurred");
      } else {
        toast.success("Role created successfully");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // update role
  const UpdateRoleModule = async () => {
    const modules = activeModIds;

    const permissionsArray = modules
      .map((modId) => {
        const modMeta = MODULES.find((m) => m.id === modId);
        const comps = PERMISSIONS[modId] || [];

        const selectedComponents = comps
          .map((c) => {
            const compKey = `${modId}.${c.id}`;
            if (!enabled[compKey]) return null;

            const picked = [...c.allow].filter(
              (k) => perms[`${compKey}.${k}`]
            );
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
      id: roleId,
      roleName: roleName,
      parentRole: parentRoleId === "" ? null : parentRoleId,
      permissions: permissionsArray,
    };
    const response = await updateRoleModule(newPayload);
    if (response?.error) {
      toast.error(response.error?.data?.message || "An error occurred");
    } else {
      toast.success("Role updated successfully");
    }
  };

  // Optional: clear form when landing on /roles page (keep commented if not needed)
  // useEffect(() => {
  //   if (!isRolepath) return;
  //   setRoleName("");
  //   setParentRole("");
  //   setSelectedModules({});
  //   setEnabled({});
  //   setPerms({});
  // }, [isRolepath]);

  if (permissionsLoading) {
    return (
      <>
        <Loader
          show={permissionsLoading}
          fullscreen
          overlay
          variant="spinner" // 'spinner' | 'dots' | 'bar'
          text="Data Loading..."
        />
      </>
    );
  }

  if (permissionsError) {
    console.error(permissionsError);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-2xl font-bold text-[#1E1C28]">
            Role & Permissions
          </h1>
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
              onChange={(e) => {
                const name = e.target.value; // selected name
                const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                setParentRole(name);
                setParentRoleId(id);
              }}
              className="appearance-none w-48 rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select parent role</option>
              {parentData?.map((p) => (
                <option key={p._id || p.id} value={p.roleName} data-id={p._id || p.id}>
                  {p.roleName}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Module multi-select chips */}
        <div className="rounded-2xl mt-3 bg-white py-12 px-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-2xl font-bold text-[#1E1C28]">Select modules</h2>
          <p className="mt-1 text-lg font-semibold text-[#1E1C28B2]">
            Please select your roles
          </p>

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
              const modLabel =
                MODULES.find((m) => m.id === modId)?.label || modId;
              const comps = PERMISSIONS[modId] || [];
              return (
                <div
                  key={modId}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {modLabel}
                    </h3>
                    <button
                      onClick={() => toggleModule(modId)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {comps.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No components.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {comps.map((c) => {
                        const compKey = `${modId}.${c.id}`;
                        const isOn = !!enabled[compKey];

                        return (
                          <li
                            key={c.id}
                            className="grid grid-cols-1 items-center gap-3 px-2 py-3 sm:grid-cols-2"
                          >
                            {/* Component toggle */}
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isOn}
                                onChange={() => toggleComponent(modId, c.id)}
                                className="h-4 w-4 rounded border-gray-300 accent-purple-600"
                              />
                              <span className="text-sm text-gray-800">
                                {c.label}
                              </span>
                            </label>

                            {/* Dynamic permissions (from API) */}
                            <div className="flex flex-wrap items-center gap-6">
                              {[...c.allow].map((p) => {
                                const key = `${compKey}.${p}`;
                                return (
                                  <label
                                    key={key}
                                    className="inline-flex items-center gap-2 text-sm text-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!!perms[key]}
                                      onChange={() => togglePerm(key)}
                                      disabled={!isOn}
                                      className="h-4 w-4 rounded border-gray-300 accent-purple-600 disabled:opacity-40"
                                    />
                                    <span className="capitalize">{p}</span>
                                  </label>
                                );
                              })}
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
              onClick={isEdit ? UpdateRoleModule : CreateRoleModule}
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
