'use client';
import FloatingInput from "@/components/ui/Floating/FloatingInput";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// 🧩 Import service
import { registerUser } from "@/services/authService";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState("personal");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Invalid email format";
    }
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Gọi API qua axios instance
      const { data } = await registerUser(formData);

      // ✅ Lưu email để dùng ở trang verify
      sessionStorage.setItem("registerEmail", formData.email);
      sessionStorage.setItem("userId", data.userId);

      router.push("/register/verify-email");
    } catch (err) {
      console.error("Register error:", err);
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative">
        <Image
          src="/images/img-register/buyer_dweb_individual.jpg"
          alt="ebay-register-individual"
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8">Create an account</h1>

          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className={`flex-1 py-2 px-4 rounded-full ${
                accountType === "personal"
                  ? "bg-black text-white"
                  : "text-gray-600"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={`flex-1 py-2 px-4 rounded-full ${
                accountType === "business"
                  ? "bg-black text-white"
                  : "text-gray-600"
              }`}
            >
              Business
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                👁️
              </button>
            </div>

            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading}
            />

            <p className="text-xs text-gray-600">
              By selecting <strong>Create personal account</strong>, you agree
              to our{" "}
              <a href="#" className="text-blue-600 underline">
                User Agreement
              </a>{" "}
              and acknowledge reading our{" "}
              <a href="#" className="text-blue-600 underline">
                User Privacy Notice
              </a>
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-lg font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {loading ? "Creating account..." : "Create personal account"}
            </button>

            <div className="text-center text-gray-600 my-2">
              or continue with
            </div>

            <button
              type="button"
              className="flex items-center justify-center font-bold py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
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
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
