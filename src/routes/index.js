const { Router } = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const fileRoutes = require('./fileUpload');
const courseRoutes = require('./course');
const assessmentRoutes = require('./assessment');
const categoryRoutes = require('./category');
const roleRoutes = require('./role');
const companyRoutes = require('./company');
const leaderRoutes = require('./leaderBoard');
const taskRoutes = require('./task');
const taskProgressRoutes = require('./taskProgress');
const attendanceRoutes = require('./attendance');

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/file', fileRoutes);
router.use('/course', courseRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/category', categoryRoutes);
router.use('/role', roleRoutes);
router.use('/company', companyRoutes);
router.use('/leader', leaderRoutes);
router.use('/task', taskRoutes);
router.use('/taskprogress', taskProgressRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;