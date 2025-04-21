const express = require('express');
const Distributor = require('../Models/Distributor'); // Ensure this points to your Distributor model

const router = express.Router();

// Add Distributor route
router.post('/addDistributor', async (req, res) => {
  console.log("Received data:", req.body); // Log form data

  try {

    const { distributorName,
      distributorId,
      constactNumber,
      distributorAddress,
      state,
      gstIn,
      active
    } = req.body;

    // Validate that all required fields are provided
    if (!distributorName || !distributorId || !constactNumber || !distributorAddress || !state || !gstIn) {
      return res.status(400).json({
        error: `All fields (distributorName, distributorId, constactNumber, distributorAddress, state, gstIn, active) are required` });
    }

    // Create a new Distributor document
    const newDistributor = new Distributor({
      distributorName,
      distributorId,
      constactNumber,
      distributorAddress,
      state,
      gstIn,
      active : active ? true : false
    });

    // Save to database
    await newDistributor.save();
    return res.status(201).json({ message: "Distributor added successfully!", distributor: newDistributor });
  } catch (error) {
    console.error("Error adding Distributor:", error);
    return res.status(500).json({ error: "Error adding Distributor: " + error.message });
  }
});

// Update Distributor route
router.put('/updateDistributor', async (req, res) => {
  console.log("Received data:", req.body); // Log form data

  try {

    const { distributorName,
      distributorId,
      constactNumber,
      distributorAddress,
      state,
      gstIn,
      active
    } = req.body;

    // Validate that all required fields are provided
    if (!distributorName || !distributorId || !constactNumber || !distributorAddress || !state || !gstIn) {
      return res.status(400).json({
        error: `All fields (distributorName, distributorId, constactNumber, distributorAddress, state, gstIn, active) are required` });
    }

    // Create a new Distributor document
    const updatedDistributor = await Distributor.updateOne({distributorId}, {
      distributorName,
      distributorId,
      constactNumber,
      distributorAddress,
      state,
      gstIn,
      active : active ? true : false
    });

    return res.status(201).json({ message: "Distributor Updated successfully!", distributor: updatedDistributor });
  } catch (error) {
    console.error("Error Updating Distributor:", error);
    return res.status(500).json({ error: "Error updateing Distributor: " + error.message });
  }
});


router.get('/getDistributor', async (req, res) => {
  try {
    const distributors = await Distributor.find({});
    res.status(200).json(distributors)
  } catch(error) {
    res.status(500).json({error: `Error on get distrbutor: ${error}`});
  }
})




module.exports = router


