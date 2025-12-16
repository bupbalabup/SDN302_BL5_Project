"use client";
import React, { useState } from "react";

const FakePayPalModal = ({ open, onClose, orderId, onSuccess, onFail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Bước 1: Tạo PayPal order
      const token = localStorage.getItem("accessToken");
      
      console.log("🔵 Token:", token ? token.substring(0, 20) + "..." : "NO TOKEN");
      console.log("🔵 OrderId:", orderId);

      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        onFail?.("No token found");
        setLoading(false);
        return;
      }

      if (!orderId) {
        setError("Không tìm thấy Order ID");
        onFail?.("No order ID");
        setLoading(false);
        return;
      }
      
      const createResponse = await fetch(
        "http://localhost:9999/api/payments/paypal/create-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      console.log("🔵 Create Response Status:", createResponse.status);
      console.log("🔵 Create Response Headers:", createResponse.headers);

      const createData = await createResponse.json();

      console.log("✅ PayPal Create Response:", createData);

      if (!createData.success) {
        setError(createData.message || "Failed to create PayPal order");
        onFail?.(createData.message);
        return;
      }

      // Lưu payment ID để dùng sau
      const paymentId = createData.data.paymentId;
      const paypalOrderId = createData.data.paypalOrderId;

      // Bước 2: Redirect đến PayPal để approve
      if (createData.data.approveUrl) {
        // Lưu paymentId vào sessionStorage để dùng sau khi return từ PayPal
        sessionStorage.setItem("paymentId", paymentId);
        sessionStorage.setItem("paypalOrderId", paypalOrderId);
        sessionStorage.setItem("orderId", orderId);

        // Redirect đến PayPal
        window.location.href = createData.data.approveUrl;
      }
    } catch (error) {
      console.error("❌ PayPal Error:", error);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Stack:", error.stack);
      setError(error.message || "An error occurred");
      onFail?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
            className="h-6"
          />
          Thanh Toán PayPal
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Nhấn nút bên dưới để chuyển hướng đến PayPal. Bạn sẽ được yêu cầu đăng nhập vào tài khoản PayPal của mình.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-3 mt-6">
          <button
            className="flex-1 px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handlePayPalPayment}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thanh Toán PayPal"}
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-4 text-center">
          Bạn sẽ được chuyển hướng đến trang PayPal an toàn
        </p>
      </div>
    </div>
  );
};

export default FakePayPalModal;
