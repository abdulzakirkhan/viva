// import { useSelector } from "react-redux";
// import { Avatar, I, Notification, SearchIcon } from "../../assets/svgs";
// import AvatarInitial from "../AvatarInitial/AvatarInitial";
// import { useState } from "react";

// export default function Header({ onMenuClick }) {
//   const onSearch = (value) => console.log("value:", value);
//   const user = useSelector((state) => state.auth.user);
//   const [openUserMenu, setOpenUserMenu] = useState(false)
  
//   // header behavior classes
//   const headerClasses="sticky top-0"
//   return (
//     <header className="w-full bg-white z-30">
//       <div className="w-full mx-auto lg:max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
//         <div className="flex items-center gap-2 sm:gap-3 py-2 md:py-3">
//           {/* Mobile hamburger */}
//           <button
//             className="md:hidden grid h-10 w-10 place-items-center rounded-lg bg-[#F5F7F9] text-gray-600 ring-1 ring-transparent hover:ring-gray-200"
//             onClick={onMenuClick}
//             aria-label="Open menu"
//           >
//             <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>

//           {/* Search */}
//           <div className="flex-1">
//             <label className="relative block h-10 sm:h-12 md:h-14 w-full sm:max-w-[420px] md:max-w-[474px]">
//               <span className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
//                 <img src={SearchIcon} alt="" className="h-4 w-4" />
//               </span>
//               <input
//                 type="search"
//                 placeholder="Search assets"
//                 onChange={(e) => onSearch(e.target.value)}
//                 className="w-full rounded-xl h-full bg-[#F5F7F9] pl-10 sm:pl-12 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none ring-1 ring-transparent focus:bg-gray-100 focus:ring-gray-200"
//               />
//             </label>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-1 sm:gap-2">
//             <button
//               className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#F5F7F9] text-gray-500 hover:bg-gray-200 transition ring-1 ring-transparent hover:ring-gray-200"
//               aria-label="Info"
//             >
//               <img src={I} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
//             </button>

//             <button
//               className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#F5F7F9] text-gray-500 hover:bg-gray-200 transition ring-1 ring-transparent hover:ring-gray-200"
//               aria-label="Notifications"
//             >
//               <img src={Notification} alt="" className="h-4 w-5 sm:h-5 sm:w-5" />
//             </button>

//             {/* User */}
//             <div className="flex items-center gap-2 sm:gap-3 pl-1 cursor-pointer" onClick={()=>setOpenUserMenu(!openUserMenu)}>
//               <AvatarInitial name={user.name} className="w-12 h-12" />
//               <div className="hidden sm:block leading-tight">
//                 <p className="text-sm font-medium text-gray-900">{user.name}</p>
//                 <p className="text-xs text-gray-500">{user.email}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }



import { useDispatch, useSelector } from "react-redux";
import { Avatar, I, Notification, SearchIcon } from "../../assets/svgs";
import AvatarInitial from "../AvatarInitial/AvatarInitial";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react"; // lucide-react se icons
import ChangePasswordModal from "../ChangePasswordModal/ChangePasswordModal";
import { logOut } from "../../redux/auth/authSlice";
export default function Header({ onMenuClick }) {
  const [openSettings, setOpenSettings] = useState(false);
  const onSearch = (value) => console.log("value:", value);
  const user = useSelector((state) => state.auth.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logOut())
  }
  // close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white z-30">
      <div className="w-full mx-auto lg:max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 py-2 md:py-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden grid h-10 w-10 place-items-center rounded-lg bg-[#F5F7F9] text-gray-600 ring-1 ring-transparent hover:ring-gray-200"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1">
            <label className="relative block h-10 sm:h-12 md:h-14 w-full sm:max-w-[420px] md:max-w-[474px]">
              <span className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                <img src={SearchIcon} alt="" className="h-4 w-4" />
              </span>
              <input
                type="search"
                placeholder="Search assets"
                onChange={(e) => onSearch(e.target.value)}
                className="w-full rounded-xl h-full bg-[#F5F7F9] pl-10 sm:pl-12 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none ring-1 ring-transparent focus:bg-gray-100 focus:ring-gray-200"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 relative" ref={menuRef}>
            <button
              className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#F5F7F9] text-gray-500 hover:bg-gray-200 transition ring-1 ring-transparent hover:ring-gray-200"
              aria-label="Info"
            >
              <img src={I} alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#F5F7F9] text-gray-500 hover:bg-gray-200 transition ring-1 ring-transparent hover:ring-gray-200"
              aria-label="Notifications"
            >
              <img src={Notification} alt="" className="h-4 w-5 sm:h-5 sm:w-5" />
            </button>

            {/* User */}
            <div
              className="flex items-center gap-2 sm:gap-3 pl-1 cursor-pointer"
              onClick={() => setOpenUserMenu(!openUserMenu)}
            >
              <AvatarInitial name={user?.name || "U"} className="w-12 h-12" />
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {openUserMenu && (
              <div className="absolute right-0 top-14 mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-40">
                <button className="flex cursor-pointer w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button onClick={() => {
                    setOpenUserMenu(false);
                    setOpenSettings(true);
                }} className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  className="flex cursor-pointer w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Settings Modal */}
      <ChangePasswordModal open={openSettings} onClose={() => setOpenSettings(false)} />
    </header>
  );
}
