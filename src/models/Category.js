const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    title: { type: String, required: true },
    image_url: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);