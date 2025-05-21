const { Router } = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const fileRoutes = require('./fileUpload');
const courseRoutes = require('./course');
const assessmentRoutes = require('./assessment');
const categoryRoutes = require('./category');
const roleRoutes = require('./role');
const companyRoutes = require('./company');

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/file', fileRoutes);
router.use('/course', courseRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/category', categoryRoutes);
router.use('/role', roleRoutes);
router.use('/company', companyRoutes);

module.exports = router;