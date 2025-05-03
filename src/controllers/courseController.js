const Course = require('../models/Course');
const { sendSuccess, sendErrorMessage, sendError } = require('../utils/response');

exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            thumbnail,
            description,
            category,
            duration,
            lessons,
            createdBy,
        } = req.body;

        if (!title || !thumbnail || !lessons || !Array.isArray(lessons)) {
            return sendErrorMessage(res, 'Title, thumbnail, and lessons are required');
        }

        const newCourse = new Course({
            title,
            thumbnail,
            description,
            category,
            duration,
            lessons,
            createdBy,
        });

        const savedCourse = await newCourse.save();
        sendSuccess(res, 'Course created successfully', savedCourse);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getCourse = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        sendSuccess(res, 'Users fetched successfully', courses);
    } catch (error) {
        sendError(res, error);
    }
}

exports.getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return sendErrorMessage(res, 'Course not found');
        }

        sendSuccess(res, 'Course fetched successfully', course);
    } catch (error) {
        sendError(res, error);
    }
};