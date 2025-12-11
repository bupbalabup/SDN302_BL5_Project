import api from "./index";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách danh mục:", error);
    throw error;
  }
};