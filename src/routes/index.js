const { Router } = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const fileRoutes = require('./fileUpload');
const courseRoutes = require('./course');

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/file', fileRoutes);
router.use('/course', courseRoutes);

module.exports = router;