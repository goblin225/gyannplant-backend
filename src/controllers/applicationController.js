const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendErrorMessage, sendError, sendSuccess } = require('../utils/response');

exports.applyToJob = async (req, res) => {
    try {
        const { userId, jobId, coverLetter, resumeUrl } = req.body;

        const job = await Job.findById(jobId);
        if (!job || !job.isPublished) {
            return sendErrorMessage(res, 'Job not available or unpublished.');
        }

        const alreadyApplied = await Application.findOne({ userId, jobId });
        if (alreadyApplied) {
            return sendErrorMessage(res, 'You already applied to this job.');
        }

        const application = new Application({
            userId,
            jobId,
            resumeUrl,
            coverLetter,
        });

        await application.save();

        sendSuccess(res, 'Application submitted successfully.');
    } catch (err) {
        console.error('Apply Error:', err);
        sendError(res, `Server Error: ${err}`);
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('userId', 'name email resumeUrl profile_pic')
            .populate({
                path: 'jobId',
                populate: {
                    path: 'createdBy',
                    select: 'name email profile_pic',
                },
            });

        sendSuccess(res, 'Applications fetched with complete job details', applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        sendError(res, `Server Error: ${error}`);
    }
};