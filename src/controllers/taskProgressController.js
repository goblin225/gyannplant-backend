const TaskProgress = require('../models/TaskProgress');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess, sendError, sendErrorMessage } = require('../utils/response');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.startTask = async (req, res) => {
    try {
        const { taskId, userId } = req.body;

        const progress = await TaskProgress.findOneAndUpdate(
            { taskId: new ObjectId(taskId), userId: new ObjectId(userId) },
            { status: 'In-progress', startedAt: new Date() },
            { new: true }
        );

        if (!progress) return sendError(res, 'No task progress found for this user and task');

        sendSuccess(res, 'Started the task progress', progress);
    } catch (err) {
        sendError(res, 'Error starting task progress', err.message || err);
    }
};

exports.updateStepProgress = async (req, res) => {
    try {
        const {
            taskId,
            userId,
            stepTitle,
            type,
            lessonId,
            assessmentId,
            watchedDuration,
            totalDuration
        } = req.body;

        const progress = await TaskProgress.findOne({ taskId, userId });
        if (!progress) return sendError(res, 'Task progress not found');

        const task = await Task.findById(taskId);
        if (!task) return sendError(res, 'Task not found');

        const stepIndex = progress.stepLog.findIndex(s => s.stepTitle === stepTitle);

        const stepData = {
            stepTitle,
            type,
            lessonId: lessonId || null,
            assessmentId: assessmentId || null,
            watchedDuration: watchedDuration || 0,
            totalDuration: totalDuration || 0,
            completed: type !== 'video' || (watchedDuration >= totalDuration),
            completedAt: new Date()
        };

        if (stepIndex >= 0) {
            progress.stepLog[stepIndex] = { ...progress.stepLog[stepIndex].toObject(), ...stepData };
        } else {
            progress.stepLog.push(stepData);
        }

        let earnedPoints = 0;
        for (const step of task.steps) {
            const log = progress.stepLog.find(s => s.stepTitle === step.title);
            if (log?.completed) earnedPoints += step.points || 0;
        }

        progress.pointsEarned = earnedPoints;

        const allRequiredStepsCompleted = task.steps.every(step => {
            if (!step.required) return true;
            const log = progress.stepLog.find(s => s.stepTitle === step.title);
            return log?.completed;
        });

        if (allRequiredStepsCompleted) {
            const now = new Date();
            const timeTaken = Math.floor((now - progress.startedAt) / 60000);
            progress.completedAt = now;
            progress.timeTakenMinutes = timeTaken;
            progress.status = 'Completed';

            const finalPoints = Math.max(task.points, earnedPoints);
            await User.findByIdAndUpdate(userId, { $inc: { points: finalPoints - (progress.pointsEarned || 0) } });
            progress.pointsEarned = finalPoints;
        } else {
            progress.status = 'In-progress';
        }

        await progress.save();

        sendSuccess(res, allRequiredStepsCompleted ? 'Task completed successfully' : 'Step progress updated', progress);
    } catch (err) {
        sendError(res, 'Error updating step progress', err.message || err);
    }
};

// exports.completeTask = async (req, res) => {
//     try {
//         const { taskId, userId } = req.body;

//         const progress = await TaskProgress.findOne({ taskId, userId });
//         if (!progress) return sendError(res, 'Task progress not found');

//         const task = await Task.findById(taskId);
//         if (!task) return sendError(res, 'Task not found');

//         const allRequiredStepsCompleted = task.steps.every(step => {
//             if (!step.required) return true;
//             const log = progress.stepLog.find(s => s.stepTitle === step.title);
//             return log?.completed;
//         });

//         if (!allRequiredStepsCompleted) return sendError(res, 'All required steps not completed');

//         const now = new Date();
//         const timeTaken = Math.floor((now - progress.startedAt) / 60000);

//         progress.completedAt = now;
//         progress.timeTakenMinutes = timeTaken;
//         progress.status = 'Completed';
//         progress.pointsEarned = task.points;

//         await progress.save();
//         await User.findByIdAndUpdate(userId, { $inc: { points: task.points } });

//         sendSuccess(res, 'Task completed successfully', progress);
//     } catch (err) {
//         sendError(res, `Error completing task: ${err.message}`);
//     }
// };

exports.getUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await TaskProgress.find({ userId })
            .populate('taskId');
        sendSuccess(res, 'Task progress fetched', progress);
    } catch (err) {
        sendError(res, 'Error fetch task progress', err);
    }
};