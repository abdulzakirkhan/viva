

import React, { useMemo, useRef, useState, useEffect } from "react";
import { ActionMenu, AvatarInitial, DataTable, Loader } from "../../Components";
import { useBlockClientMutation, useGetAllClientsQuery } from "../../redux/clientUser/clientUserApi";
import toast from "react-hot-toast";

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

function clampNonNeg(n) {
  return Math.max(0, Number.isFinite(n) ? n : 0);
}

const Clients = () => {
  // top of Clients component
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 5/10/20 etc.
  
  //rtk query hooks 
  const [blockClient, { error: blockError,isLoading: blockLoading }] = useBlockClientMutation();
  const {
    data: clientsData,
    error: clientsError,
    isLoading: clientsLoading,
    isFetching,
    refetch,
  } = useGetAllClientsQuery();

  // Local rows state to allow UI toggles (enable/disable) without API yet
  const [rows, setRows] = useState([]);
 
  // Map API -> table rows whenever data changes
  useEffect(() => {
    const apiRows = (clientsData?.data ?? []).map((u) => {
      const pkg = u.packageId || {};
      const remainingLive = clampNonNeg(u?.remaining?.liveMinutesRemaining ?? 0);
      const remainingMocks = clampNonNeg(u?.remaining?.mockMinutesRemaining ?? 0);

      const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
      return {
        id: u._id,
        name: fullName || u.email,
        // avatar: u.avatarUrl && u?.avatarUrl ,
        package: pkg.name || "—",
        email: u.email,
        remainingMocks,
        remainingLive,
        enabled: u.status !== "blocked",
        _raw: u,
      };
    });
    setRows(apiRows);
  }, [clientsData]);

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
      const qOk = q ? r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) : true;
      const sOk =
        statusFilter === "all" ? true : statusFilter === "enabled" ? r.enabled : !r.enabled;
      return qOk && sOk;
    });
  }, [rows, emailQuery, statusFilter]);

  async function blockUser(id, next) {
    try {
      const payload = { id }; 
      const res = await blockClient(payload).unwrap();
      console.log("res : ", res);
      if(res?.message === 'User blocked successfully'){
        toast.success(res?.message ||"Client blocked successfully.");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update client status.");
    }
  }


  const activateUser = () =>{
    toast.error("Activate user not implemented yet.");
  }

 

  const columns = [
    {
      key: "name",
      header: "Client Name",
      thClass: "w-[260px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row?.avatar ? (
            <img
              src={row?.avatar}
              alt={row.name}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <>
              <AvatarInitial name={row?.name} className="w-8 h-8" />
              {/* <h1>Hi</h1> */}
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{row.name}</span>
            {!row?.enabled  && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                Blocked
              </span>
            )}
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
        <div ref={menuRef}>
          <ActionMenu
           closeOnBlur={false}
            open={menuOpenId === row.id}
            onOpenChange={(o) => setMenuOpenId(o ? row.id : null)}
            outerClassName="relative inline-block"
            triggerClassName="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C4EDC] text-violet-600 hover:bg-violet-50"
            items={[
              // { label: "Activate", onClick: () => activateUser(row.id, true), show: !row.enabled },
              { label: "Block", onClick: () => blockUser(row.id, false), show: row.enabled },
            ]}
          />
        </div>
      ),
    },
  ];


  // paginations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paged = filtered.slice(startIdx, endIdx);
  useEffect(() => {
    setPage(1);
  }, [emailQuery, statusFilter, rows]);


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
                  <option value="enabled">Active</option>
                  <option value="disabled">Blocked</option>
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

      {/* loading / error */}
      {clientsLoading && <Loader />}

      {/* table */}
      {!clientsLoading && !clientsError && (
        <>
          <DataTable
            columns={columns}
            data={paged}
            rowKey="id"
            rowClassName={(r) => (!r.enabled ? "opacity-60" : "")}
            avatar={true}
          />
        </>
      )}
      {total > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{total ? startIdx + 1 : 0}</span>–
            <span className="font-medium">{Math.min(endIdx, total)}</span> of{" "}
            <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
              aria-label="Rows per page"
            >
              {/* {[5,10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)} */}
              {[10,20,50].map(n => <option key={n} value={n}>{n > 20 ? "All" : n}</option>)}
            </select>

            <div className="flex items-center gap-1">
              <button
                className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="px-2 text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
