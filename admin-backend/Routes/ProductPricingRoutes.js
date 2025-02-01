const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Importing the models (ensure paths are correct)
const Vendor = require('../Models/Vendor');
const Restaurant = require('../Models/Restaurant');
const MenuItem = require('../Models/MenuItem');
const ProductPricing = require('../Models/ProductPricing'); // Assuming you have a ProductPricing model

// Route to add/update product pricing
router.post('/addProductPricing', async (req, res) => {
  const { vendorId, restaurantId, pricingData } = req.body;

  // Validation check
  if (!vendorId || !restaurantId || !Array.isArray(pricingData) || pricingData.length === 0) {
    return res.status(400).json({ message: 'Vendor, restaurant, and pricing data are required.' });
  }

  try {
    // Convert string IDs to ObjectIds using mongoose
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    // Verify that the vendor exists
    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Verify that the restaurant exists
    const restaurant = await Restaurant.findById(restaurantObjectId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Process the pricing data
    const updatedPricingData = pricingData.map((item) => {
      const { menuItemId, purchasePrice, salePrice } = item;

      // Validate menu item ID, purchase price, and sale price
      if (!menuItemId || purchasePrice === undefined || salePrice === undefined) {
        throw new Error('Menu item ID, purchase price, and sale price are required.');
      }

      return {
        menuItemId: new mongoose.Types.ObjectId(menuItemId),
        purchasePrice: parseFloat(purchasePrice),
        salePrice: parseFloat(salePrice),
      };
    });

    // Check if pricing already exists for this vendor and restaurant
    const existingPricing = await ProductPricing.findOne({
      vendorId: vendorObjectId,
      restaurantId: restaurantObjectId,
    });

    if (existingPricing) {
      // If pricing exists, update the pricing array
      existingPricing.pricing = updatedPricingData; // Replace with new pricing data
      await existingPricing.save();
    } else {
      // If no pricing exists, create a new document with the pricing data
      const newProductPricing = new ProductPricing({
        vendorId: vendorObjectId,
        restaurantId: restaurantObjectId,
        pricing: updatedPricingData,
      });
      await newProductPricing.save();
    }

    // Success response
    return res.status(200).json({
      message: 'Product pricing saved successfully.',
    });
  } catch (error) {
    console.error('Error saving product pricing:', error);

    // Error response
    return res.status(500).json({
      message: 'Error saving product pricing.',
      error: error.message || 'Unknown error occurred.',
    });
  }
});


router.get('/getProductPricing', async (req, res) => {
  const { vendorId, restaurantId } = req.query;

  if (!vendorId || !restaurantId) {
    return res.status(400).json({ message: 'Vendor ID and Restaurant ID are required.' });
  }

  try {
    // Fetch product pricing for the vendor and restaurant combination
    const productPricing = await ProductPricing.findOne({
      vendorId: vendorId, // Use string vendorId directly
      restaurantId: restaurantId,
    }).populate('pricing.menuItemId', 'name'); // Populate menuItem details (name of food items)

    if (!productPricing) {
      return res.status(404).json({ message: 'No pricing found for this vendor and restaurant.' });
    }

    // Send the pricing data along with the menu item details
    return res.status(200).json({
      pricing: productPricing.pricing,
    });
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    return res.status(500).json({ message: 'Error fetching product pricing' });
  }
});

module.exports = router;
