import { handleServerError } from "../helpers/index.js";
import { createNotification } from "../helpers/notificationHelper.js";
import Order from "../models/Order.js";
import ReturnRequest from "../models/ReturnRequest.js";
import ShippingInfo from "../models/ShippingInfo.js";

/**
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  const buyerId = req.user.id;
  const { addressId, items, totalPrice } = req.body;

  if (!addressId || !items || items.length === 0 || !totalPrice) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: addressId, items, or totalPrice",
    });
  }

  try {
    const newOrder = new Order({
      buyerId,
      addressId,
      items,
      totalPrice,
      status: "Processing",
    });

    const savedOrder = await newOrder.save();

    const estimateArrivalDate = new Date();
    // Giả sử 5 ngày giao
    estimateArrivalDate.setDate(estimateArrivalDate.getDate() + 5);

    const newShippingInfo = new ShippingInfo({
      orderId: savedOrder._id,
      carrier: "FastExpress",
      trackingNumber: `TRACK-${Date.now()}`,
      estimateArrival: estimateArrivalDate,
      status: "Pending_Pickup",
    });

    const savedShippingInfo = await newShippingInfo.save();

    await createNotification({
      targetType: "single",
      userId: buyerId,
      title: "🎉 Order Created Successfully!",
      message: `Your order #${
        savedOrder._id
      } is being processed. Tracking number: ${
        savedShippingInfo.trackingNumber
      }. Estimated arrival: ${estimateArrivalDate.toLocaleDateString()}.`,
      link: `/order/${savedOrder._id}`,
      data: {
        orderId: savedOrder._id,
        status: savedOrder.status,
        trackingNumber: savedShippingInfo.trackingNumber,
      },
    });

    return res.status(201).json({
      success: true,
      order: savedOrder,
      shippingInfo: savedShippingInfo,
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!Order.schema.path("status").enumValues.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order status value" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const oldStatus = order.status;
    order.status = status;
    const updatedOrder = await order.save();

    let shippingStatusUpdate = {};

    if (status === "Delivered") {
      shippingStatusUpdate = { deliveredDate: new Date(), status: "Delivered" };
    } else if (status === "Canceled") {
      shippingStatusUpdate = { status: "Canceled" };
    } else if (status === "Shipped") {
      shippingStatusUpdate = { status: "In_Transit" };
    }

    if (Object.keys(shippingStatusUpdate).length > 0) {
      await ShippingInfo.updateOne(
        { orderId: updatedOrder._id },
        { $set: shippingStatusUpdate }
      );
    }

    if (oldStatus !== status) {
      let title = "📦 Order Status Updated";
      let message = `Your order #${updatedOrder._id} status has been updated to: **${status}**`;

      await createNotification({
        targetType: "single",
        userId: updatedOrder.buyerId,
        title,
        message,
        link: `/order/${updatedOrder._id}`,
        data: { orderId: updatedOrder._id, status: updatedOrder.status },
      });
    }

    return res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route PUT /api/shipping/:orderId/status
 */
export const updateShippingInfoStatus = async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.orderId;

  if (!ShippingInfo.schema.path("status").enumValues.includes(status)) {
    return res.status(400).json({ message: "Invalid shipping status value" });
  }

  try {
    const shippingInfo = await ShippingInfo.findOne({ orderId });
    if (!shippingInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping Info not found" });
    }

    const oldStatus = shippingInfo.status;
    shippingInfo.status = status;

    if (status === "Delivered" && shippingInfo.deliveredDate === undefined) {
      shippingInfo.deliveredDate = new Date();
      await Order.updateOne(
        { _id: orderId },
        { $set: { status: "Delivered" } }
      );
    }

    const updatedShippingInfo = await shippingInfo.save();

    if (
      oldStatus !== status &&
      (status === "Out_for_Delivery" || status === "Delivered")
    ) {
      const order = await Order.findById(orderId);
      let title =
        status === "Delivered" ? "✅ Order Delivered!" : "🔔 Out for Delivery!";
      let message =
        status === "Delivered"
          ? `Your order #${orderId} has been successfully delivered.`
          : `Your order #${orderId} is currently out for delivery.`;

      await createNotification({
        targetType: "single",
        userId: order.buyerId,
        title,
        message,
        link: `/order/${orderId}`,
      });
    }

    return res.status(200).json({ success: true, updatedShippingInfo });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route POST /api/orders/:id/return
 */
/**
 * @route POST /api/orders/:id/return
 */
export const createReturnRequest = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not the owner of the order",
      });
    }

    // Thêm điều kiện kiểm tra nếu status đã là 'RequestReturned' để tránh tạo request trùng lặp
    if (order.status === "RequestReturned") {
      return res.status(400).json({
        success: false,
        message: "A return request is already in progress for this order.",
      });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot request return: Order status is not Delivered.",
      });
    }

    const shippingInfo = await ShippingInfo.findOne({ orderId: orderId });

    if (!shippingInfo || !shippingInfo.deliveredDate) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot request return: Delivered date is missing. Please contact support.",
      });
    }

    const deliveredDate = shippingInfo.deliveredDate;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (deliveredDate < sevenDaysAgo) {
      const expiryDate = new Date(
        deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000
      ).toDateString();
      return res.status(400).json({
        success: false,
        message: `Cannot request return: The 7-day return period expired on ${expiryDate}.`,
      });
    }

    const existingRequest = await ReturnRequest.findOne({
      orderId,
      status: { $in: ["pending", "approved"] },
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "A return request is already pending or approved for this order",
      });
    }

    const newRequest = new ReturnRequest({
      orderId,
      userId,
      reason,
    });

    const savedRequest = await newRequest.save();

    order.status = "RequestReturned";
    await order.save();

    await createNotification({
      targetType: "single",
      userId: userId,
      title: "🔄 Return Request Submitted",
      message: `Your return request for order #${orderId} has been successfully submitted and is now **Pending** review.`,
      link: `/returns/${savedRequest._id}`,
      data: {
        requestId: savedRequest._id,
        orderId: orderId,
        status: "pending",
      },
    });

    return res.status(201).json({ success: true, savedRequest });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route PUT /api/returns/:id/status
 */
export const updateReturnRequestStatus = async (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  if (!ReturnRequest.schema.path("status").enumValues.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid return request status value" });
  }

  try {
    const returnRequest = await ReturnRequest.findById(requestId).populate(
      "orderId"
    );
    if (!returnRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Return Request not found" });
    }

    const oldStatus = returnRequest.status;
    returnRequest.status = status;
    const updatedRequest = await returnRequest.save();

    if (oldStatus !== status) {
      let title = "🔄 Return Request Update";
      let message = `Your return request #${requestId} for order ${returnRequest.orderId._id} has been updated to: **${status}**`;

      const order = returnRequest.orderId;

      if (status === "approved" || status === "completed") {
        order.status = "Returned";
        await order.save();

        if (status === "approved") {
          title = "🎉 Return Request Approved!";
          message = `Your return request for order #${order._id} has been **APPROVED**. Please follow the return instructions. The order status has been updated to **Returned**.`;
        } else {
          title = "✅ Return Process Completed";
          message = `The return process for order #${order._id} is **COMPLETED** (refund processed). The order status is now **Returned**.`;
        }
      } else if (status === "rejected") {
        if (order.status !== "Delivered") {
          order.status = "Delivered";
          await order.save();
        }
        title = "😔 Return Request Rejected";
        message = `Your return request for order #${order._id} has been **REJECTED**. Contact support for details. The order status has been reset to **Delivered**.`;
      }

      await createNotification({
        targetType: "single",
        userId: returnRequest.userId,
        title,
        message,
        link: `/returns/${requestId}`,
        data: { requestId, status },
      });
    }

    return res.status(200).json({ success: true, updatedRequest });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route GET /api/orders/:id
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate({
        path: "buyerId",
        select: "email fullname role",
      })
      .populate({
        path: "addressId",
        select: "fullname phone street city state country isDefault",
      })
      .populate({
        path: "items.productId",
        select: "title description price images categoryId sellerId",
        populate: {
          path: "sellerId",
          select: "fullname email",
        },
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const shippingInfo = await ShippingInfo.findOne({
      orderId: id,
    }).lean();

    return res.status(200).json({
      success: true,
      order,
      shippingInfo,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
/**
 * @route GET /api/orders/my
 */
export const getUserOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.find({ buyerId })
      .populate("addressId")
      .populate({
        path: "items.productId",
        select: "title price images",
      })
      .sort({ orderDate: -1 })
      .lean();

    if (orders.length === 0) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orderIds = orders.map((order) => order._id);
    const shippingInfos = await ShippingInfo.find({
      orderId: { $in: orderIds },
    }).lean();

    const ordersWithDetails = orders.map((order) => {
      const shippingInfo = shippingInfos.find(
        (info) => info.orderId.toString() === order._id.toString()
      );

      return {
        ...order,
        shippingInfo: shippingInfo || null,
      };
    });

    return res.status(200).json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @route PUT /api/orders/:id/cancel
 * Cho phép người dùng (buyer) hủy đơn hàng
 */
export const cancelOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not the owner of the order",
      });
    }

    if (order.status !== "Pending" && order.status !== "Processing") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status is **${order.status}**.`,
      });
    }

    order.status = "Canceled";
    const updatedOrder = await order.save();

    await ShippingInfo.updateOne(
      { orderId: updatedOrder._id },
      { $set: { status: "Canceled" } }
    );

    await createNotification({
      targetType: "single",
      userId: userId,
      title: "❌ Order Canceled",
      message: `Your order #${updatedOrder._id} has been successfully **Canceled**.`,
      link: `/order/${updatedOrder._id}`,
      data: { orderId: updatedOrder._id, status: updatedOrder.status },
    });

    return res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
    return handleServerError(res, error);
  }
};
