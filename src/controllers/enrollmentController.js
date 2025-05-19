const Enrollment = require('../models/Enrollment');
const { sendSuccess, sendError } = require('../utils/response');

exports.enrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: req.params.courseId
    });
    
    sendSuccess(res, 'Successfully enrolled in course', enrollment, 201);
  } catch (error) {
    sendError(res, error);
  }
};

exports.cancelEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        user: req.user.id,
        course: req.params.courseId
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!enrollment) {
      return sendError(res, 'Enrollment not found', 404);
    }

    sendSuccess(res, 'Enrollment cancelled successfully', enrollment);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title description')
      .sort('-enrolledAt');

    sendSuccess(res, 'Enrollments retrieved successfully', enrollments);
  } catch (error) {
    sendError(res, error);
  }
};