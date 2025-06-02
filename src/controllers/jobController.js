const Job = require('../models/Job');
const { sendError, sendSuccess, sendErrorMessage } = require('../utils/response');

exports.createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            description,
            requirements,
            jobType,
            remote,
            salary,
            deadline,
            isPublished,
            createdBy,
        } = req.body;

        if (isPublished) {
            if (
                !title ||
                !company ||
                !location ||
                !description ||
                !requirements?.length ||
                !jobType ||
                !salary ||
                !deadline
            ) {
                return sendErrorMessage(res, 'All fields are required when publishing a job');
            }
        }

        const job = new Job({
            title,
            company,
            location,
            description,
            requirements,
            jobType,
            remote,
            salary,
            deadline,
            isPublished: isPublished || false,
            publishedAt: isPublished ? new Date() : null,
            createdBy,
        });

        await job.save();

        sendSuccess(res, 'Job created successfully', job);
    } catch (error) {
        console.error('Job Creation Error:', error);
        sendError(res, `Server Error: ${error}`);
    }
};

exports.getPublishedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isPublished: true }).sort({ publishedAt: -1 })
            .populate('createdBy', 'name email profile_pic');
        sendSuccess(res, 'Published Jobs fetched successfully', jobs);
    } catch (error) {
        console.error('Fetch Published Jobs Error:', error);
        sendError(res, `Server Error: ${error}`);
    }
};

