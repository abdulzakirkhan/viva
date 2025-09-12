import { useState } from "react";
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
import {
  useGetAdminUserAuditListingQuery,
  useGetAllUserListingQuery,
} from "../../redux/adminUserModule/adminUserModuleApi";
import { BASE_URL } from "../../constants/apiUrls";
import {
  buttonClassName,
  fieldClassName,
  filterBoxClassName,
} from "../../constant";
import { useSelector } from "react-redux";

/* --------------------------- validation -------------------------- */
const isNotFuture = (v) => !v || new Date(v) <= new Date();
const isAfterOrEqual = (a, b) => new Date(a) >= new Date(b);

const FiltersSchema = Yup.object({
  // status: Yup.mixed().oneOf(["approved", "rejected", "All"]).required("Status is required"),
  start: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "start-not-future",
      "Start date cannot be in the future",
      isNotFuture
    ),
  end: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "end-after-start",
      "End date must be after start date",
      function (end) {
        const { start } = this.parent;
        if (!end || !start) return true;
        return isAfterOrEqual(end, start);
      }
    )
    .test("end-not-future", "End date cannot be in the future", isNotFuture),
});

/* --------------------------- CSV Download ------------------------- */

/* ------------------------------ page ----------------------------- */
const AuditUser = () => {
  const {
    data: allUsersListingData,
    isLoading: allUsersLoading,
    error: allUsersError,
  } = useGetAllUserListingQuery();
  const today = new Date().toISOString().split("T")[0];
  const { key: routeKey } = useLocation();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [filters, setFilters] = useState({
    start: "",
    end: "",
  });

  const usersData = allUsersListingData || [];

  /* ----------------------- API Fetch ----------------------- */
  // const [params, setParams] = useState()

  const params = {
    from: toUtcStartOfDay(filters.start) || "",
    to: toUtcEndOfDay(filters.end) || "",
    updatedBy: userId ? userId : "",
  };

  const { data, error, isLoading, refetch } =
    useGetAdminUserAuditListingQuery(params);

  const rows =
    data?.items?.map((item) => ({
      auditId: item?._id,
      userName: item?.adminUser?.name,
      // userEmail: item?.adminUser?.email,
      changedFields: item.changedFields,
      updatedByName: item.updatedBy?.name,
      updatedByEmail: item.updatedBy?.email,
      before: Object.entries(item.before || {}),
      after: Object.entries(item.after || {}),
      actedAt: new Date(item.actedAt).toLocaleString(),
    })) || [];

  /* ----------------------- Handle Form Change ----------------------- */
  const handleFormChange = (values) => {
    setFilters(values);
    // Optionally trigger refetch with new params here
  };

  /* ----------------------- Handle Download ----------------------- */
  const BearerToken = useSelector((s) => s.auth.token);
  const handleDownload = async (values) => {
    try {
      const from = toUtcStartOfDay(values.start) || getDateNDaysAgo(7);
      const to = toUtcEndOfDay(values.end) || getCurrentDate();
      const response = await fetch(
        `${BASE_URL}admin/admins/audits/export.xlsx?${
          params?.updatedBy ? "updatedBy=" + params?.updatedBy : ""
        }${from ? "&from=" + from : ""}${to ? "&to=" + to : ""}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            Authorization: `Bearer ${BearerToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_users_${from}_${to}.xlsx`;
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
    { key: "userName", header: "User Name" },
    // { key: "userEmail", header: "User Email" },
    { key: "updatedByName", header: "Updated By Name" },
    { key: "updatedByEmail", header: "Updated By Email" },

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
    { key: "actedAt", header: "Updated Date" },
  ];
  /* ----------------------- UI Classes ----------------------- */
  // const buttonClassName = "rounded-lg cursor-pointer bg-purple-500 px-4 py-2 mb-1 text-sm font-semibold text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500";
  // const fieldClassName = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";
  // const filterBoxClassName = "grid w-full flex-1 grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-3 sm:grid-cols-1 lg:grid-cols-3";

  if (isLoading || allUsersLoading) {
    return <Loader />;
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
            <div className="flex items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                Users Audit Logs
              </h1>
            </div>
            <Form className="flex flex-col lg:flex-row !flex-wrap lg:items-center gap-3">
              <div className={filterBoxClassName}>
                <div className="relative flex items-center gap-3">
                  <h1>Updated By</h1>
                  <select
                    value={userName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const id = e.target.selectedOptions[0].dataset.id;
                      setUserName(name);
                      setUserId(id);
                    }}
                    className="appearance-none w-48 rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Updated By</option>
                    {usersData?.map((p) => (
                      <option
                        key={p._id || p.id}
                        value={p.name}
                        data-id={p._id || p.id}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                  <ErrorMessage
                    name="start"
                    component="div"
                    className="text-xs text-rose-600"
                  />
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
                  <ErrorMessage
                    name="end"
                    component="div"
                    className="text-xs text-rose-600"
                  />
                </div>
              </div>

              <div className="flex items-end sm:w-full lg:w-auto">
                <button type="submit" className={buttonClassName}>
                  Download Excel
                </button>
              </div>
            </Form>

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

export default AuditUser;
