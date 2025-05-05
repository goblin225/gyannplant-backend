const User = require('../models/User');
const { sendError, sendSuccess } = require('../utils/response');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password');

    sendSuccess(res, 'Users fetched successfully', users);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return sendErrorMessage(res, 'User not found');
    }

    sendSuccess(res, 'User fetched successfully', user);
  } catch (error) {
    sendError(res, error);
  }
};

exports.updateUserProfile = async (req, res) => {
  try {

    const userId = req.params.id;
    const { name, email, phone_number } = req.body;

    const updateData = {};
    if (name) updateData.full_name = name;
    if (email) updateData.email = email;
    if (phone_number) updateData.phone_number = phone_number;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return sendErrorMessage(res, 'User not found');
    }

    sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    sendError(res, error);
  }
};
