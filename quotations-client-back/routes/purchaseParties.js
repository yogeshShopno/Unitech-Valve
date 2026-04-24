const express = require('express');
const router = express.Router();
const {
  getAllPurchaseParties,
  getPurchasePartyById,
  createPurchaseParty,
  updatePurchaseParty,
  deletePurchaseParty
} = require('../controllers/purchasePartyController');

router.get('/', getAllPurchaseParties);
router.get('/:id', getPurchasePartyById);
router.post('/', createPurchaseParty);
router.put('/:id', updatePurchaseParty);
router.delete('/:id', deletePurchaseParty);

module.exports = router;
