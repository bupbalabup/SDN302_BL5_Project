"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Typography, Space, Input } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { verifyEmail, resendOtp } from "@/services/authService"; // ✅ thêm dòng này

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
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("registerEmail");
    if (!storedEmail) {
      router.push("/register");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      if (/^\d$/.test(pasted[i])) newCode[i] = pasted[i];
    }
    setCode(newCode);
  };

  // ✅ Verify OTP (dùng service)
  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyEmail({ email, otp });

      setSuccess("Email verified successfully! Redirecting to login...");
      sessionStorage.removeItem("registerEmail");
      sessionStorage.removeItem("userId");

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("Verify error:", err);
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP (dùng service)
  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resendOtp(email);
      setSuccess("New OTP sent to your email!");
      setCountdown(120);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="shadow-sm p-8 w-full max-w-md">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => router.push("/register")}
              className="p-0"
            />
            <Title level={3} className="m-0">
              Enter security code
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

          <div className="flex gap-2 justify-center">
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
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
            <Link
              underline
              onClick={() => console.log("Need help clicked")}
              className="text-gray-700"
            >
              Need help?
            </Link>
          </div>
        </Space>
      </div>
    </div>
  );
}
