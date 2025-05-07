const Role = require('../models/Roles');
const { sendSuccess, sendErrorMessage, sendError } = require('../utils/response');

exports.createRole = async (req, res) => {
    try {
        const {
            name
        } = req.body;

        const newRole = new Role({
            name
        });

        const savedRole = await newRole.save();
        sendSuccess(res, 'Role created successfully', savedRole);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        sendSuccess(res, 'Role fetched successfully', roles);
    } catch (error) {
        sendError(res, error);
    }
}

exports.editRole = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const role = await Role.findByIdAndUpdate(id, updatedData, { new: true });

        if (!role) {
            return sendErrorMessage(res, 'Role not found');
        }

        sendSuccess(res, 'Role updated successfully', role);
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findByIdAndDelete(roleId);

        if (!role) {
            return sendErrorMessage(res, 'Role not found');
        }

        sendSuccess(res, 'Role deleted successfully', role);
    } catch (error) {
        sendError(res, error);
    }
};