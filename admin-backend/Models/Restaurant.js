const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, unique: true },  // New restaurantId field
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, required: true },
  imgPath: { type: String, required: true }, // Field to store the image path
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true } // Associate with Vendor
});

module.exports = mongoose.model('Restaurant', restaurantSchema);