import api from "./index";

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách sản phẩm:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(` Lỗi khi lấy chi tiết sản phẩm ID=${id}:`, error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(` Lỗi khi lấy sản phẩm theo categoryId=${categoryId}:`, error);
    throw error;
  }
};
