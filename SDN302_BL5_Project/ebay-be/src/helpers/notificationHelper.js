import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";
import User from "../models/User.js";

/**
 * Helper function to create new Notification
 *
 * @param {Object} options
 * @param {"single"|"all"|"multiple"} options.targetType
 * @param {String} options.title
 * @param {String} options.message
 * @param {String|ObjectId} [options.userId]
 * @param {Array<ObjectId>} [options.userIds]
 * @param {String} [options.link]
 * @param {Object} [options.data]
 */

export const createNotification = async ({
  targetType = "single",
  title,
  message,
  link = null,
  data = {},
  userId = null,
  userIds = [],
}) => {
  if (!title || !message)
    throw new Error("Missing required fields: title or message");
  try {
    const notification = await Notification.create({
      targetType,
      title,
      message,
      link,
      data,
      targetUsers:
        targetType === "single"
          ? [userId]
          : targetType === "multiple"
          ? userIds
          : [],
    });

    let targetUserIds = [];
    switch (targetType) {
      case "single":
        if (!userId)
          throw new Error("userId is required for single notification");
        targetUserIds = [userId];
        break;
      case "multiple":
        if (!userIds.length)
          throw new Error(
            "userIds array is required for multiple notification"
          );
        targetUserIds = userIds;
        break;
      case "all":
        const users = await User.find({}, "_id");
        targetUserIds = users.map((u) => u._id);
        break;
      default:
        throw new Error("Invalid targetType (single/multiple/all)");
    }

    if (targetUserIds.length > 0) {
      const userNotifs = targetUserIds.map((uid) => ({
        userId: uid,
        notificationId: notification._id,
      }));
      await UserNotification.insertMany(userNotifs);
    }

    return {
      notification,
      userCount: targetUserIds.length,
    };
  } catch (error) {
    console.log("Error creating notification:", error.message);
    throw error;
  }
};
