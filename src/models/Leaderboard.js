const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserProgress = require('./UserCourseProgress');

const leaderboardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  points: { type: Number, default: 0, min: 0 },
  completedAssessments: { type: Number, default: 0, min: 0 },
  averageScore: { type: Number, default: 0, min: 0, max: 100 },
  lastActivity: { type: Date, default: Date.now },
  rank: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true
});

leaderboardSchema.index({ course: 1, points: -1 });
leaderboardSchema.index({ user: 1, course: 1 }, { unique: true });

leaderboardSchema.statics.updateStats = async function (userId, courseId) {
  const [progress, attempts] = await Promise.all([
    UserProgress.findOne({ userId: userId, courseId: courseId }),
    this.aggregate([
      { $match: { course: courseId } },
      { $group: { _id: null, avgPoints: { $avg: "$points" } } }
    ])
  ]);

  if (!progress) return;

  const passedAssessments = progress.assessments.filter(a => a.passed).length;
  const avgScore = progress.assessments.length > 0
    ? progress.assessments.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) / progress.assessments.length
    : 0;

  await this.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      points: progress.points,
      completedAssessments: passedAssessments,
      averageScore: avgScore,
      lastActivity: new Date(),
      percentile: attempts[0] ? (progress.points / attempts[0].avgPoints) * 100 : 0
    },
    { upsert: true, new: true }
  );

  await this.recalculateRanks(courseId);
};

leaderboardSchema.statics.recalculateRanks = async function (courseId) {
  const leaders = await this.find({ course: courseId }).sort({ points: -1 });

  for (let i = 0; i < leaders.length; i++) {
    leaders[i].rank = i + 1;
    await leaders[i].save();
  }
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);