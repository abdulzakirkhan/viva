// import React, { useMemo, useState } from "react";
// import { Update } from "../../assets/svgs";
// import { useNavigate } from "react-router-dom";
// import { useGetRolesModulesQuery } from "../../redux/permissionModule/permissionModuleApi";






// const AllRoles = () => {
//   const [query, setQuery] = useState("");
//   const navigate=useNavigate()


//   // mutations hooks and query
//   const { data: rolesData } = useGetRolesModulesQuery();

//   const roles = rolesData?.data || [
//     { id: "manager-limited", roleName: "Manager Limited Access" },
//     { id: "ess-user", roleName: "ESS User" },
//     { id: "hr-manager-limited", roleName: "HR Manager (Limited Access)" },
//     { id: "manager", roleName: "Manager" },
//     { id: "sysadmin", roleName: "System Administrator (Full Access)" },
//   ];



//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return roles;
//     return roles?.filter((r) => r?.roleName.toLowerCase().includes(q));
//   }, [query, roles]);



//   const onEdit = (r) => {
//      console.log("role to update :",r)
//       navigate("/roles/select-update",{
//       state: r,
//     })
//   }

//   return (
//     <div className="min-h-screen bg-[#F5F7F9]">
//       <div className="mx-auto max-w-6xl px-6 py-6">
//         {/* Page header */}
//         <div className="mb-4 flex items-center justify-between gap-4">
//           <h1 className="text-lg font-semibold text-gray-900">All Roles</h1>

//           <div className="relative w-56">
//             <input
//               type="search"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name"
//               aria-label="Search roles by name"
//               className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 outline-none shadow-sm transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
//             />
//             {/* optional search icon */}
//             <svg
//               className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//               aria-hidden="true"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M12.9 14.32a7 7 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//         </div>

//         {/* Card table */}
//         <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-100">
//               <thead>
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
//                     Role Name
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {filtered.map((role) => (
//                   <tr key={role?.roleName || role?._id} className="hover:bg-gray-50/60">
//                     <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
//                       {role?.roleName}
//                     </td>
//                     <td className="whitespace-nowrap px-6 py-3 text-right">
//                       <button
//                         type="button"
//                         onClick={() => onEdit(role)}
//                         className="inline-flex cursor-pointer h-6 w-6 items-center justify-center rounded-md text-purple-600 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
//                         aria-label={`Edit ${role?.roleName}`}
//                         title="Edit role"
//                       >
//                         <img src={Update} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}

//                 {filtered.length === 0 && (
//                   <tr>
//                     <td
//                       className="px-6 py-6 text-center text-sm text-gray-500"
//                       colSpan={2}
//                     >
//                       No roles found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllRoles;


// src/pages/Roles/AllRoles.jsx
import React, { useMemo, useState } from "react";
import { Update } from "../../assets/svgs";
import { useNavigate } from "react-router-dom";
import { useGetRolesModulesQuery } from "../../redux/permissionModule/permissionModuleApi";
import { Loader } from "../../Components";

const AllRoles = () => {
  const [query, setQuery] = useState("");
  const navigate=useNavigate();

  const { data: rolesData, error: rolesError, isLoading: rolesLoading } = useGetRolesModulesQuery();
  
  const roles = rolesData?.data || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles?.filter((r) => r?.roleName.toLowerCase().includes(q));
  }, [query, roles]);

  const onEdit = (r) => {
    //  Roles.jsx me location.state.role
    navigate("/roles/select-update", { state: { role: r } });
  };


  
  if(rolesLoading){
    return(
    <>
      <Loader
        show={rolesLoading}
        fullscreen
        overlay
        variant="spinner"
        text="Loading..."
      />
    </>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page header */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900">All Roles</h1>

          <div className="relative w-56">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              aria-label="Search roles by name"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 outline-none shadow-sm transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
            />
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a7 7 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Card table */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((role) => (
                  <tr key={role?.roleName || role?._id} className="hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                      {role?.roleName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        className="inline-flex cursor-pointer h-6 w-6 items-center justify-center rounded-md text-purple-600 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        aria-label={`Edit ${role?.roleName}`}
                        title="Edit role"
                      >
                        <img src={Update} alt="Update"/>
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-gray-500" colSpan={2}>
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRoles;
