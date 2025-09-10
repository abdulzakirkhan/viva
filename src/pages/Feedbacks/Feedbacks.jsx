import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AvatarInitial from "../../Components/AvatarInitial/AvatarInitial";
import { useGetAllFeedbacksQuery, useUpdateFeedbackStatusMutation } from "../../redux/feedbackModule/feedbackModuleApi";
import toast from "react-hot-toast";
import ReasonModal from "../../Components/ReasonModal/ReasonModal";
import { Loader } from "../../Components";

/* ------------------------- tiny helpers ------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    className={cn("h-4 w-4", filled ? "fill-purple-500" : "fill-gray-300")}
  >
    <path d="M10 1.4 12.6 7l6 .5-4.7 3.6 1.6 5.8L10 14.6 4.5 17l1.6-5.8L1.4 7.5l6-.5L10 1.4z" />
  </svg>
);

const Rating = ({ value = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} filled={i < value} />
    ))}
  </div>
);

const Badge = ({ tone = "ok", children ,onClick }) => (
  <span
    className={cn(
      "rounded-full px-3 cursor-pointer py-1 text-xs font-semibold",
      tone === "ok"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-rose-50 text-rose-600"
    )}
    onClick={onClick}
  >
    {children}
  </span>
);

/* -------------------------- validation ------------------------- */
const FiltersSchema = Yup.object({
  status: Yup.mixed().oneOf(["approved", "rejected", "all"]).required(),
  start: Yup.date().nullable(),
  end: Yup.date()
    .nullable()
    .when("start", (start, s) =>
      start ? s.min(start, "End date must be after start date") : s
    ),
});



/* ------------------------------ page --------------------------- */
const Feedbacks = () => {
  const initial = { status: "pending", start: "", end: "" };
  const today = new Date().toISOString().split("T")[0]; // 👈 current date
  const [selectedId, setSelectedId] = useState(null);
  const [selectedString, setSelectedString] = useState(null);
   const [isOpen, setIsOpen] = useState(false);




  
  // hooks mutations
  const [updateFeedbackStatus, { isLoading }] = useUpdateFeedbackStatusMutation();
  /* ------------------------ feedback card ------------------------ */
  const toggleStatus=(id,string)=> {
    setSelectedId(id)
    setSelectedString(string)
    setIsOpen(true)
  }
  const Card = ({ f }) => (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {f?.logo ? (
            <div className="rounded-full shadow-2xl w-10 h-10 flex items-center justify-center">
              {f?.logo}
            </div>
          ) : (
            <AvatarInitial name={f?.userId?.firstName} className="w-10 h-10" />
          )}
          <div className="text-sm font-semibold text-gray-900">{f?.brand}</div>
        </div>
        <Rating value={f?.rating} />
      </div>

      <p className="mb-4 text-sm leading-6 text-gray-600">{f?.feedbackText}</p>

      {/* ✅ Conditions */}
      {f?.status === "pending" && (
        <div className="flex justify-evenly items-center gap-3">
          <Badge tone="ok" onClick={() => toggleStatus(f?._id, "approved")}>
            Approve
          </Badge>
          <Badge tone="bad" onClick={() => toggleStatus(f?._id, "rejected")}>
            Reject
          </Badge>
        </div>
      )}

      {f?.status === "approved" && (
        <div className="flex justify-end">
          <Badge tone="ok">Approved</Badge>
        </div>
      )}

      {f?.status === "rejected" && (
        <div className="flex justify-end">
          <Badge tone="bad">Rejected</Badge>
        </div>
      )}
    </div>
  );

  // UI classes
  const buttonClassName ="rounded-lg bg-purple-500 px-4 py-2 mb-1 text-sm font-semibold text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500";
  const fieldClassName ="w-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";
  const filterBoxClassName ="grid w-full flex-1 grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-3 ";






  const handleSubmit=async (reason) => {
    try {
      const payload = {
        id: selectedId,
        action: selectedString === "rejected" ? "reject" : "approve",
        reason: reason
      }
      const result = await updateFeedbackStatus(payload);
      if(result?.data?.message === "Feedback rejected." || result?.data?.message === "Feedback approved.") {
        toast.success(result?.data?.message);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(error || "Error submitting reason");
    }
  };

  if(isLoading){
    return <Loader />
  }
  return (
    <>
      <div className="px-4 py-8 bg-[#F5F7F9]">
        <Formik
          initialValues={initial}
          validationSchema={FiltersSchema}
          onSubmit={() => {}}
        >
          {({ values }) => {
            // 👇 Formik values ko query me pass karo
            const {
              data: feedbacks = [],
              isLoading,
              error,
            } = useGetAllFeedbacksQuery({
              status: values.status,
            });

            const FEEDBACKS = feedbacks?.items || [];
            const isLoadings = isLoading;
            if (isLoading) return <Loader />;
            if (error) return <p>Error loading feedbacks</p>;

            return (
              <>
                {/* filter bar */}
                <Form className="flex flex-wrap items-center gap-3">
                  {/* Heading */}
                  <div className="w-full sm:w-1/4 flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Feedbacks
                    </h1>
                  </div>

                  {/* Filters Box */}
                  <div className={filterBoxClassName}>
                    {/* Status */}
                    <div className="flex items-center justify-end gap-3">
                      <label className="text-xs text-gray-500">Filters</label>
                      <Field as="select" name="status" className={fieldClassName}>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="div"
                        className="text-xs text-rose-600"
                      />
                    </div>

                    {/* Start Date */}
                    {/* <div className="flex flex-col">
                      <Field
                        type="date"
                        name="start"
                        max={today}
                        className={fieldClassName}
                      />
                      <ErrorMessage
                        name="start"
                        component="div"
                        className="text-xs text-rose-600"
                      />
                    </div> */}

                    {/* End Date */}
                    {/* <div className="flex flex-col">
                      <Field
                        type="date"
                        name="end"
                        max={today}
                        className={fieldClassName}
                      />
                      <ErrorMessage
                        name="end"
                        component="div"
                        className="text-xs text-rose-600"
                      />
                    </div> */}
                  </div>

                  {/* Submit */}
                  <div className="flex items-end">
                    <button type="submit" className={buttonClassName}>
                      Submit
                    </button>
                  </div>
                </Form>

                {/* grid */}
                <div className="grid mt-5 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {FEEDBACKS.length > 0 ? FEEDBACKS.map((f) => (
                    <Card key={f.id} f={f} />
                  )) : (
                    <div className="col-span-4 p-32">
                      <p className="text-xl text-gray-600 font-bold text-center mr-16">No feedbacks found</p>
                    </div>
                  )}
                </div>
              </>
            );
          }}
        </Formik>
      </div>
      <ReasonModal isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit} />
    </>
  );
};

export default Feedbacks;
