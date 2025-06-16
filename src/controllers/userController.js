const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendError, sendSuccess, sendErrorMessage } = require('../utils/response');

exports.addUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = {
      ...req.body,
      password: hashedPassword
    };

    const user = new User(userData);
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();

    sendSuccess(res, 'User created successfully', userWithoutPassword);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('collegeId', 'collegeName mailId contactNumber address contactPersonName')
      .populate('roleId', 'name');

    sendSuccess(res, 'Users fetched successfully', users);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password')
    .populate('roleId', 'name');

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
    const { name, email, phoneNumber, profile_pic, roleId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profile_pic) updateData.profile_pic = profile_pic;
    if (roleId) updateData.roleId = roleId;

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

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return sendErrorMessage(res, 'User not found');
    sendSuccess(res, 'User Updated Successfully', user);
  } catch (err) {
    sendError(res, err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendErrorMessage(res, 'User not found');
    sendSuccess(res, 'User deleted successfully');
  } catch (err) {
    sendError(res, err);
  }
};