"use client";

import Modal from "@/components/shared/Modal";

export default function AlertModal({
  open,
  onClose,
  title,
  message,
  type = "info",
  onConfirm = null,
}) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "✓",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          buttonBg: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          icon: "✕",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: "⚠",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          buttonBg: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "confirm":
        return {
          icon: "?",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          icon: "i",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          buttonBg: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal open={open} onClose={onClose} size="sm" title="">
      <div className="text-center py-4">
        <div
          className={`mx-auto w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}
        >
          <span className={`text-3xl font-bold ${styles.iconColor}`}>
            {styles.icon}
          </span>
        </div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        )}
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {type === "confirm" ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2 ${styles.buttonBg} text-white rounded-full font-medium`}
              >
                Confirm
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`px-8 py-2 ${styles.buttonBg} text-white rounded-full font-medium`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
