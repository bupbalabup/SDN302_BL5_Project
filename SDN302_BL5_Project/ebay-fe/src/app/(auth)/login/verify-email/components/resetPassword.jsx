"use client";
import { useEffect, useState } from "react";
import { Button, Input, Space, Typography } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

// 🧩 Import user service
import { resetPassword } from "@/services/userService";

const { Title, Text } = Typography;

export default function ResetPassword({ email }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // ✅ Validation logic
  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    special: /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isValidPassword = Object.values(validations).every((v) => v);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // ✅ Handle Submit
  const handleSubmit = async () => {
    setError("");

    if (!isValidPassword) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await resetPassword({
        email,
        newPassword,
      });

      setSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "An error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success Screen
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleOutlined style={{ fontSize: 40, color: "#52c41a" }} />
          </div>
          <Title level={3}>Password Reset Successful!</Title>
          <Text type="secondary">
            Your password has been successfully updated. You can now sign in
            with your new password.
          </Text>
          <div className="mt-6">
            <Button
              type="primary"
              size="large"
              block
              onClick={() => router.push("/login")}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Form UI
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="shadow-sm p-8 w-full max-w-md">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Title level={3}>Enter your new password</Title>
            <Text type="secondary">
              Make sure your new password is unique and cannot be easily
              guessed.
            </Text>
          </div>

          {/* New Password Input */}
          <div>
            <Text strong>New password</Text>
            <Input.Password
              size="large"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              visibilityToggle={{
                visible: showNewPassword,
                onVisibleChange: setShowNewPassword,
              }}
              className="mt-2"
            />
          </div>

          {/* Validation checklist */}
          <div className="space-y-2">
            <ValidationItem
              isValid={validations.length}
              text="Use at least 8 characters"
            />
            <ValidationItem
              isValid={validations.uppercase}
              text="Include at least 1 uppercase and 1 lowercase letter"
            />
            <ValidationItem
              isValid={validations.special}
              text="Include at least 1 number or symbol (e.g. !@#$%^&*)"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Text strong>Re-enter your password</Text>
            <Input.Password
              size="large"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              visibilityToggle={{
                visible: showConfirmPassword,
                onVisibleChange: setShowConfirmPassword,
              }}
              className="mt-2"
            />
            {confirmPassword && !passwordsMatch && (
              <div className="flex items-center gap-1 mt-2 text-red-500">
                <CloseCircleOutlined />
                <Text type="danger">Passwords do not match</Text>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CloseCircleOutlined className="text-red-500 mt-0.5" />
                <Text type="danger">{error}</Text>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !isValidPassword || !passwordsMatch}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
        </Space>
      </div>
    </div>
  );
}

const ValidationItem = ({ isValid, text }) => (
  <div className="flex items-start gap-2">
    {isValid ? (
      <CheckCircleOutlined
        style={{ color: "#52c41a", fontSize: 18 }}
        className="mt-0.5"
      />
    ) : (
      <CloseCircleOutlined
        style={{ color: "#d9d9d9", fontSize: 18 }}
        className="mt-0.5"
      />
    )}
    <Text type={isValid ? "primary" : "secondary"} style={{ fontSize: 14 }}>
      {text}
    </Text>
  </div>
);
