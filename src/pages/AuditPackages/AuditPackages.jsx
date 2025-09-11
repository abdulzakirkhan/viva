import React, { useState, useEffect, useRef, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DataTable, Loader } from "../../Components";
import { useLocation } from "react-router-dom";
import {
  getCurrentDate,
  getDateNDaysAgo,
  toUtcEndOfDay,
  toUtcStartOfDay,
} from "../../helper";
import toast from "react-hot-toast";
import { useGetAllPackagesAuditQuery, useGetAllPackagesQuery, useLazyGetExportExcelAuditPackagesQuery } from "../../redux/packagesModule/packagesModuleApi";
import { BASE_URL } from "../../constants/apiUrls";
import { useGetAllUserListingQuery } from "../../redux/adminUserModule/adminUserModuleApi";
import { useSelector } from "react-redux";

/* --------------------------- validation -------------------------- */
const isNotFuture = (v) => !v || new Date(v) <= new Date();
const isAfterOrEqual = (a, b) => new Date(a) >= new Date(b);

const FiltersSchema = Yup.object({
  start: Yup.string().nullable().notRequired()
    .test("start-not-future", "Start date cannot be in the future", isNotFuture),
  end: Yup.string().nullable()
    .notRequired()
    .test("end-after-start", "End date must be after start date", function (end) {
      const { start } = this.parent;
      if (!end || !start) return true;
      return isAfterOrEqual(end, start);
    })
    .test("end-not-future", "End date cannot be in the future", isNotFuture),
});

/* ------------------------------ page ----------------------------- */
const AuditPackages = () => {
  const today = new Date().toISOString().split("T")[0];
  const { key: routeKey } = useLocation();
  const filterRef = useRef(null);
  const [parentRole, setParentRole] = useState("");
  const [packageName, setPackageName] = useState('')
  const [packageId, setPackageId] = useState('')
  const [fieldName, setFieldName] = useState('')
  const [fieldId, setFieldId] = useState('')
  const [parentRoleId, setParentRoleId] = useState("");


  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
  });


  /* ----------------------- Query Params ----------------------- */


  const params = useMemo(() => ({
  updatedBy: parentRoleId || "",
  packageId: packageId || "",
  from: filters.start ? toUtcStartOfDay(filters.start) : "",
  to: filters.end ? toUtcEndOfDay(filters.end) : "",
  fieldIncludes: fieldId || "",
}), [filters, parentRoleId, packageId, fieldId]);
  /* ----------------------- API Fetch ----------------------- */
  const { data, isLoading, refetch } = useGetAllPackagesAuditQuery(params);
  const { data: allUsersData, isLoading: isLoadingUsers, error: errorUsers } = useGetAllUserListingQuery();
  const { data: allPackages, isLoading: isLoadingPackages, isFetching } = useGetAllPackagesQuery();
  const packagesData = allPackages?.data || []
  const parentData =allUsersData || []
  const rows =
    data?.items?.map((item) => ({
      auditId: item._id,
      packageName: item.packageName,
      version: item.version,
      changedFields: item.changedFields,
      updatedBy: item.updatedBy?.name,
      actedByEmail: item.updatedBy?.email,
      before: Object.entries(item.before || {}),
      after: Object.entries(item.after || {}),
      createdAt: new Date(item.createdAt).toLocaleString(),
    })) || [];

  /* ----------------------- Outside Click ----------------------- */
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

  /* ----------------------- Handle Download ----------------------- */

  const Bearertoken = useSelector((state) => state.auth?.token);
  // console.log("Bearer token :", Bearertoken);
  const handleDownload = async () => {
    try {
      const response = await fetch(`${BASE_URL}packages/audits/export.xlsx?${params?.from ? `from=${params.from}` : ""}${params?.to ? `&to=${params.to}` : ""}${params?.packageId ? `&packageId=${params.packageId}` : ""}${params?.updatedBy ? `&updatedBy=${params.updatedBy}` : ""}${params?.fieldIncludes ? `&fieldIncludes=${params.fieldIncludes}` : ""}`, {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          Authorization: `Bearer ${Bearertoken}`,
        },
      });


      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_packages.xlsx`;
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

  if (isLoading || isLoadingUsers || isLoadingPackages) {
    return <Loader />;
  }

 

  const handleReset = (resetForm) => {
    resetForm();
    setFilters({ start: "", end: "" });
    setParentRole("");
    setParentRoleId(null);
    setPackageName("");
    setPackageId("");
    setFieldName("");
    setFieldId(null);
    refetch();
  }

  return (
    <div className="px-4 py-8 bg-[#F5F7F9]">
      <Formik
        enableReinitialize
        initialValues={filters}
        validationSchema={FiltersSchema}
        onSubmit={handleDownload}
      >
        {({ values, handleChange ,resetForm }) => (
          <>
            {/* Top bar */}
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
                        <label htmlFor="parentRole" className="text-sm font-medium text-gray-700 mb-1">Updated By</label>
                        <select
                          value={parentRole}
                          onChange={(e) => {
                            const name = e.target.value; // selected name
                            const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                            setParentRole(name);
                            setParentRoleId(id);
                          }}
                          className="appearance-none w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select User</option>
                          {parentData?.map((p) => (
                            <option key={p._id || p.id} value={p?.name} data-id={p._id || p.id}>
                              {p?.name}
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
                      <div className="relative">
                        <label htmlFor="parentRole" className="text-sm font-medium text-gray-700 mb-1">By Package</label>
                        <select
                          value={packageName}
                          onChange={(e) => {
                            const name = e.target.value; // selected name
                            const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                            setPackageName(name);
                            setPackageId(id);
                          }}
                          className="appearance-none w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select package</option>
                          {packagesData?.map((p) => (
                            <option key={p._id || p.id} value={p?.name} data-id={p._id || p.id}>
                              {p?.name}
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
                      <div className="relative">
                        <label htmlFor="parentRole" className="text-sm font-medium text-gray-700 mb-1">By Field Name</label>
                        <select
                          value={fieldName}
                          onChange={(e) => {
                            const name = e.target.value; // selected name
                            const id = e.target.selectedOptions[0].dataset.id; // get id from data-id
                            setFieldName(name);
                            setFieldId(id);
                          }}
                          className="appearance-none w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select Field Name</option>
                          <option value="Price" data-id="price">Price</option>
                          <option value="Total Mock Minutes" data-id="totalMockMinutes">Total Mock Minutes</option>
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
                  className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                >
                  Download Excel
                </button>
              </div>
            </Form>

            {/* Table */}
            <DataTable
              columns={columns}
              data={rows}
              rowKey="auditId"
              className="mt-4"
            />
          </>
        )}
      </Formik>
    </div>
  );
};

export default AuditPackages;
