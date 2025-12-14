import cron from "node-cron";
import Order from "../models/Order.js";
import { createNotification } from "../helpers/notificationHelper.js";

const PAYMENT_TIMEOUT_MINUTES = 3;

export const startAutoCancelOrders = () => {
  cron.schedule("* * * * *", async () => {
     console.log(" Cron auto-cancel đang chạy...");
    try {
      const now = new Date();
      const expiredTime = new Date(
        now.getTime() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000
      );

      const expiredOrders = await Order.find({
        status: "Pending",
        orderDate: { $lt: expiredTime },
      });

      for (const order of expiredOrders) {
  order.status = "Canceled";
  await order.save();

  await createNotification({
    targetType: "single",
    userId: order.buyerId,
    title: " Order Auto-Canceled",
    message: `Your order #${order._id} was automatically canceled due to unpaid timeout (30 minutes).`,
    link: `/order/${order._id}`,
    data: {
      orderId: order._id,
      status: "Canceled",
      reason: "PAYMENT_TIMEOUT",
    },
  });

  console.log(` Auto-canceled order: ${order._id}`);
}

    } catch (err) {
      console.error(" Auto cancel job error:", err);
    }
  });
};
