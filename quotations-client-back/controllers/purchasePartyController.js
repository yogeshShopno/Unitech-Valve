const PurchaseParty = require('../models/PurchaseParty');

const getAllPurchaseParties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await PurchaseParty.countDocuments();
    const purchaseParties = await PurchaseParty.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({
      clients: purchaseParties, // use same key for frontend compatibility if needed, or better change to purchaseParties
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPurchasePartyById = async (req, res) => {
  try {
    const purchaseParty = await PurchaseParty.findById(req.params.id);
    if (!purchaseParty) return res.status(404).json({ message: 'Purchase Party not found' });
    res.json(purchaseParty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPurchaseParty = async (req, res) => {
  const purchaseParty = new PurchaseParty({
    id: req.body.id,
    name: req.body.name,
    contact: req.body.contact,
    quotes: req.body.quotes || 0,
    status: req.body.status || 'Active',
    statusColor: req.body.statusColor || 'bg-green-100 text-green-800',
    address: req.body.address,
    gstin: req.body.gstin,
    phone: req.body.phone,
    email: req.body.email,
    referencePerson: req.body.referencePerson,
  });

  try {
    const newPurchaseParty = await purchaseParty.save();
    res.status(201).json(newPurchaseParty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePurchaseParty = async (req, res) => {
  try {
    const updatedPurchaseParty = await PurchaseParty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPurchaseParty) return res.status(404).json({ message: 'Purchase Party not found' });
    res.json(updatedPurchaseParty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePurchaseParty = async (req, res) => {
  try {
    const deletedPurchaseParty = await PurchaseParty.findByIdAndDelete(req.params.id);
    if (!deletedPurchaseParty) return res.status(404).json({ message: 'Purchase Party not found' });
    res.json({ message: 'Purchase Party deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPurchaseParties,
  getPurchasePartyById,
  createPurchaseParty,
  updatePurchaseParty,
  deletePurchaseParty
};
