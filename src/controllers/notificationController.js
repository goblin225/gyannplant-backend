const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        sendSuccess(res, 'Notification fetched successfully', notifications);
    } catch (err) {
        sendError(res, 'Error fetch notification', err);
    }
};