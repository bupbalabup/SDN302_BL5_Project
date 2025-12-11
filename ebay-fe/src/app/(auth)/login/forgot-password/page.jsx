"use client";
import FloatingInput from "@/components/ui/Floating/FloatingInput";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// 🧩 Import API service
import { forgotPassword } from "@/services/userService";

export default function ResetPasswordEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      // ✅ Gọi API qua service
      const { data } = await forgotPassword(email);

      setSuccess(data.message || "OTP has been sent to your email.");

      // ✅ Lưu email để dùng cho bước verify
      sessionStorage.setItem("resetPasswordEmail", email);

      // ✅ Chuyển hướng sau 1s
      setTimeout(() => {
        router.push("/login/verify-email");
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset password email.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center pt-10">
      <div className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
        <p className="text-gray-600 mb-6">
          For your security, we need to make sure it's really you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <div>
            <FloatingInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-4xl font-semibold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
