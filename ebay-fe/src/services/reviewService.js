// reviewService.js

import api from "@/services";
const reviewService = {
  /**
   * GET /api/reviews/:productId
   * @param {string} productId
   */
  getProductReviews: async (productId) => {
    try {
      const res = await api.get(`/reviews/${productId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * POST /api/reviews
   * @param {object} reviewData - { productId, rating, comment }
   */
  createReview: async (reviewData) => {
    try {
      // Giả sử API endpoint là /reviews
      const res = await api.post("/reviews", reviewData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * PATCH /api/reviews/:id
   * @param {string} reviewId
   * @param {object} updateData - { rating, comment }
   */
  updateReview: async (reviewId, updateData) => {
    try {
      const res = await api.patch(`/reviews/${reviewId}`, updateData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * DELETE /api/reviews/:id
   * @param {string} reviewId
   */
  deleteReview: async (reviewId) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * GET /api/feedbacks/:sellerId
   * @param {string} sellerId
   */
  getSellerFeedback: async (sellerId) => {
    try {
      const res = await api.get(`/feedbacks/${sellerId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * POST /api/feedbacks
   * @param {object} feedbackData - { sellerId, rating, comment }
   */
  createFeedback: async (feedbackData) => {
    try {
      const res = await api.post("/feedbacks", feedbackData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default reviewService;
