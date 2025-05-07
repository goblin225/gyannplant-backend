const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
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
    role: {
      type: String
    },
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
