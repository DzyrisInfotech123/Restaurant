const express = require('express');
const router = express.Router();
const Production = require('../Models/Production'); // Ensure you have a Production model
const MenuItem = require('../Models/MenuItem');
const Inventory = require('../Models/Inventory');
const mongoose = require('mongoose');

// Route to save production entry
router.post('/addproduction', async (req, res) => {
    console.log("Received Production Payload:", req.body);

    const { date, productionid, batch, restaurantId, vendorId, quantities } = req.body;

    if (!date || !productionid || !batch || !restaurantId || !vendorId || !quantities) {
        return res.status(400).json({ message: "Missing required fields", received: req.body });
    }

    try {
        // ✅ Check if productionid already exists
        const existingProduction = await Production.findOne({ productionid });
        if (existingProduction) {
            return res.status(400).json({ message: "Production ID already exists. Use a unique productionid." });
        }

        // ✅ Check if batch already exists
        const existingBatch = await Production.findOne({ batch });
        if (existingBatch) {
            return res.status(400).json({ message: "Batch code already exists. Use a unique batch code." });
        }

        // Fetch menu item names instead of IDs
        const menuItems = await MenuItem.find({ _id: { $in: Object.keys(quantities) } });

        // Replace IDs with Names
        const updatedQuantities = {};
        menuItems.forEach(item => {
            updatedQuantities[item.name] = quantities[item._id];
        });

        // Create and Save New Production Record
        const newProduction = new Production({
            date,
            productionid,
            batch,
            restaurantId,
            vendorId,
            quantities: updatedQuantities
        });

        await newProduction.save();

        // ✅ Update Inventory Stock
        let inventory = await Inventory.findOne({ vendorId, restaurantId });

        if (inventory) {
            // Inventory exists, update the stock
            Object.keys(quantities).forEach(itemId => {
                const menuItemId = new mongoose.Types.ObjectId(itemId);
                const quantityProduced = parseInt(quantities[itemId], 10);

                const existingStockIndex = inventory.stock.findIndex(s => s.menuItemId.equals(menuItemId));
                
                if (existingStockIndex !== -1) {
                    inventory.stock[existingStockIndex].inStock += quantityProduced; // ✅ Add produced quantity
                } else {
                    inventory.stock.push({ menuItemId, inStock: quantityProduced });
                }
            });

            await inventory.save();
        } else {
            // Inventory does not exist, create a new entry
            const stockData = Object.keys(quantities).map(itemId => ({
                menuItemId: new mongoose.Types.ObjectId(itemId),
                inStock: parseInt(quantities[itemId], 10)
            }));

            inventory = new Inventory({
                vendorId,
                restaurantId,
                stock: stockData
            });

            await inventory.save();
        }

        res.status(201).json({ message: "Production entry created successfully, inventory updated" });
    } catch (error) {
        console.error("Error saving production:", error);
        
        // Handle unique constraint error for batch
        if (error.code === 11000 && error.keyPattern.batch) {
            return res.status(400).json({ message: "Batch code already exists. Use a unique batch code." });
        }

        res.status(500).json({ message: "Server error", error });
    }
});


router.get('/getProductions', async (req, res) => {
    try {
        const { vendorId } = req.query;

        if (!vendorId) {
            return res.status(400).json({ message: "Vendor ID is required." });
        }

        // Fetch only the production entries for the specified vendor
        const productions = await Production.find({ vendorId }).populate('restaurantId', 'name');

        const updatedProductions = productions.map((production) => ({
            _id: production._id,
            date: production.date,
            productionid: production.productionid,
            batch: production.batch,
            restaurant: production.restaurantId ? production.restaurantId.name : "Unknown",
            quantities: production.quantities,
        }));

        res.json(updatedProductions);
    } catch (error) {
        console.error("Error fetching productions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/getProduction', async (req, res) => {
    try {
        // Fetch all production entries
        const productions = await Production.find().populate('restaurantId', 'name');

        const updatedProductions = productions.map((production) => ({
            _id: production._id,
            date: production.date,
            productionid: production.productionid,
            batch: production.batch,
            restaurant: production.restaurantId ? production.restaurantId.name : "Unknown",
            quantities: production.quantities,
        }));

        res.json(updatedProductions);
    } catch (error) {
        console.error("Error fetching productions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
