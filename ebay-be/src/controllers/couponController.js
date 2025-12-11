import { createNotification } from "../helpers/notificationHelper.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

/**
 * Helper function to update availableCoupons for multiple users.
 * @param {ObjectId} couponId
 * @param {Array<ObjectId>} [targetUserIds] - If null, targets ALL users.
 */
const assignCouponToUsers = async (couponId, targetUserIds = null) => {
  const filter = targetUserIds ? { _id: { $in: targetUserIds } } : {};
  await User.updateMany(filter, { $addToSet: { availableCoupons: couponId } });
};

/**
 * [GET] /api/coupons
 */
export const getAllCoupons = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const coupons = await Coupon.find(filter).sort({ createAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

/**
 * [GET] /api/coupons/:id
 */
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

/**
 * [POST] /api/coupons
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountPercent,
      startDate,
      endDate,
      status = "active",
      type = "global",
      productIds = [],
      maxUsage,
      maxUsagePerUser = 1,
      minOrderValue,
      maxDiscountAmount,
      targetUserIds = [],
    } = req.body;

    const existing = await Coupon.findOne({ code });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });

    const newCoupon = await Coupon.create({
      code,
      discountPercent,
      startDate,
      endDate,
      status,
      type,
      productIds,
      maxUsage,
      maxUsagePerUser,
      minOrderValue,
      maxDiscountAmount,
    });

    if (type === "global") {
      await assignCouponToUsers(newCoupon._id);

      await createNotification({
        targetType: "all",
        title: "Coupon mới cho toàn bộ người dùng!",
        message: `Mã giảm giá ${code} đã được phát hành. Giảm ${discountPercent}% cho đơn hàng của bạn!`,
        link: `/coupons/${newCoupon._id}`,
        data: { couponId: newCoupon._id },
      });
    } else if (targetUserIds.length > 0) {
      await assignCouponToUsers(newCoupon._id, targetUserIds);

      await createNotification({
        targetType: "multiple",
        title: "You just received a new coupon code!",
        message: `Discount code ${discountPercent}% has been sent to your account: ${code}`,
        link: `/coupons/${newCoupon._id}`,
        data: { couponId: newCoupon._id },
        userIds: targetUserIds,
      });
    }

    res.status(201).json({
      success: true,
      message: "Coupon created successfully and notifications sent.",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error creating coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

/**
 * [PATCH] /api/coupons/:id
 */
export const updateCoupon = async (req, res) => {
  try {
    const updates = req.body;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res
      .status(200)
      .json({ success: true, message: "Coupon updated successfully", coupon });
  } catch (error) {
    console.error("Error updating coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

/**
 * [DELETE] /api/coupons/:id
 */
export const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });

    await User.updateMany(
      { $or: [{ availableCoupons: couponId }, { usedCoupons: couponId }] },
      {
        $pull: {
          availableCoupons: couponId,
          usedCoupons: couponId,
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

/**
 * [GET] /api/coupons/my
 */
export const getCouponsByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in token" });
    }
    const userId = req.user.id;
    const now = new Date();

    const user = await User.findById(userId).select("availableCoupons").lean();

    if (!user || !user.availableCoupons || user.availableCoupons.length === 0) {
      return res.status(200).json({ myCoupons: [] });
    }

    const coupons = await Coupon.find({
      _id: { $in: user.availableCoupons },
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select(
        "_id code discountPercent startDate endDate maxUsagePerUser type minOrderValue maxDiscountAmount productIds"
      )
      .lean();

    res.status(200).json({ myCoupons: coupons });
  } catch (error) {
    console.error("Error fetching coupons by user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * [POST] /api/coupons/use
 */
export const useCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponId } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User ID not found." });
    }

    if (!couponId) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon ID is required" });
    }

    const [user, coupon] = await Promise.all([
      User.findById(userId).select("availableCoupons usedCoupons"),
      Coupon.findById(couponId).select("_id"),
    ]);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    const couponIdStr = couponId.toString();
    const isAvailable = user.availableCoupons.some(
      (id) => id.toString() === couponIdStr
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Coupon not available in user's list or already used",
      });
    }

    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $pull: { availableCoupons: couponId },
        $addToSet: { usedCoupons: couponId },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to update user's coupon list. Check if coupon is available.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon successfully transferred from available to used list.",
    });
  } catch (error) {
    console.error("Use coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while recording coupon usage.",
    });
  }
};
