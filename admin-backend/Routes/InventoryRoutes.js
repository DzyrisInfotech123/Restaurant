const express = require('express');
const mongoose = require('mongoose');
const Order = require("../Models/Order");
const Inventory = require('../Models/Inventory');
const Restaurant = require('../Models/Restaurant');

const router = express.Router();

// Add or update inventory stock (without vendor ID)
router.post("/updateStock", async (req, res) => {
  try {
    const { restaurantId, stockUpdates } = req.body;

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
        continue;
      }

      console.log(`🔄 Updating stock for Item ID: ${item.itemId}, Quantity: ${item.inStock}`);

      const inventory = await Inventory.findOne({ restaurantId });

      if (!inventory) {
        // If no inventory exists for the restaurant, create a new one
        const newInventory = new Inventory({
          restaurantId,
          stock: [{ menuItemId: item.itemId, inStock: item.inStock }],
        });
        await newInventory.save();
        updateCount++;
      } else {
        // Check if the item already exists in stock
        const existingStockIndex = inventory.stock.findIndex(
          (stockItem) => stockItem.menuItemId.toString() === item.itemId
        );

        if (existingStockIndex !== -1) {
          // If the item exists, update its stock
          inventory.stock[existingStockIndex].inStock = item.inStock;

        } else {
          // If the item does not exist, add it to stock
          inventory.stock.push({ menuItemId: item.itemId, inStock: item.inStock });
        }

        await inventory.save();
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

router.put("/updateStock", async (req, res) => {
  try {
    const { restaurantId, stockUpdates } = req.body;

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
        continue;
      }

      console.log(`🔄 Updating stock for Item ID: ${item.itemId}, Quantity: ${item.inStock}`);

      const inventory = await Inventory.findOne({ restaurantId });

      if (!inventory) {
        return res.status(404).json({ error: "Inventory not found for this restaurant." });
      }

      // Check if the item already exists in stock
      const existingStockIndex = inventory.stock.findIndex(
        (stockItem) => stockItem.menuItemId.toString() === item.itemId
      );

      if (existingStockIndex !== -1) {
        // If the item exists, update its stock
        inventory.stock[existingStockIndex].inStock += item.inStock;
      } else {
        // If the item does not exist, add it to stock
        inventory.stock.push({ menuItemId: item.itemId, inStock: item.inStock });
      }

      await inventory.save();
      updateCount++;
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