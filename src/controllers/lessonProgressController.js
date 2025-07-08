const { sendSuccess, sendError, sendErrorMessage } = require('../utils/response');
const LessonWatchLog = require('../models/LessonWatchLog');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');

exports.lessonStart = async (req, res) => {
    try {
        const { userId, courseId, lessonId } = req.body;

        const startTime = new Date();

        const log = await LessonWatchLog.create({
            userId,
            courseId,
            lessonId,
            startTime
        });

        sendSuccess(res, 'Lesson start logged', log._id);
    } catch (err) {
        sendError(res, `Error logging lesson start: ${err.message}`);
    }
};

exports.lessonEnd = async (req, res) => {
  try {
    const { logId } = req.body;
    const endTime = new Date();

    const log = await LessonWatchLog.findById(logId);
    if (!log || !log.startTime) {
      return sendErrorMessage(res, 'Start log not found');
    }

    const duration = Math.floor((endTime - log.startTime) / 1000);
    log.endTime = endTime;
    log.durationInSeconds = duration;
    await log.save();

    const updatedProgress = await CourseProgress.findOneAndUpdate(
      {
        userId: log.userId,
        courseId: log.courseId
      },
      {
        $addToSet: { completedLessons: log.lessonId },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    const course = await Course.findById(log.courseId).select('lessons');
    const totalLessons = course.lessons?.length || 0;

    const completedCount = updatedProgress.completedLessons.length;

    const completionPercent = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    updatedProgress.completionPercent = completionPercent;
    await updatedProgress.save();

    sendSuccess(res, 'Lesson end logged and progress updated');
  } catch (err) {
    sendError(res, `Error logging lesson ending: ${err.message}`);
  }
};