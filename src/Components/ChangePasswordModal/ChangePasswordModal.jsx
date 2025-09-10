import { Dialog } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string().min(6, "Min 6 chars").required("New password is required"),
});

export default function ChangePasswordModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-6">
            Change Password
          </Dialog.Title>

          <Formik
            initialValues={{ oldPassword: "", newPassword: "" }}
            validationSchema={ChangePasswordSchema}
            onSubmit={(values) => {
              console.log("Form submitted:", values);
              onClose();
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Password
                  </label>
                  <Field
                    type="password"
                    name="oldPassword"
                    placeholder="Enter old password"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                  <ErrorMessage
                    name="oldPassword"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Field
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 cursor-pointer text-sm font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
