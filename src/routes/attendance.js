const express = require('express');
const router = express.Router();
const { markAttendanceIfWithinTime, getAllAttendance, getFilteredAttendance } = require('../controllers/attendanceController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/mark-attendance/:userId', authenticateToken, markAttendanceIfWithinTime);
router.get('/get-allattendance', getAllAttendance);
router.get('/filter-attendance', getFilteredAttendance);

module.exports = router;