const { Router } = require('express');
const { getAllUsers, addUser, getUserById, updateUserProfile, updateUser } = require('../controllers/userController');

const router = Router();

router.post('/add-user', addUser);
router.get('/getAllUsers', getAllUsers);
router.get('/getbyid/:id', getUserById);
router.put('/update-profile/:id', updateUserProfile);
router.put('/update-user/:id', updateUser);

module.exports = router;