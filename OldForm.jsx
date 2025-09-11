<Form className="flex flex-col lg:flex-row !flex-wrap lg:items-center gap-3">
  <div className="w-full lg:w-1/4 flex items-center">
    <h1 className="text-xl font-semibold text-gray-900">Feedbacks</h1>
  </div>

  <div className={filterBoxClassName}>
    <div className="md:flex items-center gap-3">
      <label className="text-xs text-gray-500">Filters</label>
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
      <ErrorMessage
        name="status"
        component="div"
        className="text-xs text-rose-600"
      />
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
</Form>;


  const handleDownload =async () => {
    try {
      const from = toUtcStartOfDay(values.start) || getDateNDaysAgo(7);
      const to = toUtcEndOfDay(values.end) || getCurrentDate();
      const action = values.status;

      const response = await fetch(
        `${BASE_URL}feedbacks/audits/export.xlsx?from=${from}&to=${to}&action=${action}`,
        { method: "GET", headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } }
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_feedbacks_${from}_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };