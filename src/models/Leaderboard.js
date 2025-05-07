// models/Leaderboard.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaderboardSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: true 
  },
  points: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  completedAssessments: {
    type: Number,
    default: 0,
    min: 0 
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

leaderboardSchema.index({ course: 1, points: -1 });
leaderboardSchema.index({ user: 1, course: 1 }, { unique: true });

leaderboardSchema.statics.updateStats = async function(userId, courseId) {
  const UserProgress = mongoose.model('UserProgress');
  
  const [progress, attempts] = await Promise.all([
    UserProgress.findOne({ user: userId, course: courseId }),
    this.aggregate([
      { $match: { course: courseId } },
      { $group: { _id: null, avgPoints: { $avg: "$points" } } }
    ])
  ]);

  if (!progress) return;

  const passedAssessments = progress.assessments.filter(a => a.passed).length;
  const avgScore = progress.assessments.length > 0 
    ? progress.assessments.reduce((sum, a) => sum + (a.score/a.totalMarks)*100, 0) / progress.assessments.length
    : 0;

  return this.findOneAndUpdate(
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
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);