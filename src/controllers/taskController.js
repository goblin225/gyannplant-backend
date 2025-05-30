const Task = require('../models/Task');
const TaskProgress = require('../models/TaskProgress');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const admin = require('../utils/firebase')
const { sendSuccess, sendError } = require('../utils/response');

exports.createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            deadlineHours,
            points,
            steps,
            assignedTo,
            createdBy,
            courseId
        } = req.body;

        const task = new Task({
            title,
            description,
            category,
            deadlineHours,
            points,
            steps,
            assignedTo,
            createdBy,
            courseId
        });

        await task.save();

        const taskProgressEntries = assignedTo.map(userId => ({
            taskId: task._id,
            userId,
            courseId: task.courseId,
            stepLog: steps.map(step => ({
                stepTitle: step.title,
                type: step.type,
                lessonId: step.lessonId || null,
                assessmentId: step.assessmentId || null,
                completed: false,
                watchedDuration: 0,
                totalDuration: step.type === 'video' ? 0 : undefined
            }))
        }));

        await TaskProgress.insertMany(taskProgressEntries);

        const users = await User.find({
            _id: { $in: assignedTo },
            fcmToken: { $exists: true, $ne: null }
        });

        for (const user of users) {
            const notificationData = {
                userId: user._id,
                title: "New Task Assigned",
                message: `${task.title}: ${task.description}`,
                type: 'assignment'
            };

            const savedNotification = new Notification(notificationData);
            await savedNotification.save();

            const fcmMessage = {
                notification: {
                    title: notificationData.title,
                    body: notificationData.message
                },
                token: user.fcmToken
            };

            await admin.messaging().send(fcmMessage);
        }

        sendSuccess(res, 'Task created and notifications sent successfully', task);
    } catch (err) {
        console.error(err);
        sendError(res, `Error creating task: ${err.message || err}`);
    }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { lessonId } = req.query;

    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate('category')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const course = await Course.findById(task.courseId).lean();

        const progress = await TaskProgress.find({ taskId: task._id })
          .populate('userId', 'name email');

        const enrichedSteps = await Promise.all(
          task.steps.map(async (step) => {
            let lessonData = null;
            let assessmentData = null;

            if (step.lessonId && course) {
              lessonData = course.lessons.find(l => String(l._id) === String(step.lessonId));
              if (lessonId && String(step.lessonId) !== lessonId) {
                return null;
              }
            }

            if (step.assessmentId) {
              assessmentData = await Assessment.findById(step.assessmentId).lean();
            }

            return {
              ...step.toObject(),
              lessonData,
              assessmentData
            };
          })
        );

        return {
          ...task.toObject(),
          steps: enrichedSteps.filter(Boolean),
          course,
          progress
        };
      })
    );

    sendSuccess(res, 'Tasks with progress and enriched data fetched successfully', tasksWithDetails);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error fetching task details', err.message || err);
  }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            return sendError(res, 'Task not found');
        }

        // await TaskProgress.deleteMany({ taskId: id });

        sendSuccess(res, 'Task deleted successfully', task);
    } catch (err) {
        sendError(res, 'Error deleting task', err);
    }
};