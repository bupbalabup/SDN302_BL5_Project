import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import styles from "../AccountSettings.module.scss";

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircleOutlined style={{ fontSize: 20 }} />,
    error: <CloseCircleOutlined style={{ fontSize: 20 }} />,
    warning: <ExclamationCircleOutlined style={{ fontSize: 20 }} />,
    info: <InfoCircleOutlined style={{ fontSize: 20 }} />,
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastIcon}>{icons[type]}</div>
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>{message.title}</div>
        {message.description && (
          <div className={styles.toastDescription}>{message.description}</div>
        )}
      </div>
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={onClose}
        className={styles.toastClose}
      />
    </div>
  );
};

export default Toast;