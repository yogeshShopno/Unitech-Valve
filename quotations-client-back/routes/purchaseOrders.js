const express = require('express');
const router = express.Router();
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  convertProformaToPO
} = require('../controllers/purchaseOrderController');

router.get('/', getAllPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.put('/:id', updatePurchaseOrder);
router.delete('/:id', deletePurchaseOrder);
router.post('/convert/:id', convertProformaToPO);

module.exports = router;
