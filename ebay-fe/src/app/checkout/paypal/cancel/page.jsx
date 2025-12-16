"use client";
import Link from "next/link";

export default function PayPalCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán bị hủy
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn đã hủy quá trình thanh toán PayPal. Bạn có thể thử lại bất kỳ lúc nào.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Thử Lại
          </Link>
          <Link
            href="/cart"
            className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
          >
            Quay Lại
          </Link>
        </div>
      </div>
    </div>
  );
}
