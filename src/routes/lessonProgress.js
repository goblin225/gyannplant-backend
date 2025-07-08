const express = require('express');
const router = express.Router();
const { lessonStart, lessonEnd } = require('../controllers/lessonProgressController');

router.post('/lesson-start', lessonStart);
router.post('/lesson-end', lessonEnd);

module.exports = router;