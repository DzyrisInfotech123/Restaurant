const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Restaurant = require('../Models/Restaurant'); // Ensure this points to your Restaurant model

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Uploading file:', file.originalname); // Log the file name
    cb(null, 'uploads/'); // Directory where the images will be saved
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname); // Unique filename
    console.log('Saving file as:', fileName); // Log filename
    cb(null, fileName); // Save the file with the unique name
  },
});

const upload = multer({ storage });

// Serve static files from the 'uploads' folder
router.use('/uploads', express.static(path.join(__dirname, '../../admin-backend/Routes/uploads')));

// Add Restaurant route
router.post('/addRestaurant', upload.single('img'), async (req, res) => {
  console.log("Received file:", req.file); // Log file details
  console.log("Form data:", req.body); // Log the other form data

  try {
    const { restaurantId, name, type, price, status, vendorId } = req.body; // Include vendorId

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imgPath = `/uploads/${req.file.filename}`; // Use relative path for image

    const newRestaurant = new Restaurant({
      restaurantId, // Save the restaurantId passed in the form
      name,
      type,
      price,
      status,
      imgPath, // Store image path
      vendorId // Associate with vendor
    });

    await newRestaurant.save();
    return res.status(201).json({ message: "Restaurant added successfully!" });
  } catch (error) {
    console.error("Error adding restaurant:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Edit Restaurant route
router.put('/editRestaurant/:id', upload.single('img'), async (req, res) => {
  console.log("Editing restaurant with ID:", req.params.id);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid restaurant ID" });
  }

  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Update restaurant details with the new data
    Object.assign(restaurant, req.body);

    if (req.file) {
      restaurant.imgPath = `/uploads/${req.file.filename}`;
    }

    await restaurant.save();
    res.json({ message: "Restaurant updated successfully", restaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Restaurants by Vendor
router.get('/getRestaurant', async (req, res) => {
  const { vendorId } = req.query; // Get vendorId from query parameters
  try {
    const query = vendorId ? { vendorId } : {}; // If vendorId is provided, filter by it
    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Restaurant
router.delete('/deleteRestaurant/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;