const express = require('express');
const router = express.Router();
const proformaInvoiceController = require('../controllers/proformaInvoiceController');
const auth = require('../middleware/auth');

router.get('/', auth, proformaInvoiceController.getProformaInvoices);
router.post('/convert/:id', auth, proformaInvoiceController.convertQuotationToProforma);
router.get('/:id', auth, proformaInvoiceController.getProformaInvoiceById);
router.put('/:id', auth, proformaInvoiceController.updateProformaInvoice);
router.delete('/:id', auth, proformaInvoiceController.deleteProformaInvoice);

module.exports = router;
