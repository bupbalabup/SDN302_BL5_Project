import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * GET /api/reviews/:productId
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("reviewerId", "username email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Internal function to calculate and update the product's average rating
 */
const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { productId: productId } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result.length > 0 ? result[0].averageRating : 0;
  const numOfReviews = result.length > 0 ? result[0].numOfReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(averageRating.toFixed(1)),
    numReviews: numOfReviews,
  });
};

/**
 * POST /api/reviews
 */
export const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { productId, rating, comment } = req.body;

    const existingReview = await Review.findOne({ productId, reviewerId });
    if (existingReview) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already reviewed this product.",
        });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const review = await Review.create({
      productId,
      reviewerId,
      rating,
      comment,
    });

    await updateProductRating(new mongoose.Types.ObjectId(productId));

    return res
      .status(201)
      .json({
        success: true,
        message: "Review submitted successfully!",
        review,
      });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/reviews/:id
 */
export const updateReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: id, reviewerId });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ success: false, message: "Rating must be between 1 and 5." });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();

    await updateProductRating(review.productId);

    return res
      .status(200)
      .json({ success: true, message: "Review updated successfully.", review });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { id } = req.params;

    const review = await Review.findOneAndDelete({ _id: id, reviewerId });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    await updateProductRating(review.productId);

    return res
      .status(200)
      .json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
