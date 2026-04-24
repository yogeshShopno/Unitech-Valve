const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  unit: { type: String, default: 'PCS' },
  unitPrice: { type: Number, required: true },
  hsnCode: { type: String },
  valveSize: { type: String },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
