const mongoose = require("mongoose");

const productPricingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  pricing: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
      price: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("ProductPricing", productPricingSchema);
