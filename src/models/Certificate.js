const mongoose = require('mongoose');
const { Schema } = mongoose;

const certificateSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  downloadUrl: {
    type: String,
    required: true
  },
  assessmentScore: Number,
  completionDate: Date,
  expiryDate: Date,
  verificationCode: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('Certificate', certificateSchema);