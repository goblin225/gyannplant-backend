const mongoose = require('mongoose');
const { Schema } = mongoose;

const userLessonProgressSchema = new Schema({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const userAssessmentSchema = new Schema({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number
  },
  passed: {
    type: Boolean,
    default: false
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  answers: [{
    questionId: Schema.Types.ObjectId,
    selectedOption: String,
    isCorrect: Boolean,
    marksObtained: Number
  }]
});

const certificateSchema = new Schema({
  certificateId: {
    type: String,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  downloadUrl: {
    type: String
  }
});

const userCourseProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lessons: [userLessonProgressSchema],
  assessments: [userAssessmentSchema],
  certificates: [certificateSchema],
  points: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date
  }
}, {
  timestamps: true
});

userCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('UserCourseProgress', userCourseProgressSchema);