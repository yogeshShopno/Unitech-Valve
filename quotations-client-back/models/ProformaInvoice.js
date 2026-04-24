const mongoose = require('mongoose');

const ProformaInvoiceSchema = new mongoose.Schema({
  proformaNumber: { type: String, required: true, unique: true },
  quotationNumber: { type: String }, // Reference to original quotation
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      description: { type: String, required: true },
      image: { type: String },
      hsnCode: { type: String },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      amount: { type: Number, required: true }
    }
  ],
  subTotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  Additional_discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  referencePerson: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  terms: { type: String },
  po_created: { type: Boolean, default: false },
  po_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' }
}, { timestamps: true });

module.exports = mongoose.model('ProformaInvoice', ProformaInvoiceSchema);
