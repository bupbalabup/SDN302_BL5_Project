import UserNotification from "../models/UserNotification.js";
import Notification from "../models/Notification.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await UserNotification.find({
      userId: userId,
    })
      .populate({
        path: "notificationId",
        model: Notification,
        select: "title message link data targetType createdAt",
      })
      .sort({ createdAt: -1 });

    const unReadNotifs = notifications.filter((noti) => !noti.isRead);

    const formatted = notifications.map((notif) => ({
      id: notif._id,
      title: notif.notificationId.title,
      message: notif.notificationId.message,
      link: notif.notificationId.link,
      data: notif.notificationId.data,
      time: notif.createdAt,
      unread: !notif.isRead,
    }));
    res.status(200).json({
      success: true,
      unReadCount: unReadNotifs.length,
      notifications: formatted,
    });
  } catch (error) {
    console.error("Error fetching user notifications: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting notifications",
      error,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const userNotif = await UserNotification.findById(id);

    if (!userNotif)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    if (userNotif.userId.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    if (!userNotif.isRead) {
      userNotif.isRead = true;
      userNotif.readAt = new Date();
      await userNotif.save();
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: userNotif,
    });
  } catch (error) {
    console.error("Error updating notification: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notification",
      error,
    });
  }
};
