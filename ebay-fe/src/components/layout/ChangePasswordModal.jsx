"use client";
import React, { useState } from "react";
import { Modal, Form, Input } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { changePassword } from "@/services/userService";
import toast from "react-hot-toast";

export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 🔹 Lấy thông tin user từ localStorage
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const userId = userData?._id || userData?.id;

      if (!userId) {
        toast.error("User not found. Please log in again.");
        return;
      }
console.log("Changing password for userId:", userId);
      await changePassword({
        userId,
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      toast.success("✅ Password changed successfully!");
      form.resetFields();
      onClose();
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (!err.errorFields) {
        toast.error("❌ Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Change"
      confirmLoading={loading}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="oldPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter a new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
