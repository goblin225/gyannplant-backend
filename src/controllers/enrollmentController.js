const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const { sendSuccess, sendError } = require('../utils/response');

exports.enrollCourse = async (req, res) => {
  try {
    const { userId } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return sendError(res, 'Course not found', 404);
    }

    let isEnrolled = false;

    if (userId) {
      let enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: { $ne: 'cancelled' }
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          user: userId,
          course: courseId,
          status: 'active'
        });
      }

      isEnrolled = true;
    }

    sendSuccess(res, 'Course enrolled successfully', {
      ...course,
      isEnrolled
    });

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

// await Enrollment.deleteMany();
exports.getEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title description lessons thumbnail category')
      .sort('-enrolledAt')
      .lean();

    const courseIds = enrollments.map(e => e.course._id); 
    const progressData = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds }
    }).lean();

    const progressMap = {};
    for (const p of progressData) {
      progressMap[p.courseId.toString()] = p;
    }

    const merged = enrollments.map(e => {
      const courseId = e.course._id.toString();
      const progress = progressMap[courseId];

      const totalLessons = e.course.lessons?.length || 0;
      const completedCount = progress?.completedLessons?.length || 0;

      const completionPercent = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

      return {
        ...e,
        progress: {
          completedLessons: progress?.completedLessons || [],
          startedAt: progress?.startedAt || null,
          updatedAt: progress?.updatedAt || null,
          completionPercent
        }
      };
    });

    sendSuccess(res, 'Enrollments with progress retrieved successfully', merged);
  } catch (error) {
    sendError(res, `Error fetching enrollments: ${error.message}`);
  }
};