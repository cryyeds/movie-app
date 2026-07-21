import React from "react";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "Cancel" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-dark-100 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
        <p className="mb-6 text-light-200">{message}</p>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 bg-light-100/5 text-light-200">
            {cancelText}
          </button>

          <button type="button" onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 text-white">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
