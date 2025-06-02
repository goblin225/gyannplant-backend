const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      required: [true, 'At least one requirement is required'],
    },
    jobType: {
      type: String,
      enum: ['Full time', 'Part time', 'Internship', 'Contract'],
      required: [true, 'Job type is required'],
    },
    remote: {
      type: Boolean,
      default: false,
    },
    salary: {
      type: String,
      required: [true, 'Salary details are required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
