const express = require('express');
const router = express.Router();
const { uploadLocal } = require('../utils/localFileUpload');
const { createAssessment, uploadAssessmentFromFile, submitAssessment, getAllAssessments } = require('../controllers/assessmentController');

router.post('/create-question', createAssessment);
router.post('/create-question/upload', uploadLocal.single('file'), uploadAssessmentFromFile);
router.get('/get-questions', getAllAssessments);
router.post('/:assessmentId/submit', submitAssessment);
// router.put('/assessment/:assessmentId/question/:questionId', updateQuestion);
// router.delete('/assessment/:assessmentId/question/:questionId', deleteQuestion);

module.exports = router;