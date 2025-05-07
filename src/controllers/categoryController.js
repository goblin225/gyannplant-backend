const Category = require('../models/Category');
const { sendSuccess, sendErrorMessage, sendError } = require('../utils/response');

exports.createCategory = async (req, res) => {
    try {
        const {
            title,
            image_url,
        } = req.body;

        const newCategory = new Category({
            title,
            image_url,
        });

        const savedCategory = await newCategory.save();
        sendSuccess(res, 'Category created successfully', savedCategory);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getCategory = async (req, res) => {
    try {
        const categorys = await Category.find().sort({ createdAt: -1 });
        sendSuccess(res, 'Category fetched successfully', categorys);
    } catch (error) {
        sendError(res, error);
    }
}

exports.editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const category = await Category.findByIdAndUpdate(id, updatedData, { new: true });

        if (!category) {
            return sendErrorMessage(res, 'Category not found');
        }

        sendSuccess(res, 'Category updated successfully', category);
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return sendErrorMessage(res, 'Category not found');
        }

        sendSuccess(res, 'Category deleted successfully', category);
    } catch (error) {
        sendError(res, error);
    }
};