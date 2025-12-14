import { useState } from "react";

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "info", // 'info', 'success', 'error', 'warning', 'confirm'
    onConfirm: null,
  });

  const showModal = ({ title, message, type = "info", onConfirm = null }) => {
    setModalContent({ title, message, type, onConfirm });
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (modalContent.onConfirm) {
      modalContent.onConfirm();
    }
    hideModal();
  };

  return {
    isOpen,
    modalContent,
    showModal,
    hideModal,
    handleConfirm,
  };
}
