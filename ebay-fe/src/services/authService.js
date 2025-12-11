import api from "./index";

// 🧩 Đăng ký tài khoản mới
export const registerUser = (data) => api.post("/auth/register", data);

// 🔁 Gửi lại mã OTP xác thực email
export const resendOtp = (email) => api.post("/auth/resend-otp", { email });

// ✅ Xác minh OTP (kích hoạt email)
export const verifyEmail = (data) => api.post("/auth/verify-email", data);

// 🔓 Đăng nhập người dùng
export const loginUser = (data) => api.post("/auth/login", data);

//login Google
export const loginWithGoogle = () =>
  (window.location.href = "http://localhost:9999/api/login/google");

// ♻️ Cấp lại access token bằng refresh token
export const refreshAccessToken = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });

// 🚪 Đăng xuất (xóa refresh token trong DB)
export const logoutUser = (refreshToken) =>
  api.post("/auth/logout", { refreshToken });

/* ---------------------- Tiện ích quản lý token (localStorage) ---------------------- */
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
