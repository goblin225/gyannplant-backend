const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
    collegeName: { type: String, required: true },
    mailId: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    contactPersonName: { type: String, required: true },
    contactPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('College', CollegeSchema);
