const { sendSuccess, sendError, sendErrorMessage } = require('../utils/response');
const Leaderboard = require('../models/Leaderboard');

exports.createLeaderboard = async (req, res) => {
  try {
    console.log('Incoming body:', req.body);

    if (!req.body || typeof req.body !== 'object') {
      return sendError(res, 'Invalid request body.');
    }

    const { user, course, points, completedAssessments, averageScore } = req.body;

    if (!user || !course) {
      return sendError(res, 'User and Course are required fields.');
    }

    const leader = new Leaderboard({
      user,
      course,
      points,
      completedAssessments,
      averageScore
    });

    await leader.save();
    await Leaderboard.recalculateRanks(course);

    const { password, ...leaderWithoutPassword } = leader.toObject();

    sendSuccess(res, 'Leaderboard entry added and ranks updated.', leaderWithoutPassword);
  } catch (err) {
    console.error('Leaderboard creation failed:', err);
    sendError(res, 'Internal Server Error', 500, err.message || err);
  }
};


exports.getLeaderboard = async (req, res) => {
  try {
    const { user: userId, courseId } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (courseId) filter.course = courseId;

    const leaderboardData = await Leaderboard.find(filter)
      .populate('user', '-password')
      .populate('course', 'title')
      .sort({ rank: 1 });

    return res.status(200).json({
      success: true,
      message: 'Leaderboard data fetched successfully.',
      statusCode: 200,
      data: leaderboardData
    });
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      statusCode: 500,
      error: err.message
    });
  }
};