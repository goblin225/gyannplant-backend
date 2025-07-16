const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserProgress = require('./UserCourseProgress');

const leaderboardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  points: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  completedAssessments: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0, min: 0, max: 100 },
  percentile: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  rank: { type: Number, default: 0 },
  quizzesPlayed: { type: Number, default: 0 },
  quizzesWon: { type: Number, default: 0 },
  badges: [{
    badgeType: { type: String, required: true },
    unlocked: { type: Boolean, default: false },
    earnedAt: { type: Date, default: null }
  }]
}, {
  timestamps: true
});

leaderboardSchema.index({ course: 1, points: -1 });
leaderboardSchema.index({ user: 1, course: 1 }, { unique: true });

// Update stats logic
leaderboardSchema.statics.updateStats = async function (userId, courseId, session = null) {
  const [progress, attempts] = await Promise.all([
    UserProgress.findOne({ userId, courseId }).session(session),
    this.aggregate([
      { $match: { course: courseId } },
      { $group: { _id: null, avgPoints: { $avg: "$points" } } }
    ]).session(session)
  ]);

  if (!progress) return;

  const passedAssessments = progress.assessments?.filter(a => a.passed).length || 0;
  const avgScore = progress.assessments?.length > 0
    ? progress.assessments.reduce((sum, a) => sum + ((a.score / a.totalMarks) * 100), 0) / progress.assessments.length
    : 0;

  const points = progress.points || 0;
  const exp = points;
  const level = Math.floor(exp / 500) + 1;
  const quizzesPlayed = progress.quizzesPlayed || 0;
  const quizzesWon = progress.quizzesWon || 0;

  // Define badges
  const badges = [
    {
      badgeType: 'starter',
      unlocked: passedAssessments >= 1,
      earnedAt: passedAssessments >= 1 ? new Date() : null
    },
    {
      badgeType: 'pro',
      unlocked: avgScore >= 90,
      earnedAt: avgScore >= 90 ? new Date() : null
    },
    {
      badgeType: 'warrior',
      unlocked: quizzesPlayed >= 25,
      earnedAt: quizzesPlayed >= 25 ? new Date() : null
    },
    {
      badgeType: 'winner',
      unlocked: quizzesWon >= 10,
      earnedAt: quizzesWon >= 10 ? new Date() : null
    }
  ];

  await this.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      points,
      level,
      exp,
      quizzesPlayed,
      quizzesWon,
      completedAssessments: passedAssessments,
      averageScore: parseFloat(avgScore.toFixed(2)),
      lastActivity: new Date(),
      percentile: attempts[0] ? Math.round((points / attempts[0].avgPoints) * 100) : 0,
      badges
    },
    { upsert: true, new: true, session }
  );

  await this.recalculateRanks(courseId, session);
};

// Recalculate ranks
leaderboardSchema.statics.recalculateRanks = async function (courseId, session = null) {
  const leaders = await this.find({ course: courseId })
    .sort({ points: -1 })
    .session(session);

  for (let i = 0; i < leaders.length; i++) {
    leaders[i].rank = i + 1;
    await leaders[i].save({ session });
  }
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);