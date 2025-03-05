const express = require('express');
const mongoose = require('mongoose');
const Inventory = require('../Models/Inventory');
const Vendor = require('../Models/Vendor');
const Restaurant = require('../Models/Restaurant');

const router = express.Router();

// Add or update inventory stock
router.post('/updateStock', async (req, res) => {
  const { vendorId, restaurantId, stockUpdates } = req.body;

  if (!vendorId || !restaurantId || !Array.isArray(stockUpdates) || stockUpdates.length === 0) {
    return res.status(400).json({ message: 'Vendor, restaurant, and stock updates are required.' });
  }

  try {
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    const restaurant = await Restaurant.findById(restaurantObjectId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const stockData = stockUpdates.map((item) => ({
      menuItemId: new mongoose.Types.ObjectId(item.itemId),
      inStock: parseInt(item.inStock, 10),
    }));

    let inventory = await Inventory.findOne({ vendorId: vendorObjectId, restaurantId: restaurantObjectId });

    if (inventory) {
      // Update existing inventory
      stockData.forEach((newStock) => {
        const existingStockIndex = inventory.stock.findIndex((s) => s.menuItemId.equals(newStock.menuItemId));
        if (existingStockIndex !== -1) {
          inventory.stock[existingStockIndex].inStock = newStock.inStock;
        } else {
          inventory.stock.push(newStock);
        }
      });
      await inventory.save();
    } else {
      // Create new inventory record
      inventory = new Inventory({ vendorId: vendorObjectId, restaurantId: restaurantObjectId, stock: stockData });
      await inventory.save();
    }

    return res.status(200).json({ message: 'Stock updated successfully.' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return res.status(500).json({ message: 'Error updating stock.', error: error.message });
  }
});

// Get stock data for a restaurant
router.get('/getStock', async (req, res) => {
  const { vendorId, restaurantId } = req.query;

  if (!vendorId || !restaurantId) {
    return res.status(400).json({ message: 'Vendor ID and Restaurant ID are required.' });
  }

  try {
    const inventory = await Inventory.findOne({ vendorId, restaurantId }).populate('stock.menuItemId', 'name');

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
