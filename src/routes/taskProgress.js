const { Router } = require('express');
const { startTask, getUserProgress, updateStepProgress } = require('../controllers/taskProgressController');

const router = Router();

router.post('/start-task', startTask);
router.post('/update-step', updateStepProgress);
// router.post('/end-tasks', completeTask);
router.get('/getbyid/:id', getUserProgress);

module.exports = router;