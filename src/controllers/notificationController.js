const Notification = require('../models/Notification');
const TaskProgress = require('../models/TaskProgress');
const { sendSuccess, sendError } = require('../utils/response');

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('taskId')
      .lean();

    const taskIds = notifications.map(n => n.taskId?._id).filter(Boolean);

    const progressList = await TaskProgress.find({
      userId,
      taskId: { $in: taskIds }
    }).lean();

    const progressMap = {};
    progressList.forEach(progress => {
      progressMap[progress.taskId.toString()] = progress;
    });

    const enrichedNotifications = notifications.map(notification => {
      if (notification.taskId) {
        const progress = progressMap[notification.taskId._id.toString()];
        notification.taskId.progress = progress || null;
      }
      return notification;
    });

    sendSuccess(res, 'Notifications fetched successfully', enrichedNotifications)
  } catch (err) {
    console.error("Error fetching notifications:", err);
    sendError(res, 'Failed to fetch notifications');
  }
};
