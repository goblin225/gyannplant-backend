const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendCreated, sendErrorMessage, sendError, sendSuccess } = require('../utils/response');
require('dotenv').config();

const STATIC_OTP = '1234';
const OTP_EXPIRY_MINUTES = 5;

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return sendErrorMessage(res, 'Phone number is required');
    }

    let user = await User.findOne({ phoneNumber });

    const otpData = {
      code: STATIC_OTP,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    };

    if (!user) {
      user = new User({
        phoneNumber,
        otp: otpData,
      });
    } else {
      user.otp = otpData;
    }

    await user.save();

    return sendSuccess(res, 'OTP sent successfully', { phoneNumber });
  } catch (error) {
    sendError(res, error);
  }
};

// Verify OTP and Login
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, fcmToken } = req.body;

    if (!phoneNumber || !otp) {
      return sendErrorMessage(res, 'Phone number and OTP are required');
    }

    const user = await User.findOne({ phoneNumber });

    if (!user || !user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
      return sendErrorMessage(res, 'Invalid or expired OTP');
    }

    user.otp = undefined;

    if (fcmToken) {
      user.fcmToken = fcmToken;
    }

    await user.save();

    const accessToken = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber, },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber, refresh: true },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    sendSuccess(res, 'OTP verified successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phoneNumber,
      profile_pic: user.profile_pic,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.validateToken = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  sendSuccess({ message: 'Token is valid', accessToken: token });
};

exports.refreshToken = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  const newAccessToken = 'newsampleaccesstoken456';

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });

  sendSuccess({ message: 'Token refreshed', accessToken: newAccessToken });
};