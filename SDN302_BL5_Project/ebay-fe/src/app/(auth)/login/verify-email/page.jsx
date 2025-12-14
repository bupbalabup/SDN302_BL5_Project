"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Typography, Space, Input } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ResetPassword from "./components/resetPassword";

// 🧩 Import services
import { verifyEmail, resendOtp } from "@/services/authService";
import { forgotPassword } from "@/services/userService";

const { Title, Text, Link } = Typography;

export default function SecurityCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const inputRefs = useRef([]);

  // 📧 Lấy email từ sessionStorage
  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetPasswordEmail");
    const registerEmail = sessionStorage.getItem("registerEmail");

    if (resetEmail) {
      setEmail(resetEmail);
      setIsResetPassword(true);
    } else if (registerEmail) {
      setEmail(registerEmail);
      setIsResetPassword(false);
    } else {
      router.push("/register");
    }
  }, [router]);

  // ⏰ Đếm ngược
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // 🔡 Nhập OTP
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) newCode[i] = pastedData[i];
    }
    setCode(newCode);
  };

  // ✅ VERIFY OTP
  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await verifyEmail({ email, otp: otpCode });

      setSuccess(data.message || "Email verified successfully!");

      setTimeout(() => {
        if (isResetPassword) {
          setShowResetPassword(true); // 👉 Hiện form reset password
        } else {
          sessionStorage.removeItem("registerEmail");
          sessionStorage.removeItem("userId");
          router.push("/login");
        }
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Verification failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND OTP
  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isResetPassword) {
        const { data } = await forgotPassword(email);
        setSuccess(data.message || "New OTP sent to your email!");
      } else {
        const { data } = await resendOtp(email);
        setSuccess(data.message || "New OTP sent to your email!");
      }

      setCountdown(120);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to resend OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ✅ Nếu verify xong và là flow reset password
  if (showResetPassword && isResetPassword) {
    return <ResetPassword email={email} />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="shadow-sm p-8 w-full max-w-md">
        <Space direction="vertical" size="large" className="w-full">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() =>
                router.push(isResetPassword ? "/login" : "/register")
              }
              className="p-0"
            />
            <Title level={3} className="m-0">
              {isResetPassword ? "Verify your email" : "Enter security code"}
            </Title>
          </div>

          <Text type="secondary">
            We sent a security code to <strong>{email}</strong>.
          </Text>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-semibold"
                style={{
                  borderRadius: "8px",
                  borderColor: digit ? "#1890ff" : "#d9d9d9",
                  borderWidth: "2px",
                }}
                disabled={loading}
              />
            ))}
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleVerify}
            loading={loading}
            disabled={code.some((d) => !d) || loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <Text type="secondary" className="text-center block">
            {canResend ? (
              <span>You can resend the code now</span>
            ) : (
              <span>
                You can resend the security code in {formatCountdown(countdown)}
              </span>
            )}
          </Text>

          {canResend && (
            <Button
              type="default"
              size="large"
              block
              onClick={handleResend}
              loading={loading}
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend Code"}
            </Button>
          )}

          <div className="text-center">
            <Link underline onClick={() => console.log("Need help clicked")}>
              Need help?
            </Link>
          </div>
        </Space>
      </div>
    </div>
  );
}