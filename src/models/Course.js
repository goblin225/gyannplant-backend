const mongoose = require('mongoose');
const { Schema } = mongoose;

const lessonSchema = new Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: String,
  duration: String,
  order: { type: Number, default: 0 }
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  description: String,
  category: String,
  role: String,
  lessons: [lessonSchema],
  duration: String,
  price: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  assessmentCount: { type: Number, default: 0 }
}, { timestamps: true });

courseSchema.virtual('lessonsCount').get(function() {
  return this.lessons.length;
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);