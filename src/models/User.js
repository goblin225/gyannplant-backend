const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    name: {
      type: String
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    profile_pic: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    fcmToken: { type: String },
    password: {
      type: String
    },
    completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
