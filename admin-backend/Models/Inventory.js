const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  stock: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      inStock: { type: Number, required: true, default: 0 },
    },
  ],
});

module.exports = mongoose.model('Inventory', InventorySchema);
