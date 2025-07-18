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

    const userMap = {};

    leaderboardData.forEach(entry => {
      const uid = entry.user?._id?.toString();
      if (!uid) return;

      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          _id: entry._id,
          name: entry.user?.name || '',
          email: entry.user?.email || '',
          profile_pic: entry.user?.profile_pic || '',
          level: entry.level,
          exp: entry.exp,
          points: entry.points,
          courses: [],
          completedCourses: 0,
          totalScore: 0,
          scoreCount: 0,
          rank: entry.rank,
          percentile: entry.percentile,
          quizzesPlayed: entry.quizzesPlayed,
          quizzesWon: entry.quizzesWon,
          badges: entry.badges?.map(b => ({
            type: b.badgeType,
            unlocked: b.unlocked,
            earnedAt: b.earnedAt
          })) || []
        };
      }

      userMap[uid].courses.push(entry.course?.title || '');
      userMap[uid].completedCourses += entry.completedAssessments || 0;
      userMap[uid].totalScore += entry.averageScore || 0;
      userMap[uid].scoreCount += 1;
    });

    const formattedData = Object.values(userMap).map(user => ({
      userId: user.userId,
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      level: user.level,
      exp: user.exp,
      points: user.points,
      courseTitles: user.courses,
      completedCourses: user.completedCourses,
      averageScore: user.scoreCount > 0 ? (user.totalScore / user.scoreCount) : 0,
      rank: user.rank,
      percentile: user.percentile,
      quizzesPlayed: user.quizzesPlayed,
      quizzesWon: user.quizzesWon,
      badges: user.badges
    }));

    return sendSuccess(res, 'Leaderboard data fetched successfully.', formattedData);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return sendError(res, 'Internal Server Error', 500, err.message);
  }
};