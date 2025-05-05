const express = require('express');
const router = express.Router();
const { createCourse, getCourse, getCourseById, deleteCourse } = require('../controllers/courseController');

router.post('/create-course', createCourse);
router.get('/get-course', getCourse);
router.get('/:courseId', getCourseById);
router.delete('/delete-course/:courseId', deleteCourse);

module.exports = router;