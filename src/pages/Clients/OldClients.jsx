// src/pages/Clients.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { ActionMenu, DataTable } from "../../Components";
import { Shape } from "../../assets/datatable";
import { useGetAllClientsQuery } from "../../redux/clientUser/clientUserApi";

// dummy data
const seed = [
  {
    id: 1,
    name: "Ahmed Ali",
    avatar: Shape,
    package: "Basic",
    email: "ahmed@egeeksglobal.com",
    remainingMocks: 4,
    remainingLive: 4,
    enabled: true,
  },
  {
    id: 2,
    name: "Muhammad Huzaifa",
    avatar: Shape,
    package: "Plus",
    email: "hizaifa@egeeksglobal.com",
    remainingMocks: 5,
    remainingLive: 5,
    enabled: true,
  },
  {
    id: 3,
    name: "Rehan Mazhar",
    avatar: Shape,
    package: "Pro",
    email: "meer@egeeksglobal.com",
    remainingMocks: 7,
    remainingLive: 7,
    enabled: true,
  },
  {
    id: 4,
    name: "Meer Hazar",
    avatar: Shape,
    package: "Enterprise",
    email: "umer@egeeksglobal.com",
    remainingMocks: 4,
    remainingLive: 4,
    enabled: true,
  },
  {
    id: 5,
    name: "Meer Hazar",
    avatar: Shape,
    package: "Pro",
    email: "rehan@egeeksglobal.com",
    remainingMocks: 2,
    remainingLive: 2,
    enabled: true,
  },
];

// icons
const DotsIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <circle cx="10" cy="4" r="1.6" />
    <circle cx="10" cy="10" r="1.6" />
    <circle cx="10" cy="16" r="1.6" />
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.25 8.39a.75.75 0 0 1-.02-1.18z" />
  </svg>
);

// click-outside helper
function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      onOutside?.();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

const Clients = () => {
  const { data: clientsData,error: clientsError, isLoading: clientsLoading, } =useGetAllClientsQuery();

  console.log("clientsData :",clientsData?.data);
  
  const [rows, setRows] = useState(seed);
  const [emailQuery, setEmailQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null); // row action menu
  const [statusFilter, setStatusFilter] = useState("all"); // all|enabled|disabled

  const filterRef = useRef(null);
  const menuRef = useRef(null);

  useClickOutside(filterRef, () => setFilterOpen(false));
  useClickOutside(menuRef, () => setMenuOpenId(null));

  const filtered = useMemo(() => {
    const q = emailQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const qOk = q ? r.email.toLowerCase().includes(q) : true;
      const sOk =
        statusFilter === "all"
          ? true
          : statusFilter === "enabled"
          ? r.enabled
          : !r.enabled;
      return qOk && sOk;
    });
  }, [rows, emailQuery, statusFilter]);

  function toggleEnabled(id, next) {
    setRows((old) =>
      old.map((r) => (r.id === id ? { ...r, enabled: next ?? !r.enabled } : r))
    );
    setMenuOpenId(null);
  }

  const columns = [
    {
      key: "name",
      header: "Client Name",
      thClass: "w-[260px]",
      render: (row) => (
        <div className="flex justify-items-center items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="h-14 w-14 border-2 border-red-50 rounded-full object-cover"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{row.name}</span>
            {/* {!row.enabled && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                Disabled
              </span>
            )} */}
          </div>
        </div>
      ),
    },
    { key: "package", header: "Package" },
    { key: "email", header: "Email", thClass: "min-w-[220px]" },
    {
      key: "remainingMocks",
      header: "Remaining Mocks",
      tdClass: "text-center",
      thClass: "text-center",
    },
    {
      key: "remainingLive",
      header: "Remaining Live",
      tdClass: "text-center",
      thClass: "text-center",
    },
    {
      key: "actions",
      header: "Actions",
      thClass: "text-right",
      tdClass: "text-right",
      render: (row) => (
        <ActionMenu
            open={menuOpenId === row.id}
            onOpenChange={(o) => setMenuOpenId(o ? row.id : null)}
            outerClassName="relative inline-block"
            triggerClassName="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C4EDC] p-2 text-violet-600 hover:bg-violet-50"
            items={[
            { label: "Enable", onClick: () => toggleEnabled(row.id, true), show: row.enabled },
            { label: "Disable", onClick: () => toggleEnabled(row.id, false), show: row.enabled },
            ]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-md lg:text-lg font-semibold text-gray-900">All Clients</h1>

        {/* Filters */}
        <div className="relative" ref={filterRef}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Filters</span>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
            >
              By email <ChevronDown />
            </button>
          </div>

          {filterOpen && (
            <div className="absolute right-0 z-20 mt-2 w-[200px] lg:w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
              <label className="block text-xs font-medium text-gray-600">
                Search by email
              </label>
              <input
                type="text"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                placeholder="e.g. ahmed@..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
                >
                  <option value="all">All</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    setEmailQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </button>
                <button
                  className="rounded-md bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700"
                  onClick={() => setFilterOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* table */}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey="id"
        rowClassName={(r) => (!r.enabled ? "opacity-60" : "")}
      />

      {/* empty state */}
      {filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          No clients found.
        </p>
      )}
    </div>
  );
};

export default Clients;
