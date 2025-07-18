const Assessment = require('../models/Assessment');
const Leaderboard = require('../models/Leaderboard');
const mongoose = require('mongoose');
const UserCourseProgress = require('../models/UserCourseProgress');
const { parseCSV, parseExcel } = require('../utils/fileParser');
const path = require('path');
const { sendSuccess, sendError, sendErrorMessage } = require('../utils/response');

exports.addQuestionToAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { question, options, correctAnswer, marks } = req.body;

    const newQuestion = {
      _id: new mongoose.Types.ObjectId(),
      question,
      options,
      correctAnswer,
      marks
    };

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      {
        $push: { questions: newQuestion },
        $inc: { totalMarks: marks }
      },
      { new: true }
    );

    if (!updatedAssessment) return sendErrorMessage(res, 'Assessment not found');

    sendSuccess(res, 'Question added successfully', newQuestion);
  } catch (error) {
    sendError(res, error);
  }
};

const validateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment) return sendErrorMessage(res, 'Assessment not found');

    const now = new Date();
    if (
      !assessment.isPublished ||
      (assessment.availableFrom && now < assessment.availableFrom) ||
      (assessment.availableTo && now > assessment.availableTo)
    ) {
      return sendErrorMessage(res, 'Assessment is not currently available');
    }

    req.assessment = assessment;
    next();
  } catch (error) {
    sendError(res, error);
  }
};

exports.uploadAssessmentFromFile = async (req, res) => {
  try {
    const { course, title, maxAttempts, isPublished, availableFrom, availableTo } = req.body;

    if (!req.file || !req.file.path) {
      return sendErrorMessage(res, 'No file uploaded', 400);
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();

    let questions = [];

    if (ext === '.csv') {
      questions = await parseCSV(filePath);
    } else if (ext === '.xlsx') {
      questions = parseExcel(filePath);
    } else {
      return sendErrorMessage(res, 'Only .csv and .xlsx files are supported', 400);
    }

    // Validate and transform questions
    const validatedQuestions = questions.map(question => {
      // Ensure marks is a valid number
      const marks = Number(question.marks);
      if (isNaN(marks)) {
        throw new Error(`Invalid marks value: ${question.marks}`);
      }

      return {
        ...question,
        marks: marks
      };
    });

    const assessment = new Assessment({
      course,
      title,
      questions: validatedQuestions,
      maxAttempts,
      isPublished,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined
    });

    await assessment.save();

    sendSuccess(res, 'Assessment created from uploaded file', assessment);
  } catch (error) {
    sendError(res, error);
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const {
      type,
      course,
      title,
      questions,
      passPercentage,
      maxAttempts,
      isPublished,
      availableFrom,
      availableTo,
      timeLimit
    } = req.body;

    const assessment = new Assessment({
      type,
      course,
      title,
      questions,
      passPercentage,
      maxAttempts,
      timeLimit,
      isPublished,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined
    });

    await assessment.save();
    sendSuccess(res, 'Assessment created successfully', assessment);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getAllAssessments = async (req, res) => {
  try {
    const { courseId, isPublished } = req.query;

    const filter = {};
    if (courseId) filter.course = courseId;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const assessments = await Assessment.find(filter)
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    sendSuccess(res, 'Assessments fetched successfully', assessments);
  } catch (error) {
    sendError(res, error);
  }
};

exports.submitAssessment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assessmentId } = req.params;
    const { userId, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assessmentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return sendErrorMessage(res, 'Invalid ID format');
    }

    const assessment = await Assessment.findById(assessmentId)
      .populate('course', '_id title')
      .session(session);

    if (!assessment || !assessment.course) {
      await session.abortTransaction();
      return sendErrorMessage(res, 'Assessment or associated course not found');
    }

    const now = new Date();
    if (
      !assessment.isPublished ||
      (assessment.availableFrom && now < assessment.availableFrom) ||
      (assessment.availableTo && now > assessment.availableTo)
    ) {
      await session.abortTransaction();
      return sendErrorMessage(res, 'Assessment is not currently available');
    }

    const courseId = assessment.course._id;

    const userProgress = await UserCourseProgress.findOne({
      userId,
      courseId
    }).session(session);

    const previousAttempts = userProgress?.assessments?.filter(a =>
      a.assessmentId.equals(assessmentId)
    ).length || 0;

    if (previousAttempts >= assessment.maxAttempts) {
      await session.abortTransaction();
      return sendErrorMessage(res, `Maximum attempts (${assessment.maxAttempts}) exceeded`);
    }

    const questionMap = new Map();
    assessment.questions.forEach(q => questionMap.set(q._id.toString(), q));

    const scoreDetails = [];

    for (const userAnswer of answers) {
      const question = questionMap.get(userAnswer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let marksObtained = 0;
      let selectedOption = null;
      let codeOutput = null;

      if (question.type === 'mcq') {
        selectedOption = userAnswer.selectedOption;
        isCorrect = selectedOption === question.correctAnswer;
        marksObtained = isCorrect ? question.marks : 0;
      } else if (question.type === 'code') {
        codeOutput = userAnswer.output?.trim();
        isCorrect = codeOutput === question.expectedOutput.trim();
        marksObtained = isCorrect ? question.marks : 0;
      }

      scoreDetails.push({
        questionId: question._id,
        type: question.type,
        selectedOption,
        codeOutput,
        isCorrect,
        marksObtained
      });
    }

    const totalScore = scoreDetails.reduce((sum, q) => sum + q.marksObtained, 0);
    const percentage = Math.round((totalScore / assessment.totalMarks) * 100);
    const passed = percentage >= assessment.passPercentage;
    const earnedPoints = passed ? percentage : 0;

    // Remove previous record for same assessment
    await UserCourseProgress.updateOne(
      { userId, courseId },
      { $pull: { assessments: { assessmentId } } },
      { session }
    );

    // Insert new assessment record and update points
    await UserCourseProgress.findOneAndUpdate(
      { userId, courseId },
      {
        $push: {
          assessments: {
            assessmentId,
            score: totalScore,
            totalMarks: assessment.totalMarks,
            passed,
            answers: scoreDetails,
            attemptedAt: new Date()
          }
        },
        $inc: { points: earnedPoints },
        $set: { lastActive: new Date() }
      },
      { session, upsert: true, new: true }
    );

    if (passed) {
      await Leaderboard.updateStats(userId, courseId, session);
    }

    await session.commitTransaction();

    return sendSuccess(res, 'Assessment submitted successfully', {
      score: totalScore,
      totalMarks: assessment.totalMarks,
      percentage,
      passed,
      attemptsRemaining: assessment.maxAttempts - (previousAttempts + 1),
      pointsEarned: earnedPoints
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Submission error:', error);
    return sendError(res, 'Failed to process assessment submission');
  } finally {
    session.endSession();
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId: id } = req.params;

    const deleted = await Assessment.findByIdAndDelete(id);

    if (!deleted) {
      return sendErrorMessage(res, 'Assessment not found');
    }

    return sendSuccess(res, 'Assessment deleted successfully');
  } catch (error) {
    console.error('Delete Error:', error);
    return sendError(res, `Internal Server Error : ${error}`);
  }
};