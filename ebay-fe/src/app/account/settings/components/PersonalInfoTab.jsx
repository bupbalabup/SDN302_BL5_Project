import {
  UserOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BellOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Input, Button, Space, Divider, Typography } from "antd";
import styles from "../AccountSettings.module.scss";

const { Title, Text } = Typography;

const PersonalInfoTab = ({
  user,
  formData,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onChange,
}) => {
  return (
    <Card className={styles.mainCard} title="User Information">
      <Col xs={24}>
        <Card
          className={styles.mainCard}
          title={<div className={styles.cardTitle}>Personal Information</div>}
          extra={
            !editing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onEdit}
                className={styles.editButton}
              >
                Edit
              </Button>
            )
          }
          styles={{
            header: {
              borderBottom: "1px solid #e5e5e5",
              padding: "16px 24px",
            },
            body: {
              padding: 24,
            },
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className={styles.fieldLabel}>
                Full Name <span className={styles.required}>*</span>
              </div>
              {editing ? (
                <Input
                  size="large"
                  prefix={<UserOutlined className={styles.prefixIcon} />}
                  value={formData.fullname}
                  onChange={(e) =>
                    onChange({ ...formData, fullname: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className={styles.inputField}
                />
              ) : (
                <div className={styles.displayField}>
                  {user.fullname || "Not provided"}
                </div>
              )}
            </Col>

            <Col xs={24} md={12}>
              <div className={styles.fieldLabel}>Phone Number</div>
              {editing ? (
                <Input
                  size="large"
                  prefix={<PhoneOutlined className={styles.prefixIcon} />}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    onChange({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className={styles.inputField}
                />
              ) : (
                <div className={styles.displayField}>
                  {user.phoneNumber || "Not provided"}
                </div>
              )}
            </Col>

            {editing && (
              <>
                <Col xs={24}>
                  <Divider className={styles.divider} />
                </Col>
                <Col xs={24}>
                  <Space
                    size="middle"
                    style={{ justifyContent: "flex-end", width: "100%" }}
                  >
                    <Button
                      size="middle"
                      icon={<CloseOutlined />}
                      onClick={onCancel}
                      disabled={saving}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="middle"
                      icon={<SaveOutlined />}
                      onClick={onSave}
                      loading={saving}
                      className={styles.saveButton}
                    >
                      Save
                    </Button>
                  </Space>
                </Col>
              </>
            )}
          </Row>
        </Card>

        {/* Account Overview Card */}
        <Card
          className={styles.overviewCard}
          styles={{
            body: {
              padding: 24,
            },
          }}
        >
          <Title level={4} className={styles.overviewTitle}>
            Account Overview
          </Title>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div className={styles.overviewItem}>
                <div
                  className={`${styles.overviewIcon} ${styles.overviewIconUser}`}
                >
                  <UserOutlined />
                </div>
                <Text strong className={styles.itemLabel}>
                  Member Since
                </Text>
                <Text className={styles.itemValue}>2024</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.overviewItem}>
                <div
                  className={`${styles.overviewIcon} ${styles.overviewIconBell}`}
                >
                  <BellOutlined />
                </div>
                <Text strong className={styles.itemLabel}>
                  Notifications
                </Text>
                <Text className={styles.itemValue}>Enabled</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.overviewItem}>
                <div
                  className={`${styles.overviewIcon} ${styles.overviewIconLock}`}
                >
                  <LockOutlined />
                </div>
                <Text strong className={styles.itemLabel}>
                  Security
                </Text>
                <Text className={styles.itemValue}>Active</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Card>
  );
};

export default PersonalInfoTab;