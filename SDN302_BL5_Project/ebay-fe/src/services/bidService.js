import api from "@/services";

/**
 * Lấy lịch sử bid + thông tin sản phẩm đấu giá
 * GET /api/bid/:productId/historyBid
 */
export const getBidHistoryByProduct = async (productId) => {
  try {
    const res = await api.get(`/bid/${productId}/historyBid`);
    // res.data = { success, product, bidHistory }
    return res.data;
  } catch (error) {
    console.error("Error fetching bid history:", error);
    throw error;
  }
};

/**
 * Đặt bid cho 1 sản phẩm
 * POST /api/bid/:productId/bid
 * body: { bidAmount, maxAutoBid? }
 * (buyerId lấy từ req.user trong backend, như em chỉnh ở trên)
 */
export const placeBid = async (productId, bidAmount, buyerId, maxAutoBid) => {
  try {
    const res = await api.post(`/bid/${productId}/bid`, {
      bidAmount,
      buyerId,
      maxAutoBid,
    });
    return res.data;
  } catch (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
};

const updateAutoBid = async (productId, buyerId, maxAutoBid) => {
  return api.put(`/bid/${productId}/autoBid`, {
    buyerId,
    maxAutoBid,
  });
};

export const getUserAutoBid = async (productId, userId) => {
  const res = await api.get(`/bid/${productId}/autobid?userId=${userId}`);
  return res.data;
};


const bidService = {
  getBidHistoryByProduct,
  placeBid,
  updateAutoBid,
  getUserAutoBid
};

export default bidService;
