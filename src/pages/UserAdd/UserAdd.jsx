import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { useGetRolesModulesQuery } from "../../redux/permissionModule/permissionModuleApi";
import { useCreateAdminUserMutation, useGetAllUserListingQuery, useUpdateAdminUserDetailsMutation } from "../../redux/adminUserModule/adminUserModuleApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../../Components";

const phoneRegExp = /^(\+?\d{1,3}[- ]?)?\(?\d{2,4}\)?[- ]?\d{3,4}[- ]?\d{3,4}$/;

// ✅ Validate by ID (parentRoleId), not by label
const validationSchema = Yup.object({
  parentRoleId: Yup.string().required("Select a parent role"),
  name: Yup.string().trim().strict(true).min(3, "Too short").required("Your name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const initialValues = {
  parentRoleId: "",     // <-- formik field that we validate & submit
  name: "",
  email: "",
  isActive: false,
};

// Small helper so we can use setFieldValue cleanly
function ParentRoleSelect({ parentData, cls }) {
  const { values, setFieldValue } = useFormikContext();

  return (
    <div className="relative">
      <Field
        as="select"
        name="parentRoleId"
        className={`appearance-none ${cls("parentRoleId")} pr-10 w-full`}
        value={values.parentRoleId}
        onChange={(e) => setFieldValue("parentRoleId", e.target.value)}
      >
        <option value="" disabled>
          Select parent role
        </option>
        {parentData?.map((role) => (
          <option key={role._id || role.id} value={role._id || role.id}>
            {role.roleName}
          </option>
        ))}
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
        <ErrorMessage name="parentRoleId" component="div" className="text-xs text-red-600" />
      </div>
    </div>
  );
}

function UserAdd() {
  const user = useSelector((state) => state.auth.user);
  const { data: rolesData } = useGetRolesModulesQuery();
  const parentData = rolesData?.data ?? [];
  const { userId } = useParams();
  const [formValues, setFormValues] = React.useState(initialValues);
  const [createAdminUser, { isLoading, isSuccess, isError, error }] =useCreateAdminUserMutation();



  const { data, isLoading: userLoading, error: userError } = useGetAllUserListingQuery();
  const navigate = useNavigate();
  const handleAddUserSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Values now contain parentRoleId (the backend-friendly ID)
      const payload ={
        name: values.name,
        email: values.email,
        roleId: values.parentRoleId,
      }

      const response = await createAdminUser(payload)
      if(response?.error?.data?.message){
        toast.error(response?.error?.data?.message || "Name, email, and role id are required")
        setSubmitting(false);
      }
      if(response?.data?.message === "Admin user created and credentials emailed"){
        toast.success(response?.data?.message || "User added successfully")
        resetForm();
        setSubmitting(false);
      }
    } catch (error) {
      setSubmitting(false);
      console.error("Error submitting form:", error);
    }
  };

  const [updateAdminUserDetails, { isLoading: isUpdatingLoading }] =useUpdateAdminUserDetailsMutation();

  const updateUserSubmit = async (values,{ setSubmitting, resetForm }) => {
    try {
      const payload ={
        userId: userId,
        name: values.name,
        email: values.email,
        roleId: values.parentRoleId,
        isActive: values.isActive,
      }

      const response = await updateAdminUserDetails(payload).unwrap();

      if(response?.message === "No changes detected."){
        toast.error("No changes detected.")
        setSubmitting(false);
      }
      if(response?.message === "Admin user updated" || response?.user){
        toast.success("User updated successfully.")
        setSubmitting(false);
        navigate("/users/list")
      }
    } catch (error) {
      toast.error("Failed to update user")
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (userId && data) {
      const userFound = data.find((user) => user._id === userId);
      if (userFound) {
        setFormValues({
          name: userFound.name,
          email: userFound.email,
          parentRoleId: userFound.role?._id,
          isActive: userFound.isActive,
        })
      }
    }
  }, [userId,data])
  

  if(isLoading || userLoading || isUpdatingLoading){
    return <Loader />
  }
  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Formik
        initialValues={userId ? formValues : initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={userId ? updateUserSubmit : handleAddUserSubmit}
      >
        {({ isSubmitting, touched, errors, isValid }) => {
          const inputBase =
            "rounded-xl bg-[#F5F7F9] px-3 h-13 text-sm outline-none transition placeholder:text-gray-400";
          const ok = "bg-[#F5F7F9] text-[#1E1C2866] text-lg font-semibold";
          const bad =
            "border border-red-300 bg-white text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-100";
          const cls = (name) => `${inputBase} ${touched[name] && errors[name] ? bad : ok}`;

          return (
            <Form>
              {/* Top bar */}
              <div className="mx-auto max-w-6xl px-6 py-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-semibold text-gray-900">{userId ? "Update User" : "Add User"}</h1>
                </div>
              </div>

              {/* Card */}
              <div className="mx-auto max-w-6xl px-6">
                <div className="rounded-2xl bg-[#FFFFFF] p-6 shadow-sm ring-1 ring-gray-100">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Add user to role</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      WageVest uses teller to link your bank account
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    <Field
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active User
                    </label>
                    <ErrorMessage
                      name="isActive"
                      component="div"
                      className="mt-1 text-xs text-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Name */}
                    <div>
                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className={`${cls("name")} w-full`}
                      />
                      <ErrorMessage name="name" component="div" className="mt-1 text-xs text-red-600" />
                    </div>
                    
                    {/* Email */}
                    <div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email address"
                        className={`${cls("email")} w-full`}
                        disabled={!!userId}
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-600" />
                    </div>

                    {/* Parent Role (Formik-controlled, uses IDs) */}
                    <ParentRoleSelect parentData={parentData} cls={cls} />
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end py-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="rounded-lg cursor-pointer bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : userId ? "Update User" : "Add User"}
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
