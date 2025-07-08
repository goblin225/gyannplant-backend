const { Types } = require('mongoose');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Enrollment = require('../models/Enrollment');
const { sendSuccess, sendErrorMessage, sendError } = require('../utils/response');

exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            thumbnail,
            description,
            category,
            duration, price,
            lessons, role,
            createdBy,
        } = req.body;

        if (!title || !thumbnail || !lessons || !Array.isArray(lessons)) {
            return sendErrorMessage(res, 'Title, thumbnail, and lessons are required');
        }

        const newCourse = new Course({
            title,
            thumbnail,
            description,
            category, role,
            duration, price,
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
        const userId = req.user?.id;
        const courses = await Course.find().sort({ createdAt: -1 }).lean();

        if (userId) {
            const enrollments = await Enrollment.find({ user: userId }).select('course');
            const enrolledCourseIds = enrollments.map(e => e.course.toString());

            const coursesWithEnrollment = courses.map(course => ({
                ...course,
                isEnrolled: enrolledCourseIds.includes(course._id.toString()),
            }));

            return sendSuccess(res, 'Course fetched successfully', coursesWithEnrollment);
        }

        sendSuccess(res, 'Course fetched successfully', courses);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.query;

    if (!Types.ObjectId.isValid(courseId)) {
      return sendErrorMessage(res, 'Invalid courseId');
    }

    const course = await Course.findById(courseId).lean();
    if (!course) return sendErrorMessage(res, 'Course not found');

    let isEnrolled = false;
    let completedLessons = [];

    if (userId && Types.ObjectId.isValid(userId)) {
      const enrollment = await Enrollment.findOne({
        user: new Types.ObjectId(userId),
        course: new Types.ObjectId(courseId),
        status: { $ne: 'cancelled' }
      });

      isEnrolled = !!enrollment;

      if (isEnrolled) {
        const progress = await CourseProgress.findOne({
          userId: new Types.ObjectId(userId),
          courseId: new Types.ObjectId(courseId)
        });

        if (progress) {
          completedLessons = progress.completedLessons.map(id => id.toString());
        }
      }
    }

    const lessonsWithCompletion = course.lessons.map((lesson) => ({
      ...lesson,
      isCompleted: completedLessons.includes(lesson._id.toString())
    }));

    sendSuccess(res, 'Course fetched successfully', {
      ...course,
      lessons: lessonsWithCompletion,
      isEnrolled,
      completedLessons
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updatedData = req.body;

        const course = await Course.findByIdAndUpdate(courseId, updatedData, { new: true });

        if (!course) {
            return sendErrorMessage(res, 'Course not found');
        }

        sendSuccess(res, 'Course updated successfully', course);
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndDelete(courseId);

        if (!course) {
            return sendError(res, 'Course not found');
        }

        sendSuccess(res, 'Course deleted successfully', course);
    } catch (error) {
        sendError(res, error);
    }
};