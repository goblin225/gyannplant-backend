const { Router } = require('express');
const { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany } = require('../controllers/companyController');
const { updateCompanyValidationRules, validate } = require('../validators/companyValidator');

const router = Router();

router.post('/add-company',
    updateCompanyValidationRules,
    validate,
    createCompany
);
router.get('/getall', getAllCompanies);
router.get('/getbyid/:id', getCompanyById);
router.put('/update/:id', updateCompany);
router.delete('/delete/:id', deleteCompany);

module.exports = router;