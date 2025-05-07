const express = require('express');
const router = express.Router();
const { createCategory, getCategory, editCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/create-category', createCategory);
router.get('/get-category', getCategory);
router.get('/:categoryId', editCategory);
router.delete('/delete-category/:categoryId', deleteCategory);

module.exports = router;