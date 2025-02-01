const mongoose = require("mongoose");

const productPricingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  pricing: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
      purchasePrice: { type: Number, required: true },  // Add purchase price
      salePrice: { type: Number, required: true },      // Add sale price
    },
  ],
});

module.exports = mongoose.model("ProductPricing", productPricingSchema);
