const mongoose = require('mongoose');
const { Schema } = mongoose;
const Course = require('./Course');

const questionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1, min: 1 }
});

const AssessmentSchema = new Schema({
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  questions: [questionSchema],
  totalMarks: { type: Number, default: 0 },
  passPercentage: { 
    type: Number, 
    default: 60,
    min: 0,
    max: 100 
  },
  timeLimit: { 
    type: Number,
    default: 30,
    min: 1 
  },
  maxAttempts: { 
    type: Number,
    default: 1,
    min: 1 
  },
  availableFrom: Date,
  availableTo: Date,
  isPublished: { 
    type: Boolean,
    default: false 
  }
}, { 
  timestamps: true 
});

AssessmentSchema.pre('save', function(next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  next();
});

const updateCourseStats = async function(courseId) {
  const [count, avgScore] = await Promise.all([
    this.countDocuments({ course: courseId }),
    this.aggregate([
      { $match: { course: courseId } },
      { $group: { _id: null, avg: { $avg: "$totalMarks" } } }
    ])
  ]);
  
  await Course.findByIdAndUpdate(courseId, { 
    assessmentCount: count,
    avgAssessmentScore: avgScore[0]?.avg || 0 
  });
};

AssessmentSchema.post('save', function() {
  updateCourseStats.call(this.constructor, this.course);
});

AssessmentSchema.post('remove', function() {
  updateCourseStats.call(this.constructor, this.course);
});

module.exports = mongoose.model('Assessment', AssessmentSchema);