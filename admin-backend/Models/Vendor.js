// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {type:String, required:true, unique:true},
  vendorName: { type: String, required: true },
  vendorAddress: { type: String, required: true },
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  gstIn: {type: String, required: true},
  contactDetails: {type: String, required: true}
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
