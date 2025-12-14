import { calculateCouponForCart } from "../helpers/couponHelper.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        populate: {
          path: "sellerId",
          select: "username",
        },
      })
      .lean();

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    const formatted = cart.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      price: item.productId.price,
      description: item.productId.description,
      quantity: item.quantity,
      sellerId: item.productId.sellerId,
      title: item.productId.title,
    }));
    cart.items = formatted;
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting cart",
      error,
    });
  }
};

/**
 * POST /api/cart/add
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart)
      cart = await Cart.create({ userId, items: [{ productId, quantity }] });
    else {
      const itemIndex = cart.items.findIndex(
        (i) => i.productId.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      cart.updatedAt = Date.now();
      await cart.save();
    }

    await cart.populate("items.productId");
    return res.status(200).json({
      success: true,
      cart,
      count: cart.items.reduce((s, i) => s + i.quantity, 0),
    });
  } catch (error) {
    console.error("Error adding product to cart: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding product to cart",
      error,
    });
  }
};

/**
 * PATCH /api/cart/update
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    if (!productId || quantity == null)
      return res
        .status(400)
        .json({ success: false, message: "Missing productId or quantity" });

    if (quantity < 1)
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be >= 1" });
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.productId");
    return res
      .status(200)
      .json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart",
      error,
    });
  }
};

/**
 * DELETE /api/cart/remove/:productId
 */

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    await cart.save();
    res.status(200).json({ success: true, message: "Item removed", cart });
  } catch (error) {
    console.error("Remove from cart error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from cart",
      error,
    });
  }
};

/**
 * DELETE /api/cart/clear
 */

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    cart.items = [];
    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    console.error("Clear cart error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
      error,
    });
  }
};
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User ID not found." });
    }

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code required" });
    }

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const result = await calculateCouponForCart(userId, cart, code);

    return res.status(200).json({
      success: true,
      message: `Coupon ${code} applied successfully (calculation only)`,
      ...result,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Invalid coupon or calculation error",
    });
  }
};

// POST /api/cart/merge
export const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items to merge" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    for (const it of items) {
      if (!it?.productId || !it?.quantity) continue;
      const idx = cart.items.findIndex(
        (i) => i.productId.toString() === String(it.productId)
      );
      if (idx > -1) {
        cart.items[idx].quantity += Number(it.quantity) || 1;
      } else {
        cart.items.push({
          productId: it.productId,
          quantity: Number(it.quantity) || 1,
        });
      }
    }
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate("items.productId");

    return res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      cart,
      count: cart.items.reduce((s, i) => s + i.quantity, 0),
    });
  } catch (error) {
    console.error("Merge cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while merging cart" });
  }
};

export const getCartBySeller = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        model: Product,
        select: "name price images description sellerId",
        populate: {
          path: "sellerId",
          model: User,
          select: "_id username email",
        },
      })
      .lean();

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          userId,
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    const groupedItems = {};
    let totalItems = 0;
    let subtotal = 0;

    cart.items.forEach((cartItem) => {
      if (!cartItem.productId) return;

      const product = cartItem.productId;
      const seller = product.sellerId;
      const sellerId = seller._id.toString();

      const price = parseFloat(product.price) || 0;
      const quantity = cartItem.quantity || 0;

      totalItems += quantity;
      subtotal += price * quantity;

      const { sellerId: _, ...productDetails } = product;
      const productWithQuantity = {
        ...productDetails,
        quantity: quantity,
      };

      if (!groupedItems[sellerId]) {
        groupedItems[sellerId] = {
          seller: seller,
          products: [],
        };
      }

      groupedItems[sellerId].products.push(productWithQuantity);
    });

    const formattedItems = Object.values(groupedItems);

    const formattedCart = {
      userId: cart.userId,
      items: formattedItems,
      totalItems: totalItems,
      subtotal: subtotal,
    };

    return res.status(200).json({ success: true, cart: formattedCart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
