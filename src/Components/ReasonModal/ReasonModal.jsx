import React, { useState } from "react";

const ReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason!");
      return;
    }
    onSubmit(reason);
    setReason(""); // reset
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Provide a Reason
        </h2>

        {/* Input */}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full border rounded-md p-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          rows="4"
        />

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-md bg-purple-500 text-white hover:bg-purple-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
