import { Card, List, Tag, Divider, Typography } from "antd";
import styles from "../AccountSettings.module.scss";

const { Title } = Typography;

const NotificationsTab = ({ notifications }) => {
  return (
    <Card className={styles.mainCard} title="Notifications Center">
      <Title level={4}>🛒 Orders</Title>
      <List
        dataSource={notifications.orders}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.date} />
            <Tag color={item.status === "delivered" ? "green" : "orange"}>
              {item.status}
            </Tag>
          </List.Item>
        )}
      />
      <Divider />
      <Title level={4}>🎁 Promotions</Title>
      <List
        dataSource={notifications.promotions}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.date} />
          </List.Item>
        )}
      />
      <Divider />
      <Title level={4}>💬 Feedback</Title>
      <List
        dataSource={notifications.feedback}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.date} />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default NotificationsTab;