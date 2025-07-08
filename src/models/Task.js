const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'quiz', 'manual'], required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  points: { type: Number, default: 0 },
  required: { type: Boolean, default: true }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  deadlineHours: { type: Number, required: true },
  points: { type: Number, default: 0 },
  steps: [stepSchema],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  startTime: { type: Date, default: Date.now },
  expiryTime: { type: Date },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  taskDate: { type: Date, required: true }
}, { timestamps: true });

taskSchema.pre('save', function (next) {
  if (!this.expiryTime && this.deadlineHours) {
    this.expiryTime = new Date(this.startTime.getTime() + this.deadlineHours * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);