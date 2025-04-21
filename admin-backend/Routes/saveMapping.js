const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Mapping = require('../Models/Mapping'); // Update path as per your project

router.post('/saveMappings', async (req, res) => {
  try {
    const mappings = req.body; // Direct vendorId: [vendorNames] object

    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({ message: 'Invalid request body format.' });
    }

    // Optional: Clear previous mappings
    await Mapping.deleteMany();

    const formatted = Object.entries(mappings).map(([vendorId, distributorIds]) => {
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        throw new Error(`Invalid vendorId: ${vendorId}`);
      }

      if (!Array.isArray(distributorIds)) {
        throw new Error(`Distributors must be an array for vendorId: ${vendorId}`);
      }

      return {
        vendorId,
        distributorIds,
      };
    });

    await Mapping.insertMany(formatted);
    res.status(200).json({ message: 'Mappings saved successfully' });
  } catch (error) {
    console.error('Error saving mappings:', error.message);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

router.get('/getMappings', async (req, res) => {
  try {
    const mappings = await Mapping.find().populate('vendorId', 'vendorName'); // assuming vendorName field exists

    const result = {};
    mappings.forEach(({ vendorId, distributorIds }) => {
      result[vendorId._id] = {
        vendorName: vendorId.vendorName,
        distributors: distributorIds,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching mappings:', error);
    res.status(500).json({ message: 'Failed to fetch mappings' });
  }
});

module.exports = router;
