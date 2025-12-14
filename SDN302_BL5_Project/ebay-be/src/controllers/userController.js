import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmailOtp } from "../services/OTPServices.js";

// ✅ 1. Cập nhật thông tin cá nhân
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, phoneNumber, avatarURL } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullname,
        phoneNumber,
        avatarURL,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Đổi mật khẩu (khi đang đăng nhập)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findById(userId).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Kiểm tra password có tồn tại không
    if (!user.password) {
      console.error("❌ user.password is undefined!");
      return res.status(500).json({ message: "Password not found in DB" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Quên mật khẩu — gửi mail reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Gửi OTP
    await sendEmailOtp(email);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInfoUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
