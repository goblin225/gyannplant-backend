const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: Schema.Types.ObjectId }],
  completionPercent: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

courseProgressSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);