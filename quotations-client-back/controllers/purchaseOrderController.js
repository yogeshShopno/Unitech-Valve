const PurchaseOrder = require('../models/PurchaseOrder');
const ProformaInvoice = require('../models/ProformaInvoice');

const getAllPurchaseOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.purchaseParty) filter.purchaseParty = req.query.purchaseParty;

    const total = await PurchaseOrder.countDocuments(filter);
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('purchaseParty')
      .populate('items.product')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      purchaseOrders,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('purchaseParty')
      .populate('items.product');
    if (!purchaseOrder) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(purchaseOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const lastPO = await PurchaseOrder.findOne().sort({ createdAt: -1 });
    let nextNumber = 'PO-001';
    if (lastPO && lastPO.poNumber) {
      const parts = lastPO.poNumber.split('-');
      const numPart = parts[parts.length - 1];
      const num = parseInt(numPart) + 1;
      nextNumber = `PO-${num.toString().padStart(3, '0')}`;
    }

    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      poNumber: nextNumber,
      date: req.body.date || new Date()
    });

    const newPO = await purchaseOrder.save();
    res.status(201).json(newPO);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPO) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(updatedPO);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const deletedPO = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deletedPO) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json({ message: 'Purchase Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const convertProformaToPO = async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findById(req.params.id);
    if (!proforma) return res.status(404).json({ message: 'Proforma Invoice not found' });

    const { purchasePartyId } = req.body;
    if (!purchasePartyId) return res.status(400).json({ message: 'Purchase Party is required' });

    const lastPO = await PurchaseOrder.findOne().sort({ createdAt: -1 });
    let nextNumber = 'PO-001';
    if (lastPO && lastPO.poNumber) {
      const parts = lastPO.poNumber.split('-');
      const numPart = parts[parts.length - 1];
      const num = parseInt(numPart) + 1;
      nextNumber = `PO-${num.toString().padStart(3, '0')}`;
    }

    const purchaseOrder = new PurchaseOrder({
      poNumber: nextNumber,
      proformaNumber: proforma.proformaNumber,
      purchaseParty: purchasePartyId,
      items: proforma.items,
      subTotal: proforma.subTotal,
      tax: proforma.tax,
      Additional_discount: proforma.Additional_discount,
      total: proforma.total,
      referencePerson: proforma.referencePerson,
      terms: proforma.terms,
      date: new Date()
    });

    const newPO = await purchaseOrder.save();

    proforma.po_created = true;
    proforma.po_id = newPO._id;
    await proforma.save();

    res.status(201).json(newPO);
  } catch (err) {
    console.error('PO Conversion Error:', err);
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  convertProformaToPO
};
