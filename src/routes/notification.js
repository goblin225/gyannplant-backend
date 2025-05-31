const { Router } = require('express');
const { getUserNotifications } = require('../controllers/notificationController');

const router = Router();

router.get('/get-user-notifi/:userId', getUserNotifications);
// router.get('/getbyid/:id', getUserById);
// router.put('/update-profile/:id', updateUserProfile);
// router.put('/update-user/:id', updateUser);
// router.delete('/delete-task/:taskId', deleteTask);

module.exports = router;