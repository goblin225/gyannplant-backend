const express = require('express');
const router = express.Router();
const { createLeaderboard, getCategory } = require('../controllers/leaderBoardController');

router.post('/create-leader', createLeaderboard);
// router.get('/get-category', getCategory);

module.exports = router;