const Quotation = require('../models/Quotation');

const createQuotation = async (req, res) => {
  try {
    const lastQuote = await Quotation.findOne().sort({ createdAt: -1 });
    let nextNumber = 'QTN-001';
    if (lastQuote && lastQuote.quotationNumber) {
      const parts = lastQuote.quotationNumber.split('-');
      const numPart = parts[parts.length - 1];
      const num = parseInt(numPart) + 1;
      nextNumber = `QTN-${num.toString().padStart(3, '0')}`;
    }

    const quotation = new Quotation({
      ...req.body,
      quotationNumber: nextNumber
    });
    await quotation.save();
    res.status(201).json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getQuotations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.client) filter.client = req.query.client;

    const total = await Quotation.countDocuments(filter);
    const quotations = await Quotation.find(filter)
      .populate('client')
      .populate('items.product')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      quotations,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('client')
      .populate('items.product');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(updatedQuotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const deletedQuotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!deletedQuotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation
};
