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

    const { id: userId } = req.params;
    const { name, email, phoneNumber, profile_pic, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profile_pic) updateData.profile_pic = profile_pic;
    if (role) updateData.role = role;

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
