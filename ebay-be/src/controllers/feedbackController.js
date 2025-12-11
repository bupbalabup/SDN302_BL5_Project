import Feedback from "../models/Feedback.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const updateSellerFeedback = async (sellerId) => {
  try {
    const objectSellerId = new mongoose.Types.ObjectId(sellerId);

    const sellerProducts = await Product.find(
      { sellerId: objectSellerId },
      "_id"
    );
    const productIds = sellerProducts.map((p) => p._id);

    if (productIds.length === 0) {
      await Feedback.findOneAndDelete({ sellerId: objectSellerId });
      return;
    }

    const reviewAggregation = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          positiveReviews: {
            $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] },
          },
        },
      },
    ]);

    let averageRating = 0;
    let totalReviews = 0;
    let positiveRate = 0;

    if (reviewAggregation.length > 0) {
      const data = reviewAggregation[0];
      totalReviews = data.totalReviews;
      averageRating = parseFloat(data.averageRating.toFixed(1));
      positiveRate =
        totalReviews > 0
          ? parseFloat(((data.positiveReviews / totalReviews) * 100).toFixed(2))
          : 0;
    }

    await Feedback.findOneAndUpdate(
      { sellerId: objectSellerId },
      {
        $set: {
          averageRating,
          totalReviews,
          positiveRate,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    console.error(`Error updating seller feedback for ${sellerId}:`, error);
  }
};

// --- HÀM TẠO FEEDBACK MỚI ---
/**
 * POST /api/feedbacks
 * @description: Khởi tạo bản ghi feedback cho một seller mới.
 * Các trường averageRating, totalReviews, positiveRate sẽ
 * sử dụng giá trị default (0) đã định nghĩa trong schema.
 */
export const createFeedback = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "sellerId is required to create a feedback entry.",
      });
    }

    // Kiểm tra xem Feedback đã tồn tại chưa để tránh trùng lặp
    const existingFeedback = await Feedback.findOne({ sellerId });
    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "Feedback for this seller already exists.",
        feedback: existingFeedback,
      });
    }

    const newFeedback = new Feedback({ sellerId });

    const savedFeedback = await newFeedback.save();

    return res.status(201).json({
      success: true,
      feedback: savedFeedback,
      message: "Feedback entry successfully created.",
    });
  } catch (error) {
    console.error("Create seller feedback error:", error);
    // Xử lý lỗi unique constraint (sellerId) nếu có
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Feedback for this seller already exists.",
        });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
// --- KẾT THÚC HÀM TẠO FEEDBACK MỚI ---

/**
 * GET /api/feedbacks/:sellerId
 */
export const getSellerFeedback = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const feedback = await Feedback.findOne({ sellerId });

    if (!feedback) {
      return res.status(200).json({
        success: true,
        feedback: {
          sellerId,
          averageRating: 0,
          totalReviews: 0,
          positiveRate: 0,
        },
        message: "No feedback found for this seller yet.",
      });
    }

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Get seller feedback error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
