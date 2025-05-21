const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        representativeName: {
            type: String,
            required: true
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
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
        },
        profile_pic: { type: String },
        password: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Company', companySchema);