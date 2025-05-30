const { Router } = require('express');
const { createTask, getAllTasks, deleteTask } = require('../controllers/taskController');

const router = Router();

router.post('/add-task', createTask);
router.get('/getall-tasks', getAllTasks);
// router.get('/getbyid/:id', getUserById);
// router.put('/update-profile/:id', updateUserProfile);
// router.put('/update-user/:id', updateUser);
router.delete('/delete-task/:taskId', deleteTask);

module.exports = router;