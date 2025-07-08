const mongoose = require('mongoose');
const { Schema } = mongoose;

const lessonWatchLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: Schema.Types.ObjectId, required: true },
  startTime: Date,
  endTime: Date,
  durationInSeconds: Number
}, { timestamps: true });

module.exports = mongoose.model('LessonWatchLog', lessonWatchLogSchema);
