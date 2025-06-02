const express = require('express');
const router = express.Router();
const { applyToJob, getAllApplications } = require('../controllers/applicationController');

router.post('/apply-job', applyToJob);
router.get('/getall-jobapplication', getAllApplications);

module.exports = router;