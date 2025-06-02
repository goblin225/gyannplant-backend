const express = require('express');
const router = express.Router();
const { createJob, getPublishedJobs } = require('../controllers/jobController');

router.post('/job-post', createJob);
router.get('/getall-jobpost', getPublishedJobs);

module.exports = router;