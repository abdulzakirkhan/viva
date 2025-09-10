// import React from "react";

// const rows = [
//   { name: "Ahmed Ali", email: "ahmed.ali@geekaglobal.com", role: "TL" },
//   { name: "Muzammil Hussain", email: "muzammil@geekaglobal.com", role: "PHP Lead" },
//   { name: "Syed Mazhar", email: "rehan@geekaglobal.com", role: "Admin" },
//   { name: "Malik Saad", email: "saad@geekaglobal.com", role: "Developer" },
//   { name: "Hamza Azhar", email: "hamza@geekaglobal.com", role: "AI" },
// ];

// function UsersList({ data = rows }) {
  
//   return (
//     <div className="min-h-screen bg-[#F5F7F9]">
//       <div className="mx-auto max-w-6xl px-6 py-6">
//         {/* Header */}
//         <div className="mb-4 flex items-center justify-between">
//           <h1 className="text-lg font-semibold text-gray-900">Add User list</h1>

//           <div className="relative">
//             <select
//               className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
//               defaultValue=""
//               aria-label="Select parent role"
//             >
//               <option value="" disabled>
//                 Select parent role
//               </option>
//               <option>Administrator</option>
//               <option>Manager</option>
//               <option>Staff</option>
//             </select>
//             <svg
//               className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//               aria-hidden="true"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//         </div>

//         {/* Table card */}
//         <div className="rounded-2xl bg-[#FFFFFF]">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-100">
//               <thead className="bg-[#FFFFFF]">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                     Role
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 bg-[#FFFFFF]">
//                 {data.map((u, i) => (
//                   <tr key={i} className="hover:bg-gray-50/60">
//                     <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
//                       {u.name}
//                     </td>
//                     <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
//                       {u.email}
//                     </td>
//                     <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-800">
//                       {u.role}
//                     </td>
//                   </tr>
//                 ))}
//                 {data.length === 0 && (
//                   <tr>
//                     <td
//                       className="px-6 py-6 text-center text-sm text-gray-500"
//                       colSpan={3}
//                     >
//                       No users found.
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
// }

// export default UsersList;


import { useNavigate } from "react-router-dom";
import { useGetAllUserListingQuery } from "../../redux/adminUserModule/adminUserModuleApi";
import { Loader } from "../../Components";

function UsersList() {
  const { data, isLoading, error  } = useGetAllUserListingQuery();
  const rows = data || [];

  const navigate = useNavigate()

  const handleNavigateToUserDetails = (userId) => {
    navigate(`/users/details/${userId}`);
  }

  if(isLoading) {
    return <Loader />
  }
  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">User Listing</h1>

          <div className="relative">
            <select
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
              defaultValue=""
              aria-label="Select parent role"
            >
              <option value="" disabled>
                Select parent role
              </option>
              <option>Administrator</option>
              <option>Manager</option>
              <option>Staff</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl bg-[#FFFFFF]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {error && (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-sm text-red-500">
                      Failed to load users.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  rows?.map((u) => (
                    <tr key={u?._id} className="hover:bg-gray-50/60" onClick={() => handleNavigateToUserDetails(u?._id)} style={{ cursor: 'pointer' }}>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                        {u?.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                        {u?.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-800">
                        {u?.role === null ? "N/A" : u?.role?.roleName}
                      </td>
                    </tr>
                  ))}

                {!isLoading && !error && rows?.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-6 text-center text-sm text-gray-500"
                      colSpan={3}
                    >
                      No users found.
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
}

export default UsersList;
