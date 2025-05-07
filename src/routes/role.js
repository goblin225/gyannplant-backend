const express = require('express');
const router = express.Router();
const { createRole, getRoles, editRole, deleteRole } = require('../controllers/roleController');

router.post('/create-role', createRole);
router.get('/get-roles', getRoles);
router.put('/:roleId', editRole);
router.delete('/delete-role/:roleId', deleteRole);

module.exports = router;