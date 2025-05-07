const express = require('express');
const router = express.Router();
const { createCourse, getCourse, getCourseById, editCourse, deleteCourse } = require('../controllers/courseController');

router.post('/create-course', createCourse);
router.get('/get-course', getCourse);
router.get('/:courseId', getCourseById);
router.put('/edit-course/:courseId', editCourse);
router.delete('/delete-course/:courseId', deleteCourse);

module.exports = router;