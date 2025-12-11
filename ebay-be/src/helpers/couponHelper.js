import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

export const calculateCouponForCart = async (userId, cart, couponCode) => {
  const user = await User.findById(userId).populate("availableCoupons");
  if (!user) throw new Error("User not found");

  const coupon = user.availableCoupons.find((c) => c.code === couponCode);
  if (!coupon) throw new Error("Coupon not available for this user");

  if (coupon.status !== "active") throw new Error("Coupon is not active");
  if (new Date(coupon.startDate) > new Date())
    throw new Error("Coupon not yet valid");
  if (new Date(coupon.endDate) < new Date())
    throw new Error("Coupon has expired");

  if (coupon.maxUsage) {
    const totalUsed = coupon.usedBy.reduce((sum, u) => sum + u.usedCount, 0);
    if (totalUsed >= coupon.maxUsage)
      throw new Error("Coupon max usage reached");
  }

  const userUsed = coupon.usedBy.find((u) => u.userId.toString() === userId);
  if (userUsed && userUsed.usedCount >= coupon.maxUsagePerUser)
    throw new Error("You have already used this coupon the maximum times");

  let cartTotal = 0;
  for (const item of cart.items) {
    const productPrice = item.productId.price || 0;
    if (
      !coupon.productIds ||
      coupon.productIds.length === 0 ||
      coupon.productIds.some((id) => id.equals(item.productId._id))
    ) {
      cartTotal += productPrice * item.quantity;
    }
  }

  if (cartTotal < (coupon.minOrderValue || 0))
    throw new Error(
      `Cart total must be at least ${coupon.minOrderValue} to apply this coupon`
    );

  let discountAmount = (cartTotal * coupon.discountPercent) / 100;
  if (coupon.maxDiscountAmount)
    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);

  const totalAfterDiscount = cartTotal - discountAmount;

  return {
    couponId: coupon._id,
    code: coupon.code,
    cartTotal,
    discountAmount,
    totalAfterDiscount,
  };
};

/**
 * Updates coupon usage after a successful order/payment.
 * @param {string} userId - The ID of the user.
 * @param {string} couponId - The ID of the coupon used.
 */
export const applyCouponToOrder = async (userId, couponId) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    if (!user.usedCoupons.some((id) => id.equals(couponId))) {
      user.usedCoupons.push(couponId);
    }

    await user.save({ session });

    const coupon = await Coupon.findById(couponId).session(session);
    if (!coupon) throw new Error("Coupon not found");

    const userUsedEntry = coupon.usedBy.find((entry) =>
      entry.userId.equals(userId)
    );

    if (userUsedEntry) {
      userUsedEntry.usedCount += 1;
    } else {
      coupon.usedBy.push({ userId, usedCount: 1 });
    }

    await coupon.save({ session });

    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Coupon applied successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
