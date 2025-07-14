const mongoose = require("mongoose");
const { Schema } = mongoose;

const resumeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: String,
    atsResumeText: String,
    pdfUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Resume", resumeSchema);