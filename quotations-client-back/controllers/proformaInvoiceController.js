const ProformaInvoice = require('../models/ProformaInvoice');
const Quotation = require('../models/Quotation');

const convertQuotationToProforma = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    // Check if already converted
    if (quotation.performa_invoice) {
      return res.status(400).json({ message: 'Quotation already converted to Proforma Invoice' });
    }

    const lastPI = await ProformaInvoice.findOne().sort({ createdAt: -1 });
    let nextNumber = 'PI-001';
    if (lastPI && lastPI.proformaNumber) {
      const parts = lastPI.proformaNumber.split('-');
      const numPart = parts[parts.length - 1];
      const num = parseInt(numPart) + 1;
      nextNumber = `PI-${num.toString().padStart(3, '0')}`;
    }

    const proformaInvoice = new ProformaInvoice({
      proformaNumber: nextNumber,
      quotationNumber: quotation.quotationNumber,
      client: quotation.client,
      items: quotation.items,
      subTotal: quotation.subTotal,
      tax: quotation.tax,
      Additional_discount: quotation.Additional_discount,
      total: quotation.total,
      referencePerson: quotation.referencePerson,
      terms: quotation.terms,
      date: new Date()
    });

    await proformaInvoice.save();

    // Update quotation status
    quotation.performa_invoice = true;
    quotation.status = 'received';
    await quotation.save();

    res.status(201).json(proformaInvoice);
  } catch (err) {
    console.error('Conversion Error:', err);
    res.status(400).json({ message: err.message });
  }
};

const getProformaInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.client) filter.client = req.query.client;

    const total = await ProformaInvoice.countDocuments(filter);
    const proformaInvoices = await ProformaInvoice.find(filter)
      .populate('client')
      .populate('items.product')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      proformaInvoices,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProformaInvoiceById = async (req, res) => {
  try {
    const proformaInvoice = await ProformaInvoice.findById(req.params.id)
      .populate('client')
      .populate('items.product');
    if (!proformaInvoice) return res.status(404).json({ message: 'Proforma Invoice not found' });
    res.json(proformaInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProformaInvoice = async (req, res) => {
  try {
    const updatedPI = await ProformaInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPI) return res.status(404).json({ message: 'Proforma Invoice not found' });
    res.json(updatedPI);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProformaInvoice = async (req, res) => {
  try {
    const deletedPI = await ProformaInvoice.findByIdAndDelete(req.params.id);
    if (!deletedPI) return res.status(404).json({ message: 'Proforma Invoice not found' });
    res.json({ message: 'Proforma Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  convertQuotationToProforma,
  getProformaInvoices,
  getProformaInvoiceById,
  updateProformaInvoice,
  deleteProformaInvoice
};
