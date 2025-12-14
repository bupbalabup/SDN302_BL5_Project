import {
  BellOutlined,
  CreditCardOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Menu, Typography } from "antd";
import styles from "../AccountSettings.module.scss";

const { Title, Text } = Typography;

const ProfileSidebar = ({ user, selectedTab, onTabChange }) => {
  const menuItems = [
    { key: "personal", icon: <UserOutlined />, label: "Personal Info" },
    { key: "notifications", icon: <BellOutlined />, label: "Notifications" },
    { key: "coupons", icon: <CreditCardOutlined />, label: "Coupons warehouse" },
    { key: "security", icon: <LockOutlined />, label: "Security" },
  ];

  return (
    <Card className={styles.sidebarCard}>
      <div className={styles.profileSection}>
        <Avatar
          size={100}
          icon={<UserOutlined />}
          src={user.avatarURL || null}
          className={styles.profileAvatar}
        />
        <Title level={3} className={styles.profileName}>
          {user.fullname}
        </Title>
        <Text className={styles.profileEmail}>
          <MailOutlined className={styles.emailIcon} />{" "}
          {user.email || "No email"}
        </Text>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedTab]}
        items={menuItems}
        onClick={(info) => onTabChange(info.key)}
      />
    </Card>
  );
};

export default ProfileSidebar;