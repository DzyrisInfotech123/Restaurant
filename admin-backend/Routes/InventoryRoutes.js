const express = require('express');
const mongoose = require('mongoose');
const Order = require("../Models/Order");
const Inventory = require('../Models/Inventory');
const Restaurant = require('../Models/Restaurant');

const router = express.Router();

// Add or update inventory stock (without vendor ID)
router.put("/updateStock", async (req, res) => {
  try {
    const { restaurantId, stockUpdates } = req.body;

    // Validate input
    if (!restaurantId || !Array.isArray(stockUpdates) || stockUpdates.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields." });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId format." });
    }

    console.log("📥 Received Stock Update Request:", JSON.stringify(req.body, null, 2));

    let updateCount = 0;

    for (const item of stockUpdates) {
      if (!item.itemId || typeof item.inStock !== "number") {
        console.warn(`⚠️ Skipping invalid item:`, item);
        continue; // Skip invalid items
      }

      console.log(`🔄 Updating stock for Item ID: ${item.itemId}, Quantity: ${item.inStock}`);

      const updateResult = await Inventory.updateOne(
        { restaurantId, "stock.menuItemId": item.itemId }, // Match restaurant and menuItemId
        { $inc: { "stock.$.inStock": item.inStock } } // Update only the matching item in stock array
      );

      console.log("✅ Update Result:", updateResult);

      if (updateResult.modifiedCount > 0) {
        updateCount++;
      }
    }

    if (updateCount === 0) {
      return res.status(404).json({ error: "No stock updated. Items not found." });
    }

    res.status(200).json({ message: `Stock updated for ${updateCount} items.` });
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    res.status(500).json({ error: "Failed to update stock", details: error.message });
  }
});

// Get stock data for a restaurant (without vendor ID)
router.get('/getStock', async (req, res) => {
  const { restaurantId } = req.query;

  if (!restaurantId) {
    return res.status(400).json({ message: 'Restaurant ID is required.' });
  }

  try {
    const inventory = await Inventory.findOne({ restaurantId }).populate('stock.menuItemId', 'name');

    if (!inventory) {
      return res.status(404).json({ message: 'No stock found for this restaurant.' });
    }

    return res.status(200).json({ stock: inventory.stock });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return res.status(500).json({ message: 'Error fetching stock.' });
  }
});

module.exports = router;
