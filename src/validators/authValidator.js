import { check, validationResult } from 'express-validator';
import { sendErrorMessage } from '../utils/response.js';

export const sendOtpValidationRules = [
  check('phoneNumber', 'Phone number is required').notEmpty(),
];

export const verifyOtpValidationRules = [
  check('phoneNumber', 'Phone number is required').notEmpty(),
  check('otp', 'OTP is required').notEmpty(),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorMessage(res, errors.array().map((err) => err.msg).join(', '));
  }
  next();
};
