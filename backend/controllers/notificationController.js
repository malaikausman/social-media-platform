const Notification = require("../models/Notification");


const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      message: "Failed to load notifications",
    });
  }
};


const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark notifications as read error:",
      error
    );

    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead,
};