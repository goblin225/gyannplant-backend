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
    const { course, title, questions,
      maxAttempts,
      isPublished,
      availableFrom,totalMarks,
      availableTo, } = req.body;
      
    const assessment = new Assessment({
      course,
      title,
      questions,totalMarks,
      maxAttempts,
      isPublished,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined
    });

    await assessment.save();
    sendSuccess(res, 'Assessment created', assessment);
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

// exports.submitAssessment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { assessmentId } = req.params;
//     const { userId, answers } = req.body;
//     consolelog(userId,answers)

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Invalid assessment ID', 400);
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Invalid user ID', 400);
//     }

//     // Get assessment and course
//     const assessment = await Assessment.findById(assessmentId)
//       .populate('course', '_id title')
//       .session(session);

//     if (!assessment) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Assessment not found', 404);
//     }

//     if (!assessment.course) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Associated course not found', 404);
//     }

//     // Check availability
//     const now = new Date();
//     if (
//       !assessment.isPublished ||
//       (assessment.availableFrom && now < assessment.availableFrom) ||
//       (assessment.availableTo && now > assessment.availableTo)
//     ) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Assessment is not currently available', 403);
//     }

//     // Check enrollment
//     // const isEnrolled = await Enrollment.exists({
//     //   user: userId,
//     //   course: assessment.course._id
//     // }).lean().session(session);

//     // if (!isEnrolled) {
//     //   await session.abortTransaction();
//     //   return sendErrorMessage(res, 'User is not enrolled in this course', 403);
//     // }

//     // Check attempts
//     const progress = await UserProgress.findOne({ user: userId }).session(session);
//     const attempts = progress?.assessments?.filter(a =>
//       a.assessmentId.equals(assessmentId)
//     ).length || 0;

//     if (attempts >= assessment.maxAttempts) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, `Maximum attempts (${assessment.maxAttempts}) exceeded`, 403);
//     }

//     // Validate question IDs
//     const questionIds = assessment.questions.map(q => q._id.toString());
//     const invalidAnswers = answers.filter(a => !questionIds.includes(a.questionId));
//     if (invalidAnswers.length > 0) {
//       await session.abortTransaction();
//       return sendErrorMessage(res, 'Some answers refer to invalid questions', 400);
//     }

//     // Calculate score
//     const scoreDetails = assessment.questions.map(question => {
//       const userAnswer = answers.find(a => a.questionId === question._id.toString());
//       const selected = userAnswer?.selectedOption || null;
//       const isCorrect = selected === question.correctAnswer;

//       return {
//         questionId: question._id,
//         selectedOption: selected,
//         isCorrect,
//         marksObtained: isCorrect ? question.marks : 0,
//         status: selected === null ? 'unanswered' : (isCorrect ? 'correct' : 'wrong')
//       };
//     });

//     const totalScore = scoreDetails.reduce((sum, q) => sum + q.marksObtained, 0);
//     const percentage = Math.round((totalScore / assessment.totalMarks) * 100);
//     const passed = percentage >= assessment.passPercentage;

//     // Update UserProgress
//     await UserProgress.findOneAndUpdate(
//       { userId: userId, courseId: assessment.course._id },
//       {
//         $setOnInsert: {
//           user: userId,
//           course: assessment.course._id,
//         },
//         $push: {
//           assessments: {
//             assessmentId: assessment._id,
//             score: totalScore,
//             totalMarks: assessment.totalMarks,
//             percentage,
//             passed,
//             answers: scoreDetails,
//             attemptedAt: new Date()
//           }
//         },
//         $inc: { points: passed ? percentage : 0 },
//         $set: { lastActivity: new Date() }
//       },
//       { upsert: true, new: true, session }
//     );

//     // Update Leaderboard if passed
//     if (passed) {
//       await Leaderboard.findOneAndUpdate(
//         { user: userId },
//         { $inc: { totalPoints: percentage } },
//         { upsert: true, session }
//       );
//     }

//     await session.commitTransaction();

//     return sendSuccess(res, 'Assessment submitted successfully', {
//       score: totalScore,
//       totalMarks: assessment.totalMarks,
//       percentage,
//       passed,
//       attemptsRemaining: assessment.maxAttempts - (attempts + 1),
//       pointsEarned: passed ? percentage : 0
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Submission error:', error);
//     return sendError(res, 'Failed to process assessment submission', 500);
//   } finally {
//     session.endSession();
//   }
// };


exports.submitAssessment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assessmentId } = req.params;
    const { userId, answers } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(assessmentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Get assessment and course
    const assessment = await Assessment.findById(assessmentId)
      .populate('course', '_id title')
      .session(session);

    if (!assessment || !assessment.course) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Assessment or associated course not found' });
    }

    // Check availability
    const now = new Date();
    if (!assessment.isPublished || 
        (assessment.availableFrom && now < assessment.availableFrom) || 
        (assessment.availableTo && now > assessment.availableTo)) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Assessment is not currently available' });
    }

    // Check attempts
    const userProgress = await UserCourseProgress.findOne({ 
      userId: userId, 
      courseId: assessment.course._id 
    }).session(session);

    const attempts = userProgress?.assessments?.filter(a => 
      a.assessmentId.equals(assessmentId)
    ).length || 0;

    if (attempts >= assessment.maxAttempts) {
      await session.abortTransaction();
      return res.status(403).json({ error: `Maximum attempts (${assessment.maxAttempts}) exceeded` });
    }

    // Validate question IDs
    const questionIds = assessment.questions.map(q => q._id.toString());
    const invalidAnswers = answers.filter(a => !questionIds.includes(a.questionId));
    if (invalidAnswers.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Some answers refer to invalid questions' });
    }

    // Calculate score
    const scoreDetails = assessment.questions.map(question => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      const selected = userAnswer?.selectedOption || null;
      const isCorrect = selected === question.correctAnswer;

      return {
        questionId: question._id,
        selectedOption: selected,
        isCorrect,
        marksObtained: isCorrect ? question.marks : 0
      };
    });

    const totalScore = scoreDetails.reduce((sum, q) => sum + q.marksObtained, 0);
    const percentage = Math.round((totalScore / assessment.totalMarks) * 100);
    const passed = percentage >= assessment.passPercentage;

    // Update UserCourseProgress
    await UserCourseProgress.findOneAndUpdate(
      { userId: userId, courseId: assessment.course._id },
      {
        $push: {
          assessments: {
            assessmentId: assessment._id,
            score: totalScore,
            totalMarks: assessment.totalMarks,
            passed,
            answers: scoreDetails
          }
        },
        $inc: { points: passed ? percentage : 0 },
        $set: { lastActive: new Date() }
      },
      { session, new: true }
    );

    // Update Leaderboard if passed
    if (passed) {
      await Leaderboard.findOneAndUpdate(
        { user: userId },
        { $inc: { totalPoints: percentage } },
        { upsert: true, session }
      );
    }

    await session.commitTransaction();

    return sendSuccess(res, 'Assessment submitted successfully', {
  score: totalScore,
  totalMarks: assessment.totalMarks,
  percentage,
  passed,
  attemptsRemaining: assessment.maxAttempts - (attempts + 1),
  pointsEarned: passed ? percentage : 0
});
  } catch (error) {
    await session.abortTransaction();
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Failed to process assessment submission' });
  } finally {
    session.endSession();
  }
};