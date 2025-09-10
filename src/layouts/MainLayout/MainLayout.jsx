import React, { useState } from "react";
import { Header, Sidebar } from "../../Components";

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Desktop / tablet layout */}
      <div className="flex">
        <aside className="hidden md:block border-0">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar (off-canvas) */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] transform bg-white shadow-xl transition-transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </div>
  );
}
