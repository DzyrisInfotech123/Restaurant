// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  vendorId: { type: String, required: true, unique: true },
  constactNumber: { type: String, required: true },
  vendorAddress: { type: String, required: true },
  state: { type: String, required: true },
  gstIn: { type: String, required: true },
  active: { type: Boolean, required: true },
});
 
const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
