const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0), unique: false },
  markedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);