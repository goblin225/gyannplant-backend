const express = require('express');
const router = express.Router();
const { createLeaderboard, getLeaderboard } = require('../controllers/leaderBoardController');

router.post('/create-leader', createLeaderboard);
router.get('/get-leader', getLeaderboard);

module.exports = router;