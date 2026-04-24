const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  proformaNumber: { type: String }, // Reference to original proforma invoice
  purchaseParty: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseParty', required: true },
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
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  terms: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
