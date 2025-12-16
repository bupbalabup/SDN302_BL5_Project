"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PayPalSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const capturePayment = async () => {
      try {
        // Lấy paymentId và paypalOrderId từ sessionStorage
        const paymentId = sessionStorage.getItem("paymentId");
        const paypalOrderId = sessionStorage.getItem("paypalOrderId");
        const orderId = sessionStorage.getItem("orderId");
        const token = localStorage.getItem("accessToken");

        console.log("📦 Capture Info:", { paymentId, paypalOrderId, orderId });

        if (!paymentId || !paypalOrderId) {
          setError("Không tìm thấy thông tin thanh toán");
          setLoading(false);
          return;
        }

        if (!orderId) {
          setError("Không tìm thấy Order ID");
          setLoading(false);
          return;
        }

        // Capture payment
        const response = await fetch(
          "http://localhost:9999/api/payments/paypal/capture-test",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentId,
              paypalOrderId,
              orderId,
            }),
          }
        );

        const data = await response.json();

        console.log("✅ Capture Response:", data);

        if (data.success) {
          setSuccess(true);
          // Lấy orderId từ response
          if (data.data && data.data.orderId) {
            setOrderId(data.data.orderId);
          }
          sessionStorage.removeItem("paymentId");
          sessionStorage.removeItem("paypalOrderId");
        } else {
          setError(data.message || "Capture failed");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ gửi email xác nhận cho bạn.
            </p>
          </div>

          <Link
            href={orderId ? `/order/${orderId}` : "/order"}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Xem Đơn Hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 4v2m0-16v2m0 4v2"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lỗi thanh toán</h1>
          <p className="text-red-600 mb-6">{error}</p>
        </div>

        <Link
          href="/checkout"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Quay Lại Thanh Toán
        </Link>
      </div>
    </div>
  );
}
