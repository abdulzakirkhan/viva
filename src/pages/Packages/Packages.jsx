// src/pages/Packages.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActionMenu, DataTable, Loader } from "../../Components";
import { useGetAllPackagesQuery } from "../../redux/packagesModule/packagesModuleApi";
import { useNavigate } from "react-router-dom";

// (optional) simple click-outside for action menu wrapper if you need it locally
function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

// price formatter
const priceLabel = (price, tier, duration) => {
  if (price === 0) return "$ 0";
  // monthly label if duration is in months (your API shows 1 or 12)
  return `$ ${price}${duration ? " /mo" : ""}`;
};

const Packages = () => {
  const menuRef = useRef(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // 🔌 RTK Query: fetch from backend
  const { data, error, isLoading, isFetching } = useGetAllPackagesQuery();

  // rows from API (fallback empty)
  const apiRows = useMemo(() => data?.data ?? [], [data]);

  // local state for optimistic UI (activate/deactivate)
  const [rows, setRows] = useState(apiRows);
  useEffect(() => {
    setRows(apiRows);
  }, [apiRows]);

  useClickOutside(menuRef, () => setMenuOpenId(null));

  // TODO: replace with real mutation when available
  const toggleActive = (_id, next) => {
    setRows((old) =>
      old.map((r) => (r._id === _id ? { ...r, isActive: next ?? !r.isActive } : r))
    );
    setMenuOpenId(null);
  };

  const navigate = useNavigate()

  const onEdit = (id) => {
    navigate(`/package/select-update/${id}`)
  }

  // const columns = [
  //   {
  //     key: "name",
  //     header: "Package Name",
  //     render: (row) => (
  //       <div className="flex items-center gap-2">
  //         <span className="text-gray-900 font-medium">{row.name}</span>
  //         <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 capitalize">
  //           {row.tier}
  //         </span>
  //         {!row.isActive && (
  //           <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
  //             Deactivated
  //           </span>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "price",
  //     header: "Price",
  //     render: (row) => (
  //       <span className="whitespace-nowrap">
  //         {priceLabel(row.price, row.tier, row.duration)}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "mockInterviews",
  //     header: "Total Mock",
  //     thClass: "text-start",
  //     tdClass: "text-start",
  //   },
  //   {
  //     key: "liveInterviews",
  //     header: "Live Sessions",
  //     thClass: "text-start",
  //     tdClass: "text-start",
  //   },
  //   {
  //     key: "totalLiveMinutes",
  //     header: "Live Minutes",
  //     thClass: "text-start",
  //     tdClass: "text-start",
  //   },
  //   {
  //     key: "default",
  //     header: "Created by",
  //     thClass: "text-start",
  //     tdClass: "text-start",
  //   },
  //   {
  //     key: "subscribersCount",
  //     header: "Subscribers",
  //     thClass: "text-start",
  //     tdClass: "text-start",
  //   },
  //   {
  //     key: "actions",
  //     header: "Actions",
  //     thClass: "text-right",
  //     tdClass: "text-right",
  //     render: (row) => (
  //       <div ref={menuRef}>
  //         <ActionMenu
  //           closeOnBlur={false}
  //           open={menuOpenId === row._id}
  //           onOpenChange={(o) => setMenuOpenId(o ? row._id : null)}
  //           outerClassName="relative inline-block"
  //           triggerClassName="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C4EDC] p-0 text-violet-600 hover:bg-violet-50"
  //           items={[
  //             {
  //               label: "Deactivate package",
  //               onClick: () => toggleActive(row._id, false),
  //               show: row.isActive,
  //             },
  //             {
  //               label: "Edit",
  //               onClick: () => onEdit(row._id),
  //               show: row.isActive,
  //             },
  //           ]}
  //         />
  //       </div>
  //     ),
  //   },
  // ];
  const columns = [
  {
    key: "name",
    header: "Package Name",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className="text-gray-900 font-medium">{row.name}</span>
        <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 capitalize">
          {row.tier}
        </span>
        {!row.isActive && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            Deactivated
          </span>
        )}
      </div>
    ),
  },
  {
    key: "price",
    header: "Price",
    render: (row) => (
      <span className="whitespace-nowrap">
        {row.name === "Enterprise" ? "On Demand" : priceLabel(row.price, row.tier, row.duration)}
      </span>
    ),
  },
  {
    key: "totalMockMinutes",
    header: "Total Mock",
    thClass: "text-start",
    tdClass: "text-start",
    render: (row) => (row.name === "Enterprise" ? "On Demand" : row.totalMockMinutes),
  },
  {
    key: "liveInterviews",
    header: "Live Sessions",
    thClass: "text-start",
    tdClass: "text-start",
    render: (row) => (row.name === "Enterprise" ? "On Demand" : row.liveInterviews),
  },
  {
    key: "totalLiveMinutes",
    header: "Live Minutes",
    thClass: "text-start",
    tdClass: "text-start",
    render: (row) => (row.name === "Enterprise" ? "On Demand" : row.totalLiveMinutes),
  },
  {
    key: "default",
    header: "Created by",
    thClass: "text-start",
    tdClass: "text-start",
    render: (row) => (row.name === "Enterprise" ? "On Demand" : row.createdBy || "—"),
  },
  {
    key: "subscribersCount",
    header: "Subscribers",
    thClass: "text-start",
    tdClass: "text-start",
    render: (row) => (row.subscribersCount),
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
          open={menuOpenId === row._id}
          onOpenChange={(o) => setMenuOpenId(o ? row._id : null)}
          outerClassName="relative inline-block"
          triggerClassName="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C4EDC] p-0 text-violet-600 hover:bg-violet-50"
          items={[
            {
              label: "Deactivate package",
              onClick: () => toggleActive(row._id, false),
              show: row.isActive,
            },
            {
              label: "Edit",
              onClick: () => onEdit(row._id),
              show: row.isActive,
            },
          ]}
        />
      </div>
    ),
  },
];

  if(isLoading) {
    return <Loader />
  }

  if (!rows.length) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">Packages</h1>
        <div className="text-gray-600">No packages found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Packages</h1>
      <DataTable
        columns={columns}
        data={rows}
        rowKey="_id" // <- backend _id
        rowClassName={(r) => (!r.isActive ? "opacity-60" : "")}
      />
    </div>
  );
};

export default Packages;
