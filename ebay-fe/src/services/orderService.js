import api from "@/services";

const orderService = {
  /**
   * POST /api/orders
   * @param {object} orderData - { addressId, items: [{ productId, quantity, price }], totalPrice }
   */
  createOrder: async (orderData) => {
    try {
      const res = await api.post("/orders", orderData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * GET /api/orders/:id
   * @param {string} orderId
   */
  getOrderDetails: async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * POST /api/orders/:id/return
   * @param {string} orderId
   */
  createReturnRequest: async (orderId, reason) => {
    try {
      const res = await api.post(`/orders/${orderId}/return`, { reason });
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserOrder: async () => {
    try {
      const res = await api.get("/orders/my");
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  cancelOrder: async (id) => {
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default orderService;
