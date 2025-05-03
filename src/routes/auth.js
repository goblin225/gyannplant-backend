const { Router } = require('express');
const { verifyOtp, sendOtp } = require('../controllers/authController');
const { sendOtpValidationRules, validate } = require('../validators/authValidator');

const router = Router();

router.post('/send-otp',
  sendOtpValidationRules,
  validate,
  sendOtp
);

router.post('/verify-otp', verifyOtp);

module.exports = router;