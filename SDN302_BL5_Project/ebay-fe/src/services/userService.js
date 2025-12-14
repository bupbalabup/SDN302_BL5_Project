import api from "./index";

// ✅ 1. Cập nhật thông tin cá nhân
export const updateProfile = (data) => api.put("/users/update-profile", data);

// ✅ 2. Đổi mật khẩu khi đang đăng nhập
export const changePassword = (data) => api.put("/users/change-password", data);

// ✅ 3. Quên mật khẩu — gửi mail reset (OTP)
export const forgotPassword = (email) =>
  api.post("/users/forgot-password", { email });

// ✅ 4. Đặt lại mật khẩu (sau khi xác thực OTP)
export const resetPassword = (data) => api.post("/users/reset-password", data);

export const getUserCoupons = async () => {
  try {
    const response = await api.get("/coupons/my");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserInfo = () => api.get("/users/me");
