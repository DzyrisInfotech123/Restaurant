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
  date: { type: Date, required: true }
});

module.exports = mongoose.model("Order", orderSchema);
