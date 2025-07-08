const express = require('express');
const router = express.Router();
const { enrollCourse, getEnrollments } = require('../controllers/enrollmentController');

router.post('/enroll-user-course/:courseId', enrollCourse);
router.get('/get-enrollment/:userId', getEnrollments);

module.exports = router;