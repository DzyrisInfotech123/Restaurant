// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  subtotal: { type: Number, required: true },
  taxes: { type: Number, required: true },
  total: { type: Number, required: true },

  // Cart items
  cart: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      description: { type: String },
      imgPath: { type: String },
      type: { type: String },
      addOns: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
