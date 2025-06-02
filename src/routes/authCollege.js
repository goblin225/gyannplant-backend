const { Router } = require('express');
const { registerCollege } = require('../controllers/collegeController');

const router = Router();

router.post('/reg-college',
    registerCollege
);

// router.post('/verify-otp', verifyOtp);

module.exports = router;