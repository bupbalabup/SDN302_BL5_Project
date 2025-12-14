"use client";

import FloatingInput from "@/components/ui/Floating/FloatingInput";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, saveTokens, loginWithGoogle } from "@/services/authService";
import { syncLocalCartToServer } from "@/lib/cartLocal";
import api from "@/services";
import cartService from "@/services/cartService";

export default function EbayLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Please enter your email or username");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!formData.password.trim()) {
      setError("Please enter your password");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      const data = res.data;

      if (staySignedIn) {
        saveTokens(data.accessToken, data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        saveTokens(data.accessToken, data.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }
      await syncLocalCartToServer(api, cartService.getCart);

      window.dispatchEvent(new Event("cart_updated"));

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";

      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    loginWithGoogle();
    await syncLocalCartToServer(api);
    window.dispatchEvent(new Event("cart_updated"));
  };

  return (
    <div className="min-h-[80vh] bg-white flex justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-2">Sign in to your account</div>
          <p className="text-sm text-gray-600">
            New to eBay?
            <a
              href="/register"
              className="text-blue-600 underline hover:no-underline ml-1"
            >
              Create account
            </a>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <FloatingInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          {/* Password */}
          <div className="relative">
            <FloatingInput
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Stay signed in */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Stay signed in</span>
            </label>
          </div>

          {/* Forgot password */}
          <a
            href="/login/forgot-password"
            className="text-sm text-blue-600 hover:underline block text-center"
          >
            Forgot your password?
          </a>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 px-4 rounded-full transition-colors duration-200 ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-bold">
              Continue with Google
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
