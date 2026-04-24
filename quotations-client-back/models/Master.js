const mongoose = require('mongoose');

const MasterSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String },
  website: { type: String },
  email: { type: String },
  logo: { type: String }, // URL or base64
  termsAndConditions: { type: String },
  hsnCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Master', MasterSchema);
