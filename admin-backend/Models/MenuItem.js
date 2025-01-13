const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 }, // Unique identifier
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imgPath: { type: String },
  addOns: { type: Array, default: [] },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
