"use client";
import {
  getUserCoupons,
  getUserInfo,
  updateProfile,
} from "@/services/userService";
import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import styles from "./AccountSettings.module.scss";

// Components
import Toast from "./components/Toast";
import ProfileSidebar from "./components/ProfileSidebar";
import NotificationsTab from "./components/NotificationsTab";
import CouponsTab from "./components/CouponsTab";
import PersonalInfoTab from "./components/PersonalInfoTab";

// Data
import { fakeNotifications, fakeCoupons } from "./data/fakeData";

const { Title, Text } = Typography;

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTab, setSelectedTab] = useState("personal");
  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
  });

  // Toast helper
  const showToast = (type, title, description) => {
    setToast({ type, message: { title, description } });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (window.location.hash === "#notification") {
      setSelectedTab("notifications");
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await getUserInfo();
      const data = res.data || {};

      if (data.success) {
        setUser(data.user);
        setFormData({
          fullname: data.user.fullname || "",
          phoneNumber: data.user.phoneNumber || "",
        });
        showToast(
          "success",
          "Profile Loaded",
          "Your profile information has been loaded successfully."
        );
      } else {
        showToast(
          "error",
          "Loading Failed",
          data.message || "Failed to fetch user info"
        );
      }
    } catch (error) {
      showToast(
        "error",
        "Connection Error",
        error.response?.data?.message ||
          "Unable to load profile. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!formData.fullname.trim()) {
      showToast(
        "warning",
        "Validation Error",
        "Full name is required. Please enter your name."
      );
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile(formData);
      if (res.data?.success || res.message) {
        const updatedUser = res.data?.user || res.user;
        showToast(
          "success",
          "Profile Updated!",
          "Your changes have been saved successfully."
        );

        if (updatedUser) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setTimeout(() => {
          fetchUserData();
          setEditing(false);
        }, 1000);
      } else {
        showToast(
          "error",
          "Update Failed",
          res.data?.message || "Failed to update profile."
        );
      }
    } catch (error) {
      showToast(
        "error",
        "Update Error",
        error.response?.data?.message ||
          "Unable to update profile. Please check your connection."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: user.fullname || "",
      phoneNumber: user.phoneNumber || "",
    });
    setEditing(false);
    showToast("info", "Changes Discarded", "Your changes have been cancelled.");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast("success", "Copied!", `Coupon code ${code} copied to clipboard`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Card className={styles.loadingCard}>
          <Spin size="large" />
          <Title level={4} className={styles.loadingTitle}>
            Loading your profile...
          </Title>
        </Card>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className={styles.noUserContainer}>
        <Card className={styles.noUserCard}>
          <UserOutlined className={styles.noUserIcon} />
          <Title level={3} className={styles.noUserTitle}>
            Authentication Required
          </Title>
          <Text className={styles.noUserText}>
            Please log in to view your account settings
          </Text>
          <Divider style={{ margin: "32px 0" }} />
          <Button type="primary" size="large" href="/login" block>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case "notifications":
        return <NotificationsTab notifications={fakeNotifications} />;

      case "coupons":
        return <CouponsTab coupons={fakeCoupons} onCopyCode={handleCopyCode} />;

      case "personal":
      default:
        return (
          <PersonalInfoTab
            user={user}
            formData={formData}
            editing={editing}
            saving={saving}
            onEdit={() => setEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={setFormData}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          User information
        </h1>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar */}
        <Col xs={24} lg={7}>
          <ProfileSidebar
            user={user}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={17}>
          {renderTabContent()}
        </Col>
      </Row>
    </div>
  );
}
