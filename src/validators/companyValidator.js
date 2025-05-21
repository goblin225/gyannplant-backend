import { check, validationResult } from 'express-validator';
import { sendErrorMessage } from '../utils/response.js';

export const createCompanyValidationRules = [
  check('companyName', 'Company name is required').notEmpty(),
  check('representativeName', 'Representative name is required').notEmpty(),
  check('email', 'Valid email is required').isEmail(),
  check('phoneNumber', 'Phone number is required').notEmpty(),
  check('password', 'Password is required'),
];

export const updateCompanyValidationRules = [
  check('email').optional().isEmail().withMessage('Must be a valid email'),
  check('password')
    .optional()
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorMessage(res, errors.array().map((err) => err.msg).join(', '));
  }
  next();
};
