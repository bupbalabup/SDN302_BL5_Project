import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

// [GET] /products
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      name,
      order = "desc",
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      const categoryData = await Category.findOne({
        name: { $regex: category, $options: "i" },
      });
      if (categoryData) {
        query.categoryId = categoryData._id;
      }
    }

    // Filter by price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (name) {
      query.title = { $regex: name, $options: "i" };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .populate("sellerId", "username email avatarURL")
      .sort({ price: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// [GET] /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("categoryId", "name")
      .populate("sellerId", "username email avatarURL");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ productId: id })
      .populate("reviewerId", "username email avatarURL") 
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// [GET] /products/category/:categoryId
export const getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({ categoryId: categoryId });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error(" Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

