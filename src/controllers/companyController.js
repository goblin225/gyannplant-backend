const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const { sendSuccess, sendErrorMessage, sendError } = require('../utils/response');

exports.createCompany = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const companyData = {
            ...req.body,
            password: hashedPassword
        };

        const company = new Company(companyData);
        await company.save();

        const { password, ...companyWithoutPassword } = company.toObject();

        sendSuccess(res, 'Company created successfully', companyWithoutPassword);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        sendSuccess(res, 'Company fetched successfully', companies);
    } catch (err) {
        sendError(res, err);
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return sendErrorMessage(res, 'Company not found');
        sendSuccess(res, 'Company fetched successfully', company);
    } catch (err) {
        sendError(res, err);
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!company) return sendErrorMessage(res, 'Company not found');
        sendSuccess(res, 'Company Updated Successfully', company);
    } catch (err) {
        sendError(res, err);
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) return sendErrorMessage(res, 'Company not found');
        sendSuccess(res, 'Company deleted successfully');
    } catch (err) {
        sendError(res, err);
    }
};