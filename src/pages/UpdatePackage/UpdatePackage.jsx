import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllPackagesQuery, useGetMockLivePackagesRatesQuery, useUpdatePackageMutation } from "../../redux/packagesModule/packagesModuleApi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader, PackagesRatesForm } from "../../Components";
import toast from "react-hot-toast";

// ✅ Custom Tags Input (Fiverr style)
const TagsInput = ({ values, setFieldValue }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!values.includes(input.trim())) {
        setFieldValue("features", [...values, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (idx) => {
    setFieldValue(
      "features",
      values.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
      {values.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm shadow-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="ml-1 text-purple-500 hover:text-purple-700"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="flex-1 min-w-[120px] border-none bg-transparent focus:ring-0 text-sm outline-none"
      />
    </div>
  );
};

const validationSchema = Yup.object({
  name: Yup.string().trim()
    .min(4, "Name must be at least 4 characters").required("Package name is required"),
  description: Yup.string().trim().min(10, "Description must be at least 10 characters").required("Description is required"),
  price: Yup.number().min(0, "Price should not be negative").required("Price is required"),
  totalMockMinutes: Yup.number()
  .strict()
  .required("Total mock minutes is required")
  .min(0, "Total mock minutes must be at least 0"),

  totalLiveMinutes: Yup.number().min(0,"Total live minutes must be at least 0").required("Total live minutes is required"),
  features: Yup.array().of(Yup.string()).min(1, "At least one feature required"),
});

const UpdatePackage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("Create Package");
  const { data, error, isLoading } = useGetAllPackagesQuery();
  const { data: ratesData ,isLoading:isLoadingRates } = useGetMockLivePackagesRatesQuery();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();

  const foundPackage = data?.data?.find((pkg) => pkg._id === id);
  
  const isInterPrise = foundPackage?.name === "Enterprise" || false;
  const navigate = useNavigate()
  useEffect(() => {
    if (id && foundPackage?.name !== "Enterprise") {
      setTitle("Update Package");
    } else if (isInterPrise){
      setTitle("Update Package Rates");
    }else{
      setTitle("Create Package");
    }
  }, [id, foundPackage, isInterPrise]);

  // ✅ Handle loading after hooks
  if (isLoading || isUpdating || isLoadingRates) {
    return <Loader />;
  }



 

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
        {!isInterPrise ? (
          <Formik
            enableReinitialize
            initialValues={{
              name: foundPackage?.name || "",
              description: foundPackage?.description || "",
              price: foundPackage?.price ?? 0,
              totalMockMinutes: foundPackage?.totalMockMinutes ?? 0,
              totalLiveMinutes: foundPackage?.totalLiveMinutes ?? 0,
              isActive: foundPackage?.isActive ?? true,
              features: foundPackage?.features || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values,{setSubmitting,resetForm}) => {
              try {
                const payload = {
                  id: foundPackage?._id,
                  name:values.name,
                  description:values.description,
                  price:values.price,
                  totalMockMinutes:values.totalMockMinutes,
                  totalLiveMinutes:values.totalLiveMinutes,
                  isActive:values.isActive,
                  features:values.features,
                  tier:foundPackage?.tier,
                  wordLimit: 1000,
                  mockInterviews:foundPackage?.mockInterviews,
                  liveInterviews:foundPackage?.liveInterviews,
                  mockSessionDuration:foundPackage?.mockSessionDuration,
                  liveSessionDuration:foundPackage?.liveSessionDuration,
                  analyticsEnabled:foundPackage?.analyticsEnabled,
                  analyticsRetention:foundPackage?.analyticsRetention,
                  sessionReplays:foundPackage?.sessionReplays,
                  aiAnnotations:foundPackage?.aiAnnotations,
                  prioritySupport:foundPackage?.prioritySupport,
                  rolloverMinutes:foundPackage?.rolloverMinutes,
                  duration:foundPackage?.duration,
                  subscribersCount:foundPackage?.subscribersCount,
                }
                const result =await updatePackage(payload).unwrap();
                if(result?.message === "RateConfig updated" || result?.data){
                  toast.success("RateConfig updated.");
                  navigate("/packages")
                }
              } catch (error) {
                toast.error(error || "Something went wrong");
              }finally{
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Name
                  </label>
                  <Field
                    name="name"
                    className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    style={{ resize: "none" }}
                    className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Price
                    </label>
                    <Field
                      type="number"
                      name="price"
                      className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                    <ErrorMessage
                      name="price"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Field
                      type="checkbox"
                      name="isActive"
                      className="h-5 w-5 text-purple-600 rounded-md border-gray-300 focus:ring-purple-500"
                    />
                    <label className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {/* Mock & Live */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Total Mock Minutes
                    </label>
                    <Field
                      type="number"
                      name="totalMockMinutes"
                      className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                    <ErrorMessage
                      name="totalMockMinutes"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Total Live Minutes
                    </label>
                    <Field
                      type="number"
                      name="totalLiveMinutes"
                      className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                    <ErrorMessage
                      name="totalLiveMinutes"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Features
                  </label>
                  <TagsInput values={values.features} setFieldValue={setFieldValue} />
                  <ErrorMessage
                    name="features"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 cursor-pointer rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md transition"
                  >
                    {foundPackage ? "Save Changes" : isSubmitting ? "Loading..." : "Create Package"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <PackagesRatesForm />
        )}

      </div>
    </div>
  );
};

export default UpdatePackage;
