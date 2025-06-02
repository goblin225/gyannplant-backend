const mongoose = require('mongoose');
const { Schema } = mongoose;

const applicationSchema = new Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  appliedAt: { type: Date, default: Date.now }  
}, {
  timestamps: true,
});

module.exports = mongoose.model('Application', applicationSchema);