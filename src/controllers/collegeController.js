const College = require('../models/College');
const User = require('../models/User');
const Role = require('../models/Roles');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError, sendErrorMessage } = require('../utils/response');

exports.registerCollege = async (req, res) => {
    try {
        const {
            collegeName,
            mailId,
            contactNumber,
            address,
            contactPersonName,
            contactPersonPhone,
            contactPersonPassword
        } = req.body;

        const hashedUserPassword = await bcrypt.hash(contactPersonPassword, 10);

        const role = await Role.findOne({ name: 'College' });

        const user = await User.create({
            name: contactPersonName,
            email: mailId,
            phoneNumber: contactPersonPhone,
            password: hashedUserPassword,
            roleId: role._id
        });

        const college = new College({
            collegeName,
            mailId,
            contactNumber,
            address,
            contactPersonName,
            contactPersonId: user._id,
            password: hashedUserPassword,
        });

        await college.save();

        user.collegeId = college._id;
        await user.save();

        const collegeData = {
            collegeId: college._id,
            userId: user._id
        }

        sendSuccess(res, 'College registered successfully', collegeData);
    } catch (err) {
        sendError(res, `Error registering college: ${err}`);
    }
};

// Login college
exports.loginCollege = async (req, res) => {
    try {
        const { mailId, password } = req.body;

        const college = await College.findOne({ mailId });
        if (!college) return sendErrorMessage(res, 'College not found');

        const isMatch = await bcrypt.compare(password, college.password);
        if (!isMatch) return sendErrorMessage(res, 'Invalid password');

        const token = jwt.sign({ id: college._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const loginData = {
            accessToken: token,
            collegeId: college._id,
            roleId: college.roleId,
            fcmToken: college.fcmToken || null
        };

        sendSuccess(res, 'Login successful', loginData);
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};