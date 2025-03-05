const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  cart: [
    {
      vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Vendor" },
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      imgPath: { type: String }, // New field for image path
    }
  ],
  subtotal: { type: Number, required: true },
  taxes: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, required: true },
  priceType: { type: String, enum: ["sale", "purchase"], required: true }, // Ensure priceType is defined here
  status: {
    type: String,
    enum: ["booked", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled"], // Valid order statuses
    default: "booked", // Default status for new orders
  },
  processed: { type: Boolean, default: false }
});

module.exports = mongoose.model("Order", orderSchema);