// src/components/PackagesRatesForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useGetMockLivePackagesRatesQuery, useUpdateMockLivePackageRatesMutation } from "../../redux/packagesModule/packagesModuleApi";
import toast from "react-hot-toast";

// ✅ Validation schema
const validationSchema = Yup.object({
  mockRate: Yup.number()
    .required("Mock rate is required")
    .min(0, "Rate must be positive"),
  liveRate: Yup.number()
    .required("Live rate is required")
    .min(0, "Rate must be positive"),
});

const PackagesRatesForm = () => {
  // Fetch current rates from API
  const { data, isLoading, error } = useGetMockLivePackagesRatesQuery();
  const [updateRates, { isLoading: isUpdating, isSuccess, isError, error: updateError }] = useUpdateMockLivePackageRatesMutation();

  if (isLoading) return <p>Loading rates...</p>;
  if (error) return <p className="text-red-500">Failed to load rates</p>;

  // Assuming API returns { mockRate: 200, liveRate: 500 }
  const initialValues = {
    mockRate: data?.mockRate ?? "",
    liveRate: data?.liveRate ?? "",
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting  }) => {
          try {
            const payload = {
                liveRate: Number(values.liveRate),
                mockRate: Number(values.mockRate),
            };
            const result = await updateRates(payload).unwrap();
            if(result?.message === "RateConfig updated" || result?.data){
                toast.success(result?.message || "Rates updated successfully");
                setSubmitting(false);
            }
          } catch (error) {
            toast.error("Failed to update rates");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {/* Mock Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mock Rate
              </label>
              <Field
                type="number"
                name="mockRate"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
              <ErrorMessage
                name="mockRate"
                component="p"
                className="text-sm text-red-500 mt-1"
              />
            </div>

            {/* Live Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Live Rate
              </label>
              <Field
                type="number"
                name="liveRate"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
              <ErrorMessage
                name="liveRate"
                component="p"
                className="text-sm text-red-500 mt-1"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 cursor-pointer py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                {isSubmitting ? "Updating..." : "Update Rates"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PackagesRatesForm;
