// import React, { useEffect, useState } from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { ActionMenu, DataTable } from "../../Components";
// import { useLocation } from "react-router-dom";
// import { useGetAuditFeedbacksQuery } from "../../redux/feedbackModule/feedbackModuleApi";
// import { getCurrentDate, getDateNDaysAgo, toUtcEndOfDay, toUtcStartOfDay } from "../../helper";
// import toast from "react-hot-toast";

// /* ----------------------- sample server data ----------------------- */
// const ROWS = [
//   { id: 1, clientId: "001", name: "Ahmed Ali",           status: "Approved", rating: 4, date: "2024-06-01" },
//   { id: 2, clientId: "002", name: "Muhammad Meer",       status: "Approved", rating: 5, date: "2024-06-03" },
//   { id: 3, clientId: "003", name: "Rehan Mazahr",        status: "Approved", rating: 7, date: "2024-06-05" },
//   { id: 4, clientId: "004", name: "Muhammad Muzzammil",  status: "Approved", rating: 4, date: "2024-06-06" },
//   { id: 5, clientId: "005", name: "Muhammad Omar",       status: "Approved", rating: 2, date: "2024-06-08" },
// ];

// /* --------------------------- validation -------------------------- */
// // validate as strings to avoid Yup date cast errors
// const isNotFuture = (v) => !v || new Date(v) <= new Date();
// const isAfterOrEqual = (a, b) => new Date(a) >= new Date(b);

// const FiltersSchema = Yup.object({
//   status: Yup.mixed().oneOf(["approved", "rejected", "All"]).required("Status is required"),
//   start: Yup.string().required("Start date is required").test("start-not-future", "Start date cannot be in the future", isNotFuture),
//   end: Yup.string().required("End date is required").test("end-after-start", "End date must be after start date", function (end) {
//       const { start } = this.parent;
//       if (!end || !start) return true;
//       return isAfterOrEqual(end, start);
//     })
//     .test("end-not-future", "End date cannot be in the future", isNotFuture),
// });



// const downloadCSV = (rows, filename = "feedback.csv") => {
//   console.log("downloaded");
//   const header = ["Client ID", "Name", "Status", "Ratings", "Date"];
//   const body = rows.map((r) => [r.clientId, r.name, r.status, r.rating, r.date]);

//   const csv = [header, ...body]
//     .map((arr) => arr.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
//     .join("\n");

//   // Add BOM so Excel opens UTF-8 correctly
//   const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

//   // IE/Edge legacy fallback
//   if (window.navigator && window.navigator.msSaveOrOpenBlob) {
//     window.navigator.msSaveOrOpenBlob(blob, filename);
//     return;
//   }

//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.setAttribute("download", filename);
//   a.style.display = "none";
//   document.body.appendChild(a);

//   // Firefox sometimes prefers dispatching a MouseEvent
//   a.click();
//   // a.dispatchEvent(new MouseEvent("click")); // alternative

//   setTimeout(() => {
//     URL.revokeObjectURL(url);
//     a.remove();
//   }, 0);
// };

// /* ------------------------------ page ----------------------------- */
// const FeedbacksCsv = () => {
//   const initial = { status: "approved", start: "", end: "" }; // keep as strings
//   const today = new Date().toISOString().split("T")[0];
//   const [menuOpenId, setMenuOpenId] = useState(null);
//   const filterRows = (values) => {
//     const start = values.start ? new Date(values.start) : null;
//     const end = values.end ? new Date(values.end) : null;

//     return ROWS.filter((r) => {
//       if (values.status !== "All" && r.status !== values.status) return false;
//       const d = new Date(r.date);
//       if (start && d < start) return false;
//       if (end && d > end) return false;
//       return true;
//     });
//   };
//   const { key: routeKey } = useLocation();
//   // table columns for DataTable
//   const columns = [
//     { key: "clientId", header: "Client ID", thClass: "", tdClass: "" },
//     {
//       key: "name",
//       header: "Name",
//       render: (row) => <span className="text-gray-900">{row.name}</span>,
//     },
//     { key: "status", header: "Status" },
//     { key: "rating", header: "Ratings" },
//     {
//       key: "actions",
//       header: "Actions",
//       thClass: "text-right",
//       tdClass: "text-right",
//       render: (row) => (
//         <ActionMenu
//         routeKey={routeKey}
//         open={menuOpenId === row.id}
//         onOpenChange={(o) => setMenuOpenId(o ? row.id : null)}
//         outerClassName="relative inline-block"
//         triggerClassName="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C4EDC]  text-violet-600 hover:bg-violet-50"
//         items={[
//           { label: "Download CSV", onClick: () => downloadCSV([row], `feedback_${row.clientId}.csv`) },
//           // { label: "Activate package", onClick: () => toggleActive(row.id, true) },
//         ]}
//       />
//       ),
//     },
//   ];

//   // UI BUTTONS INPUTS CLASSES
//   const buttonClassName="rounded-lg bg-purple-500 px-4 py-2 mb-1 text-sm font-semibold text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
//   const fieldClassName="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
//   const filterBoxClassName="grid w-full flex-1 grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-3 sm:grid-cols-1 lg:grid-cols-3"
  



  

//   const handleSubmit = async (values) => {
//     try {
//       const from = toUtcStartOfDay(values.start) || getDateNDaysAgo(7);
//       const to = toUtcEndOfDay(values.end) || getCurrentDate();
//       const action = values.status;

//       const response = await fetch(
//         `http://localhost:4001/feedbacks/audits/export.xlsx?from=${from}&to=${to}&action=${action}`,
//         {
//           method: "GET",
//           headers: {
//             Accept:
//               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to download file");
//       }

//       // Convert response to blob
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);

//       // Create download link
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `audit_feedbacks_${from}_${to}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);

//       console.log("✅ File downloaded successfully");
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error(error.message || "Something went wrong");
//     }
//   };

//   const [params, setParams] = useState(null)
//   const { data, error, isLoading } = useGetAuditFeedbacksQuery(params);

//   return (
//     <div className="px-4 py-8 bg-[#F5F7F9]">
//       <Formik
//         initialValues={initial}
//         validationSchema={FiltersSchema}
//         onSubmit={(values) => handleSubmit(values)}
//       >
//         {({ values }) => {
//           const datas = filterRows(values);
//           const paramsdata = {
//             from: toUtcStartOfDay(values.start),
//             to: toUtcEndOfDay(values.end),
//             action: values.status,
//           }
//           // setParams(paramsdata)
          

//           return (
//             <>
//               {/* filter bar */}
//                 <Form className="flex flex-col lg:flex-row !flex-wrap lg:items-center gap-3">
//                 {/* Heading */}
//                 <div className="w-full lg:w-1/4 flex items-center">
//                   <h1 className="text-xl font-semibold text-gray-900">Feedbacks</h1>
//                 </div>

//                 {/* Filters Box */}
//                 <div className={filterBoxClassName}>
//                   {/* Status */}
//                   <div className="md:flex items-center gap-3">
//                     <label className="text-xs text-gray-500">Filters</label>
//                     <Field
//                       as="select"
//                       name="status"
//                       className={fieldClassName}
//                     >
//                       <option value="approved">Approved</option>
//                       <option value="rejected">Rejected</option>
//                       <option value="All">All</option>
//                     </Field>
//                     <ErrorMessage
//                       name="status"
//                       component="div"
//                       className="text-xs text-rose-600"
//                     />
//                   </div>

//                   {/* Start Date */}
//                   <div className="flex flex-col">
//                     <Field
//                       type="date"
//                       name="start"
//                       max={today}
//                       className={fieldClassName}
//                     />
//                     <ErrorMessage
//                       name="start"
//                       component="div"
//                       className="text-xs text-rose-600"
//                     />
//                   </div>

//                   {/* End Date */}
//                   <div className="flex flex-col">
//                     <Field
//                       type="date"
//                       name="end"
//                       max={today}
//                       className={fieldClassName}
//                     />
//                     <ErrorMessage
//                       name="end"
//                       component="div"
//                       className="text-xs text-rose-600"
//                     />
//                   </div>
//                 </div>

//                 {/* Submit */}
//                 <div className="flex items-end sm:w-full lg:w-auto">
//                   <button type="submit" className={`${buttonClassName}`} >
//                     Submit
//                   </button>
//                 </div>
//                </Form>

//               {/* DataTable in place of table */}
//               <DataTable
//                 columns={columns}
//                 data={datas}
//                 rowKey="id"
//                 rowClassName={() => ""} 
//                 className="mt-2"
//               />
//             </>
//           );
//         }}
//       </Formik>
//     </div>
//   );
// };

// export default FeedbacksCsv;
import React, { useState, useEffect, useRef, useId } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ActionMenu, DataTable, Loader } from "../../Components";
import { useLocation } from "react-router-dom";
import { useGetAuditFeedbacksQuery, useLazyGetExportExcelAuditFeedbacksQuery } from "../../redux/feedbackModule/feedbackModuleApi";
import { getCurrentDate, getDateNDaysAgo, toUtcEndOfDay, toUtcStartOfDay } from "../../helper";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constants/apiUrls";
import { useGetAllUserListingQuery } from "../../redux/adminUserModule/adminUserModuleApi";

/* --------------------------- validation -------------------------- */
const isNotFuture = (v) => !v || new Date(v) <= new Date();
const isAfterOrEqual = (a, b) => new Date(a) >= new Date(b);

const FiltersSchema = Yup.object({
  status: Yup.mixed().oneOf(["approved", "rejected", "All"]).nullable().notRequired(),
  start: Yup.string().nullable().notRequired()
    .test("start-not-future", "Start date cannot be in the future", isNotFuture),
  end: Yup.string()
  .nullable().notRequired()
    .test("end-after-start", "End date must be after start date", function (end) {
      const { start } = this.parent;
      if (!end || !start) return true;
      return isAfterOrEqual(end, start);
    })
    .test("end-not-future", "End date cannot be in the future", isNotFuture),
});

/* ------------------------------ page ----------------------------- */
const FeedbacksCsv = () => {
  const today = new Date().toISOString().split("T")[0];
  const { key: routeKey } = useLocation();
  const filterRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackId, setFeedbackId] = useState('')
  const [feedbackName, setFeedbackName] = useState('')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')

  /* ----------------------- API TRIGGER State ----------------------- */
  const [trigger, setTrigger] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    start: "",
    end: ""
  });

  /* ----------------------- API Fetch ----------------------- */
  const params = {
    from: toUtcStartOfDay(filters.start) || "",
    to: toUtcEndOfDay(filters.end) || "",
    action: filters.status || "",
    feedbackId: feedbackId || "",
    actedBy: userId || ""
  };



  const { data:userList, isLoading:userLoading, error:userError  } = useGetAllUserListingQuery();
  const { data, error, isLoading, refetch } = useGetAuditFeedbacksQuery(params);
  const rows = data?.items || [];
  /* ----------------------- Handle Form Change ----------------------- */
  const handleFormChange = (values) => {
    setFilters(values); // immediately update filters -> triggers API call
  };

  /* ----------------------- Handle Download ----------------------- */
  const id = useId()
  const [ triggerExport, { data:exportData, isFetching }] = useLazyGetExportExcelAuditFeedbacksQuery()
  const handleDownload = async (e) => {
    // e.preventDefault();
    try {
      const blob = await triggerExport(params).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_feedbacks_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  /* ----------------------- Table Columns ----------------------- */


  const columns = [
    { key: "userName", header: "User Name" },
    { key: "feedbackText", header: "Feedback" },
    { key: "rating", header: "Rating" },
    { key: "action", header: "Status" },
    { key: "reason", header: "Reason" },
    { key: "actedByName", header: "Acted By" },
    { key: "actedByEmail", header: "Acted By Email" }
  ];

  /* ----------------------- UI Classes ----------------------- */
  const buttonClassName = "rounded-lg cursor-pointer bg-purple-500 px-4 py-2 mb-1 text-sm font-semibold text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500";
  const fieldClassName = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";
  const filterBoxClassName = "grid w-full flex-1 grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-3 sm:grid-cols-1 lg:grid-cols-3";





  const feedbacksdata = data?.items || []

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);



  if(isLoading){
    return <Loader />
  }
  return (
    <div className="px-4 py-8 bg-[#F5F7F9]">
      <Formik
        enableReinitialize
        initialValues={filters}
        validationSchema={FiltersSchema}
        onSubmit={handleDownload}
      >
        {({ values, handleChange }) => (
          <>
            <Form className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Package Audit Logs
              </h1>

              <div className="flex items-center gap-4">
                {/* Filter Button + Box */}
                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filter Audit
                  </button>

                  {showFilters && (
                    <div className="p-4 space-y-4 bg-gray-50 w-66 rounded-xl border-2 border-gray-200 shadow-xl absolute top-12 -left-2 z-50">
                      <div className="relative">
                        <label htmlFor="parentRole" className="text-sm font-medium text-gray-700 mb-1">By User</label>
                        <select
                          value={userName}
                          onChange={(e) => {
                            const name = e.target.value; // selected name
                            const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                            setUserName(name);
                            setUserId(id);
                          }}
                          className="appearance-none w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select Field Name</option>
                          {userList?.map((user) => (
                            <option key={user?._id} value={user?.name} data-id={user?._id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-1 top-10 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                      <div className="">
                        <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                        <Field
                          as="select"
                          name="status"
                          className={fieldClassName}
                          onChange={(e) => {
                            handleChange(e);
                            handleFormChange({ ...values, status: e.target.value });
                          }}
                        >
                          <option value="">Select Status</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="All">All</option>
                        </Field>
                        <ErrorMessage name="status" component="div" className="text-xs text-rose-600" />
                      </div>
                      <div className="relative">
                        <label htmlFor="parentRole" className="text-sm font-medium text-gray-700 mb-1">By Feedback</label>
                        <select
                          value={feedbackName}
                          onChange={(e) => {
                            const name = e.target.value; // selected name
                            const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                            setFeedbackName(name);
                            setFeedbackId(id);
                          }}
                          className="appearance-none w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select Feedback</option>
                          {feedbacksdata?.map((p) => (
                            <option key={p.feedbackId || p.feedbackId} value={p?.userName} data-id={p.feedbackId || p.feedbackId}>
                              {p?.userName}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-1 top-10 h-4 w-4 -translate-y-1/2 text-gray-400"
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

                      {/* Start Date */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <Field
                          type="date"
                          name="start"
                          max={today}
                          onChange={(e) => {
                            handleChange(e);
                            setFilters((prev) => ({
                              ...prev,
                              start: e.target.value, // filters state update
                            }));
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                        <ErrorMessage
                          name="start"
                          component="div"
                          className="text-xs text-rose-600 mt-1"
                        />
                      </div>

                      {/* End Date */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <Field
                          type="date"
                          name="end"
                          max={today}
                          onChange={(e) => {
                            handleChange(e);
                            setFilters((prev) => ({
                              ...prev,
                              end: e.target.value, // filters state update
                            }));
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                        <ErrorMessage
                          name="end"
                          component="div"
                          className="text-xs text-rose-600 mt-1"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        {/* <button
                          type="submit"
                          className="rounded-lg bg-purple-500 px-4 py-2 text-white font-semibold hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          Apply
                        </button> */}
                        <button
                          type="button"
                          className="rounded-lg cursor-pointer bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          onClick={() => handleReset(resetForm)}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <button
                  type="submit"
                  className="rounded cursor-pointer bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                >
                  Download Excel
                </button>
              </div>
            </Form>
            <DataTable columns={columns} data={rows} rowKey="auditId" className="mt-2" />
          </>
        )}
      </Formik>
    </div>
  );
};

export default FeedbacksCsv;
