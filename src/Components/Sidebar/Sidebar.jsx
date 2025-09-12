// import React, { useEffect, useMemo, useState } from "react";
// import { Graph, list, Logo, Square, UsersIcon } from "../../assets/svgs";
// import { NavLink, useLocation } from "react-router-dom";
// import { useGetPermissionsQuery } from "../../redux/permissionModule/permissionModuleApi";

// /* ---------------- Icons ---------------- */
// const Icon = {
//   grid: (cls = "") => (
//     <svg viewBox="0 0 24 24" className={`h-5 w-5 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
//       <rect x="3" y="3" width="7" height="7" rx="1.5" />
//       <rect x="14" y="3" width="7" height="7" rx="1.5" />
//       <rect x="14" y="14" width="7" height="7" rx="1.5" />
//       <rect x="3" y="14" width="7" height="7" rx="1.5" />
//     </svg>
//   ),
//   users: () => <img src={UsersIcon} alt="Users" className="w-7 h-7" />,
//   userPlus: (cls = "") => (
//     <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
//       <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
//       <circle cx="9" cy="7" r="4" />
//       <path d="M19 8v6M16 11h6" />
//     </svg>
//   ),
//   list: () => <img src={list} className="w-5 h-5" alt="" />,
//   report: () => <img src={Graph} alt="Report" className="w-5 h-5" />,
//   api: () => <img src={Square} alt="API" className="w-5 h-5" />,
//   cog: (cls = "") => (
//     <svg viewBox="0 0 24 24" className={`h-5 w-5 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
//       <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
//       <path d="M19.4 15a1.6 1.6 0 0 0 .39 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.88-.39 1.6 1.6 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1-1.51 1.6 1.6 0 0 0-1.88.39l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15c-.86 0-1.55-.67-1.6-1.52V13a2 2 0 1 1 0-2v-.48c.05-.85.74-1.52 1.6-1.52a1.6 1.6 0 0 0 1.51-1L6.7 6.4A2 2 0 1 1 9.53 3.6l.06.06c.54.41 1.2.64 1.88.64s1.34-.23 1.88-.64l.06-.06A2 2 0 1 1 16.7 6.4l.09.1c.25.41.62.74 1.05.94.43.2.91.31 1.4.31" />
//     </svg>
//   ),
//   chevron: (open, cls = "") => (
//     <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""} ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M6 9l6 6 6-6" />
//     </svg>
//   ),
// };

// /* ---------------- helpers (map API -> MENU) ---------------- */
// const slug = (s = "") =>
//   s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// const SECTION_ICON = {
//   "Users": Icon.users,
//   "Clients": Icon.users,
//   "Role & Permissions": Icon.cog,
// };

// const ROUTE_MAP = {
//   // Users
//   "Users|Add User":  { to: "/users/add",  label: "Add User",     icon: Icon.userPlus },
//   "Users|All Users": { to: "/users/list", label: "User listing", icon: Icon.userPlus },
//   // Backend currently sends "All Roles" under Users → map it to users list
//   "Users|All Roles": { to: "/users/list", label: "User listing", icon: Icon.userPlus },

//   // Clients
//   "Clients|All Clients": { to: "/all-clients", label: "All Clients", icon: Icon.userPlus },
//   "Clients|Feedbacks": { to: "/feedbacks", label: "Feedbacks", icon: Icon.userPlus },
//   "Clients|Feedbacks Reports": { to: "/feedbacks-csv", label: "Feedbacks Reports", icon: Icon.userPlus },

//   // Role & Permissions
//   "Role & Permissions|Create Role & Permission": {
//     to: "/roles",
//     label: "Create role & Permission",
//     icon: Icon.userPlus,
//   },
//   "Role & Permissions|All Roles": { to: "/all-roles", label: "All Roles", icon: Icon.userPlus },

//   "Packages|All Packages": { to: "/packages", label: "All Packages", icon: Icon.userPlus },
//   "Create Package": { to: "/packages/create-package", label: "Create Package", icon: Icon.userPlus },
// };

// const fallbackTo = (section, comp) => `/${slug(section)}/${slug(comp)}`;

// const buildMenuFromApi = (apiResponse) => {
//   const arr = apiResponse?.data || [];
//   return arr.map((section) => {
//     const sectionName = section.name;
//     const icon = SECTION_ICON[sectionName] ?? Icon.grid;

//     const children = (section.components || [])
//       .filter((c) => (c.permissions || []).includes("view"))
//       .map((c) => {
//         const key = `${sectionName}|${c.name}`;
//         const override = ROUTE_MAP[key];
//         return {
//           label: override?.label ?? c.name,
//           to: override?.to ?? fallbackTo(sectionName, c.name),
//           icon: override?.icon ?? Icon.userPlus,
//         };
//       });

//     return {
//       label: sectionName,
//       key: slug(sectionName),
//       icon,
//       ...(children.length ? { children } : {}),
//     };
//   });
// };

// /* ---------------- Component ---------------- */
// const Sidebar = () => {
//   const location = useLocation();
//   const [open, setOpen] = useState({});
//   const { data: permissions } = useGetPermissionsQuery();

//   // compute the dynamic key for Role & Permissions
//   const ROLE_KEY = slug("Role & Permissions");

//   // auto-open "Role & Permissions" when on /roles or /all-roles
//   useEffect(() => {
//     const inRoles =
//       location.pathname.startsWith("/roles") ||
//       location.pathname.startsWith("/all-roles");
//     if (inRoles) setOpen((s) => ({ ...s, [ROLE_KEY]: true }));
//   }, [location.pathname, ROLE_KEY]);

//   // alias: when editing, highlight All Roles
//   const isEditRoute = location.pathname === "/roles/select-update";
//   const aliasActiveFor = (to) => isEditRoute && to === "/all-roles";

//   // static leaf items
//   const STATIC_MENU = useMemo(
//     () => [
//       { label: "Dashboard", to: "/", icon: Icon.grid },
//       { label: "Packages", to: "/packages", icon: Icon.report },
//       { label: "Reports", to: "/reports", icon: Icon.report },
//       { label: "Sales", to: "/sales", icon: Icon.api },
//     ],
//     []
//   );

//   // dynamic sections from API
//   const DYNAMIC_MENU = useMemo(() => buildMenuFromApi(permissions), [permissions]);

//   // final MENU
//   const MENU = useMemo(() => [...STATIC_MENU, ...DYNAMIC_MENU], [STATIC_MENU, DYNAMIC_MENU]);

//   return (
//     <div className="!w-64 bg-[#FFFFFF] md:block h-[100vh] overflow-y-auto">
//       <div className="p-4 text-xl text-black">
//         <img src={Logo} alt="Logo" />
//       </div>

//       <nav className="px-3 pb-6 m-4">
//         <ul className="space-y-1">
//           {MENU.map((item) => {
//             const hasChildren = Array.isArray(item.children) && item.children.length > 0;

//             // Leaf item
//             if (!hasChildren) {
//               return (
//                 <li key={item.label} className="mb-3">
//                   <NavLink
//                     to={item.to}
//                     className={({ isActive }) =>
//                       [
//                         "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
//                         isActive
//                           ? "bg-[#F7EEFF] text-[#1E1C28] font-semibold"
//                           : "text-[#1E1C2866] font-semibold hover:bg-gray-50",
//                       ].join(" ")
//                     }
//                   >
//                     {({ isActive }) => (
//                       <>
//                         {item.icon(isActive ? "text-[#9C4EDC]" : "text-gray-400")}
//                         <span>{item.label}</span>
//                       </>
//                     )}
//                   </NavLink>
//                 </li>
//               );
//             }

//             // Section with children
//             const isOpen = !!open[item.key];
//             return (
//               <li key={item.label} className="mb-3">
//                 <button
//                   type="button"
//                   onClick={() => setOpen((s) => ({ ...s, [item.key]: !s[item.key] }))}
//                   className={[
//                     "group flex items-center justify-between rounded-xl px-3 py-2 text-sm w-full",
//                     isOpen ? "bg-purple-50 text-gray-900" : "text-gray-600 hover:bg-gray-50",
//                   ].join(" ")}
//                 >
//                   <span className="flex items-center gap-3">
//                     {item.icon(isOpen ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500")}
//                     <span className="font-medium">{item.label}</span>
//                   </span>
//                   {Icon.chevron(isOpen, "text-gray-400")}
//                 </button>

//                 {isOpen && (
//                   <ul className="mt-1 pl-5 space-y-1">
//                     {item.children.map((child) => {
//                       const base = "flex items-center gap-2 rounded-lg py-2 text-sm";
//                       const isExact = child.to === "/roles"; // only /roles should be exact

//                       return (
//                         <li key={child.label}>
//                           <NavLink
//                             to={child.to}
//                             end={isExact}
//                             className={({ isActive }) => {
//                               const active = isActive || aliasActiveFor(child.to);
//                               return [
//                                 base,
//                                 "text-[#1E1C2866] hover:bg-purple-50",
//                                 active ? "bg-purple-50 font-medium" : "",
//                               ].join(" ");
//                             }}
//                           >
//                             {({ isActive }) => {
//                               const active = isActive || aliasActiveFor(child.to);
//                               return (
//                                 <>
//                                   {!active ? child.icon("text-[#1E1C2866]") : <img src={list} className="w-5 h-5" alt="" />}
//                                   <span className={active ? "text-[#9C4EE2]" : "text-[#1E1C2866]"}>{child.label}</span>
//                                 </>
//                               );
//                             }}
//                           </NavLink>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;



// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Logo, UsersIcon, Graph, list, Square } from "../../assets/svgs";
import { useSelector } from "react-redux";

/* ---------------- Icons ---------------- */
const Icon = {
  grid: (cls = "") => (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  users: (cls = "") => <img src={UsersIcon} alt="Users" className={`w-7 h-7 ${cls}`} />,
  userPlus: (cls = "") => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  ),
  report: (cls = "") => <img src={Graph} alt="Report" className={`w-5 h-5 ${cls}`} />,
  list: (cls = "") => <img src={list} alt="List" className={`w-5 h-5 ${cls}`} />,
  api: (cls = "") => <img src={Square} alt="API" className={`w-5 h-5 ${cls}`} />,
  cog: (cls = "") => (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${cls}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .39 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.88-.39 1.6 1.6 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1-1.51 1.6 1.6 0 0 0-1.88.39l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15c-.86 0-1.55-.67-1.6-1.52V13a2 2 0 1 1 0-2v-.48c.05-.85.74-1.52 1.6-1.52a1.6 1.6 0 0 0 1.51-1L6.7 6.4A2 2 0 1 1 9.53 3.6l.06.06c.54.41 1.2.64 1.88.64s1.34-.23 1.88-.64l.06-.06A2 2 0 1 1 16.7 6.4l.09.1c.25.41.62.74 1.05.94.43.2.91.31 1.4.31" />
    </svg>
  ),
  chevron: (open, cls = "") => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""} ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

/* ---------------- Helpers ---------------- */
const slug = (s = "") =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const SECTION_ICON = {
  Users: Icon.users,
  Clients: Icon.users,
  "Role & Permissions": Icon.cog,
  Packages: Icon.report,
  Reports: Icon.report,
};


const ROUTE_MAP = {
  "Reports|Feed Back": { to: "/feedbacks-csv", label: "Feed Back", icon: Icon.userPlus },
  "Packages|All Packages": { to: "/packages", label: "All Packages", icon: Icon.userPlus },
  "Create Package": { to: "/packages/create-package", label: "Create Package", icon: Icon.userPlus },
  "Clients|Feedbacks": { to: "/feedbacks", label: "Feedbacks", icon: Icon.userPlus },
  "Audit|Feed Back": { to: "/feedbacks-csv", label: "Feed Back", icon: Icon.userPlus },
  "Audit|Package": { to: "/audit/packages", label: "Package", icon: Icon.userPlus },
  "Audit|Admin User": { to: "/audit/users", label: "Admin User", icon: Icon.userPlus },
  "Clients|All Clients": { to: "/all-clients", label: "All Clients", icon: Icon.userPlus },
  // "Clients|Feedbacks Reports": { to: "/feedbacks-csv", label: "Feedback Reports", icon: Icon.userPlus },
  "Users|Add User": { to: "/users/add", label: "Add User", icon: Icon.userPlus },
  "Users|All Roles": { to: "/users/list", label: "User Listing", icon: Icon.userPlus },
  "Role & Permissions|Create Role & Permission": { to: "/roles", label: "Create Role & Permission", icon: Icon.userPlus },
  "Role & Permissions|All Roles": { to: "/all-roles", label: "All Roles", icon: Icon.userPlus },
};

const fallbackTo = (section, comp) => `/${slug(section)}/${slug(comp)}`;

// updated to handle new API structure
const buildMenuFromApi = (role) => {
  const modules = role?.permissions || [];
  return modules.map((module) => {
    const sectionName = module.moduleName;
    const icon = SECTION_ICON[sectionName] ?? Icon.grid;

    const children = (module.components || [])
      .filter((c) => (c.permissions || []).includes("view"))
      .map((c) => {
        const key = `${sectionName}|${c.componentName}`;
        const override = ROUTE_MAP[key];
        return {
          label: override?.label ?? c.componentName,
          to: override?.to ?? fallbackTo(sectionName, c.componentName),
          icon: override?.icon ?? Icon.userPlus,
        };
      });

    return {
      label: sectionName,
      key: slug(sectionName),
      icon,
      ...(children.length ? { children } : {}),
    };
  });
};

/* ---------------- Component ---------------- */
const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState({});
  const user = useSelector((state) => state.auth.user);
  const permissions = user?.role; // now comes from user.role

  // auto-expand Role & Permissions section if on related route
  useEffect(() => {
    const isRoles = location.pathname.startsWith("/roles") || location.pathname.startsWith("/all-roles");
    if (isRoles) setOpen((s) => ({ ...s, [slug("Role & Permissions")]: true }));
  }, [location.pathname]);

  const dynamicMenu = useMemo(() => buildMenuFromApi(permissions), [permissions]);

  const staticMenu = useMemo(() => [{ label: "Dashboard", to: "/", icon: Icon.grid }], []);

  const MENU = useMemo(() => [...staticMenu, ...dynamicMenu], [staticMenu, dynamicMenu]);

  // sidebar height should be h-screen for the time being, otherwise 100vh causes issues on mobile
  return (
    <div className="w-64 bg-white md:block h-full overflow-y-auto">
      <div className="p-4 text-xl text-black">
        <img src={Logo} alt="Logo" />
      </div>

      <nav className="px-3 pb-6 m-4">
        <ul className="space-y-1">
          {MENU.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;

            if (!hasChildren) {
              return (
                <li key={item.label} className="mb-3">
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                        isActive ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.icon(isActive ? "text-purple-500" : "text-gray-400")}
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            }

            const isOpen = !!open[item.key];
            return (
              <li key={item.label} className="mb-3">
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [item.key]: !s[item.key] }))}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm w-full ${
                    isOpen ? "bg-purple-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon(isOpen ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500")}
                    <span className="font-medium">{item.label}</span>
                  </span>
                  {Icon.chevron(isOpen, "text-gray-400")}
                </button>

                {isOpen && (
                  <ul className="mt-1 pl-5 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <NavLink
                          to={child.to}
                          end
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg py-2 text-sm ${
                              isActive ? "bg-purple-50 font-medium" : "text-gray-600 hover:bg-purple-50"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {child.icon(isActive ? "text-purple-500" : "text-gray-400")}
                              <span>{child.label}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
