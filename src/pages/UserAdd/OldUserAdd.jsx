import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const phoneRegExp =
  /^(\+?\d{1,3}[- ]?)?\(?\d{2,4}\)?[- ]?\d{3,4}[- ]?\d{3,4}$/;

const validationSchema = Yup.object({
  parentRole: Yup.string().required("Select a parent role"),
  name: Yup.string().min(2, "Too short").required("Your name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(phoneRegExp, "Invalid phone number")
    .required("Phone is required"),
  country: Yup.string().required("Country is required"),
  role: Yup.string().required("Role is required"),
  service: Yup.string().required("Service is required"),
});

const initialValues = {
  parentRole: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  role: "",
  service: "",
};
function UserAdd() {
  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          // TODO: send to API
          console.log("Submitting:", values);
          setSubmitting(false);
          // resetForm(); // uncomment if you want to clear the form on success
        }}
      >
        {({ isSubmitting, touched, errors, isValid }) => {
          const inputBase =
            "rounded-xl bg-[#F5F7F9] px-3 h-13 text-sm outline-none transition placeholder:text-gray-400";
          const ok ="bg-[#F5F7F9] text-[#1E1C2866]  text-lg font-semibold";
          const bad ="border border-red-300 bg-white text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-100";

          const cls = (name) =>
            `${inputBase} ${touched[name] && errors[name] ? bad : ok}`;

          return (
            <Form>
              {/* Top bar */}
              <div className="mx-auto max-w-6xl px-6 py-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Add Users
                  </h1>

                  {/* Select parent role */}
                  <div className="relative lg:w-xs">
                    <Field
                      as="select"
                      name="parentRole"
                      className={`appearance-none ${cls("parentRole")} pr-10 bg-white w-full`}
                    >
                      <option value="" disabled>
                        Select parent role
                      </option>
                      <option>Administrator</option>
                      <option>Manager</option>
                      <option>Staff</option>
                    </Field>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="mt-1 text-right">
                      <ErrorMessage
                        name="parentRole"
                        component="div"
                        className="text-xs text-red-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card */}
              <div className="mx-auto max-w-6xl px-6">
                <div className="rounded-2xl bg-[#FFFFFF] p-6 shadow-sm ring-1 ring-gray-100">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Add user to role
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      WageVest uses teller to link your bank account
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Row 1 */}
                    <div className="">
                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className={`${cls("name")} w-full`}
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>

                    <div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email address"
                        className={`${cls("email")} w-full`}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>

                    <div>
                      <Field
                        name="phone"
                        type="tel"
                        placeholder="Phone number"
                        className={`${cls("phone")} w-full`}
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>

                    {/* Row 2 */}
                    <div>
                      <Field
                        name="country"
                        type="text"
                        placeholder="Country"
                        className={`${cls("country")} w-full`}
                      />
                      <ErrorMessage
                        name="country"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>

                    <div>
                      <Field
                        name="role"
                        type="text"
                        placeholder="Role"
                        className={`${cls("role")} w-full`}
                      />
                      <ErrorMessage
                        name="role"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>

                    <div>
                      <Field
                        name="service"
                        type="text"
                        placeholder="Service"
                        className={`${cls("service")} w-full`}
                      />
                      <ErrorMessage
                        name="service"
                        component="div"
                        className="mt-1 text-xs text-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end py-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : "Add User"}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default UserAdd;
