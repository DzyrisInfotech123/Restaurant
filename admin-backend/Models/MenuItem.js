
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imgPath: { type: String },
  addOns: { type: Array, default: [] },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
