const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const auth = require('../middleware/auth');

router.post('/', auth, quotationController.createQuotation);
router.get('/', auth, quotationController.getQuotations);
router.get('/:id', auth, quotationController.getQuotationById);
router.put('/:id', auth, quotationController.updateQuotation);
router.delete('/:id', auth, quotationController.deleteQuotation);

module.exports = router;
