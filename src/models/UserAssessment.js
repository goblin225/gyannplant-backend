const mongoose = require('mongoose');

const UserAssessmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    selectedAnswers: [{ questionId: String, selected: String }],
    obtainedMarks: Number,
    passed: Boolean,
    attemptedAt: { type: Date, default: Date.now },
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: String
  });
  
  module.exports = mongoose.model('UserAssessment', UserAssessmentSchema);  