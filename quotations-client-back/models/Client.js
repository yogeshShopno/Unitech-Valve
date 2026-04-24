const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  quotes: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'Review Required'], default: 'Active' },
  statusColor: { type: String, default: 'bg-green-100 text-green-800' },
  address: { type: String },
  gstin: { type: String },
  phone: { type: String },
  email: { type: String },
  referencePerson: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);