const Assessment = require('../models/Assessment');
const Leaderboard = require('../models/Leaderboard');
const UserProgress = require('../models/UserCourseProgress');
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
            availableFrom,
            availableTo, } = req.body;

        const assessment = new Assessment({
            course,
            title,
            questions,
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

exports.submitAssessment = [
    validateAssessment,
    async (req, res) => {
        try {
            const { userId, answers } = req.body;
            const { assessment } = req;

            const progress = await UserProgress.findOne({ user: userId, course: assessment.course });
            const attempts = progress?.assessments.filter(a => a.assessmentId.equals(assessment._id)).length || 0;

            if (attempts >= assessment.maxAttempts) {
                return sendError(res, `Maximum attempts (${assessment.maxAttempts}) exceeded`);
            }

            let score = 0;
            const detailedAnswers = assessment.questions.map(q => {
                const userAnswer = answers.find(a => a.questionId.equals(q._id));
                const isCorrect = userAnswer?.selectedOption === q.correctAnswer;
                if (isCorrect) score += q.marks;

                return {
                    questionId: q._id,
                    selectedOption: userAnswer?.selectedOption,
                    isCorrect,
                    marksObtained: isCorrect ? q.marks : 0
                };
            });

            const passed = (score / assessment.totalMarks) * 100 >= assessment.passPercentage;
            const pointsEarned = passed ? 10 + Math.round((score / assessment.totalMarks) * 100) : 0;

            await UserProgress.findOneAndUpdate(
                { user: userId, course: assessment.course },
                {
                    $push: {
                        assessments: {
                            assessmentId: assessment._id,
                            score,
                            totalMarks: assessment.totalMarks,
                            passed,
                            answers: detailedAnswers,
                            attemptedAt: new Date()
                        }
                    },
                    $inc: { points: pointsEarned },
                    $set: { lastActivity: new Date() }
                },
                { upsert: true, new: true }
            );

            await Leaderboard.updateStats(userId, assessment.course);

            sendSuccess(res, 'Assessment submitted', {
                score,
                totalMarks: assessment.totalMarks,
                passed,
                attemptNumber: attempts + 1,
                pointsEarned
            });
        } catch (error) {
            sendError(res, error);
        }
    }
];