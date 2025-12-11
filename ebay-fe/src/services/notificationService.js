import api from "@/services";

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications/my");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const maskAsRead = async (id) => {
  try {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Error updating notifications:", error);
    throw error;
  }
};
