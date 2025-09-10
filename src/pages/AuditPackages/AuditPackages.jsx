import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DataTable, Loader } from "../../Components";
import { useLocation } from "react-router-dom";
import { getCurrentDate, getDateNDaysAgo, toUtcEndOfDay, toUtcStartOfDay } from "../../helper";
import toast from "react-hot-toast";
import { useGetAllPackagesAuditQuery } from "../../redux/packagesModule/packagesModuleApi";
import { BASE_URL } from "../../constants/apiUrls";

/* --------------------------- validation -------------------------- */
const isNotFuture = (v) => !v || new Date(v) <= new Date();
const isAfterOrEqual = (a, b) => new Date(a) >= new Date(b);

const FiltersSchema = Yup.object({
  status: Yup.mixed().oneOf(["approved", "rejected", "All"]).required("Status is required"),
  start: Yup.string()
    .required("Start date is required")
    .test("start-not-future", "Start date cannot be in the future", isNotFuture),
  end: Yup.string()
    .required("End date is required")
    .test("end-after-start", "End date must be after start date", function (end) {
      const { start } = this.parent;
      if (!end || !start) return true;
      return isAfterOrEqual(end, start);
    })
    .test("end-not-future", "End date cannot be in the future", isNotFuture),
});

/* --------------------------- CSV Download ------------------------- */
const downloadCSV = (rows, filename = "audit_packages.csv") => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const body = rows.map((r) => header.map((key) => `"${String(r[key] ?? "").replace(/"/g, '""')}"`));

  const csv = [header, ...body].map((arr) => arr.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

  if (window.navigator?.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/* ------------------------------ page ----------------------------- */
const AuditPackages = () => {
  const today = new Date().toISOString().split("T")[0];
  const { key: routeKey } = useLocation();

  const [filters, setFilters] = useState({
    status: "approved",
    start: "",
    end: ""
  });

  /* ----------------------- API Fetch ----------------------- */
  const { data, error, isLoading, refetch } = useGetAllPackagesAuditQuery();

  const rows = data?.items?.map((item) => ({
    auditId: item._id,
    packageName: item.packageName,
    version: item.version,
    changedFields: item.changedFields, // Keep as array
    updatedBy: item.updatedBy?.name,
    actedByEmail: item.updatedBy?.email,
    before: Object.entries(item.before || {}), // convert object to array of [key, value]
    after: Object.entries(item.after || {}),
    createdAt: new Date(item.createdAt).toLocaleString(),
  })) || [];


  /* ----------------------- Handle Form Change ----------------------- */
  const handleFormChange = (values) => {
    setFilters(values);
    // Optionally trigger refetch with new params here
  };

  /* ----------------------- Handle Download ----------------------- */
  const handleDownload = async (values) => {
    try {
      const from = toUtcStartOfDay(values.start) || getDateNDaysAgo(7);
      const to = toUtcEndOfDay(values.end) || getCurrentDate();
      const action = values.status;

      const response = await fetch(
        `${BASE_URL}packages/audits/export.xlsx`,
        { method: "GET", headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } }
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_packages_${from}_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  /* ----------------------- Table Columns ----------------------- */

  const columns = [
    { key: "packageName", header: "Package Name" },
    { key: "version", header: "Version" },
    { key: "updatedBy", header: "Updated By" },
    { key: "actedByEmail", header: "Email" },

    {
      key: "changedFields",
      header: "Changed Fields",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-44">
          {row.changedFields.map((field, idx) => (
            <span
              key={idx}
              className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
            >
              {field}
            </span>
          ))}
        </div>
      ),
    },

    {
      key: "before",
      header: "Before Change",
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-60">
          {row.before.map(([key, value], idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
            >
              {formatValue(value)}
            </span>
          ))}
        </div>
      ),
    },

    {
      key: "after",
      header: "After Change",
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-60">
          {row.after.map(([key, value], idx) => (
            <span
              key={idx}
              className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded"
            >
            {formatValue(value)}
            </span>
          ))}
        </div>
      ),
    },
  ];
  /* ----------------------- UI Classes ----------------------- */
  const buttonClassName = "rounded-lg cursor-pointer bg-purple-500 px-4 py-2 mb-1 text-sm font-semibold text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500";
  const fieldClassName = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";
  const filterBoxClassName = "grid w-full flex-1 grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-3 sm:grid-cols-1 lg:grid-cols-3";


  if(isLoading) {
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
            <Form className="flex flex-col lg:flex-row !flex-wrap lg:items-center gap-3">
              <div className="w-full lg:w-1/4 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Package Audit Logs</h1>
              </div>

              <div className={filterBoxClassName}>
                <div className="md:flex items-center gap-3">
                  <label className="text-xs text-gray-500">Status</label>
                  <Field
                    as="select"
                    name="status"
                    className={fieldClassName}
                    onChange={(e) => {
                      handleChange(e);
                      handleFormChange({ ...values, status: e.target.value });
                    }}
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="All">All</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-xs text-rose-600" />
                </div>

                <div className="flex flex-col">
                  <Field
                    type="date"
                    name="start"
                    max={today}
                    className={fieldClassName}
                    onChange={(e) => {
                      handleChange(e);
                      handleFormChange({ ...values, start: e.target.value });
                    }}
                  />
                  <ErrorMessage name="start" component="div" className="text-xs text-rose-600" />
                </div>

                <div className="flex flex-col">
                  <Field
                    type="date"
                    name="end"
                    max={today}
                    className={fieldClassName}
                    onChange={(e) => {
                      handleChange(e);
                      handleFormChange({ ...values, end: e.target.value });
                    }}
                  />
                  <ErrorMessage name="end" component="div" className="text-xs text-rose-600" />
                </div>
              </div>

              <div className="flex items-end sm:w-full lg:w-auto">
                <button type="submit" className={buttonClassName}>Download Excel</button>
              </div>
            </Form>

            <DataTable columns={columns} data={rows} rowKey="auditId" className="mt-4" />
          </>
        )}
      </Formik>
    </div>
  );
};

export default AuditPackages;
