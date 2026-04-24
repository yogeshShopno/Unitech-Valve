const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
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
  status: { type: String, enum: ['pending', 'received', 'inprogress', 'Not received'], default: 'pending' },
  terms: { type: String },
  performa_invoice: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);
