const mongoose = require('mongoose');

const stepLogSchema = new mongoose.Schema({
  stepTitle: String,
  type: String,
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  completed: { type: Boolean, default: false },
  watchedDuration: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  completedAt: Date
}, { _id: false });

const TaskProgressSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Not-Started', 'In-progress', 'Completed', 'Expired'],
    default: 'Not-Started'
  },
  startedAt: Date,
  completedAt: Date,
  timeTakenMinutes: Number,
  pointsEarned: { type: Number, default: 0 },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  stepLog: [stepLogSchema]

}, { timestamps: true });

module.exports = mongoose.model('TaskProgress', TaskProgressSchema);