const mongoose = require('mongoose');
const { Schema } = mongoose;
const Course = require('./Course');

const questionSchema = new Schema({
  question: { 
    type: String, 
    required: [true, 'Question text is required']
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(opts) {
        return opts.length >= 2 && opts.length <= 5;
      },
      message: 'Question must have between 2 and 5 options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    validate: {
      validator: function(value) {
        return this.options.includes(value);
      },
      message: 'Correct answer must be one of the provided options'
    }
  },
  marks: { 
    type: Number, 
    default: 1,
    min: [1, 'Marks must be at least 1']
  }
});

const AssessmentSchema = new Schema({
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, 'Course reference is required'],
    validate: {
      validator: async function(courseId) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) return false;
        const course = await Course.exists({ _id: courseId });
        return course;
      },
      message: 'Referenced course does not exist'
    },
    immutable: true
  },
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(qs) {
        return qs.length > 0;
      },
      message: 'Assessment must have at least one question'
    }
  },
  totalMarks: { 
    type: Number,
    default: 0,
    min: [1, 'Total marks must be at least 1']
  },
  passPercentage: { 
    type: Number, 
    default: 60,
    min: [0, 'Pass percentage cannot be negative'],
    max: [100, 'Pass percentage cannot exceed 100']
  },
  timeLimit: { 
    type: Number,
    default: 30,
    min: [1, 'Time limit must be at least 1 minute']
  },
  maxAttempts: { 
    type: Number,
    default: 1,
    min: [1, 'Max attempts must be at least 1']
  },
  availableFrom: {
    type: Date,
    validate: {
      validator: function(date) {
        return !this.availableTo || date < this.availableTo;
      },
      message: 'Available from date must be before available to date'
    }
  },
  availableTo: Date,
  isPublished: { 
    type: Boolean,
    default: false 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

AssessmentSchema.virtual('courseDetails', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true
});

AssessmentSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

AssessmentSchema.statics.updateCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    { 
      $group: {
        _id: '$course',
        assessmentCount: { $sum: 1 },
        avgMarks: { $avg: '$totalMarks' }
      } 
    }
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      assessmentCount: stats[0].assessmentCount,
      averageAssessmentMarks: stats[0].avgMarks
    });
  }
};

AssessmentSchema.post('save', function(doc) {
  doc.constructor.updateCourseStats(doc.course);
});

AssessmentSchema.post('deleteOne', { document: true }, function(doc) {
  doc.constructor.updateCourseStats(doc.course);
});

AssessmentSchema.index({ course: 1, isPublished: 1 });
AssessmentSchema.index({ availableFrom: 1, availableTo: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);