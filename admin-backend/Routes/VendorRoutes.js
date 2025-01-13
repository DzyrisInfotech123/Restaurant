const express = require('express');
const mongoose = require('mongoose');
const Vendor = require('../Models/Vendor'); // Ensure this points to your Vendor model

const router = express.Router();

// Add Vendor route
router.post('/addVendor', async (req, res) => {
  console.log("Received data:", req.body); // Log form data

  try {
    const { vendorId, vendorName, vendorAddress, state, stateCode, gstIn, contactDetails } = req.body;

    // Validate that all required fields are provided
    if (!vendorId||!vendorName || !vendorAddress || !state || !stateCode || !gstIn || !contactDetails ) {
      return res.status(400).json({ error: "All fields (vendorName, vendorAddress, state, stateCode) are required" });
    }

    // Create a new Vendor document
    const newVendor = new Vendor({
      vendorId,
      vendorName,
      vendorAddress,
      state,
      stateCode,
      gstIn,
      contactDetails,
    });

    // Save to database
    await newVendor.save();
    return res.status(201).json({ message: "Vendor added successfully!", vendor: newVendor });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return res.status(500).json({ error: "Error adding vendor: " + error.message });
  }
});

// Edit Vendor route
// Edit Vendor route
router.put('/editVendor/:vendorId', async (req, res) => {
    console.log("Editing vendor with ID:", req.params.vendorId);
  
    try {
      const { vendorId } = req.params;
      const vendor = await Vendor.findOne({ vendorId: vendorId }); // Use vendorId for finding the vendor
  
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
  
      // Update vendor details if new values are provided
      const { vendorName, vendorAddress, state, stateCode , gstIn , contactDetails} = req.body;
  
      vendor.vendorName = vendorName || vendor.vendorName;
      vendor.vendorAddress = vendorAddress || vendor.vendorAddress;
      vendor.state = state || vendor.state;
      vendor.stateCode = stateCode || vendor.stateCode;
      vendor.gstIn = gstIn || vendor.gstIn;
      vendor.contactDetails = contactDetails || vendor.contactDetails
  
      // Save updated vendor
      await vendor.save();
      res.json({ message: "Vendor updated successfully", vendor });
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Error updating vendor: " + error.message });
    }
  });
  
// Get All Vendors
router.get('/getVendor', async (req, res) => {
  try {
    const vendors = await Vendor.find(); // Get all vendors from DB
    if (vendors.length === 0) {
      return res.status(404).json({ message: "No vendors found" });
    }
    res.json(vendors); // Send the vendor list in response
  } catch (err) {
    console.error("Error fetching vendors:", err);
    res.status(500).json({ error: "Error fetching vendors: " + err.message });
  }
});

// Delete Vendor
router.delete('/deleteVendor/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error("Error deleting vendor:", err);
    res.status(500).json({ error: "Error deleting vendor: " + err.message });
  }
});

module.exports = router;
