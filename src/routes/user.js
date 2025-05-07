const { Router } = require('express');
const { getAllUsers, getUserById, updateUserProfile } = require('../controllers/userController');

const router = Router();

router.get('/getAllUsers', getAllUsers);
router.get('/getbyid/:id', getUserById);
router.put('/update-profile/:id', updateUserProfile);

module.exports = router;