// Tạo mã OTP ngẫu nhiên, mặc định 6 chữ số
export const generateOtp = (length = 6) => {
  const otp = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, length);
  return otp;
};
