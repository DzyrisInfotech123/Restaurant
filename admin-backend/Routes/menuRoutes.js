const express = require('express');
const multer = require('multer');
const path = require('path');
const MenuItem = require('../Models/MenuItem'); // Ensure this points to your MenuItem model

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Serve static files
router.use('/uploads', express.static(path.join(__dirname, '../../uploads'))); // Update path to match your folder structure

// Add Menu Item
router.post('/addMenuItem', upload.single('img'), async (req, res) => {
  try {
    const { restaurantId, name, price, type, description, addOns } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imgPath = `/uploads/${req.file.filename}`;

    // Parse addOns to an array if it's not already an array
    let parsedAddOns = [];
    if (addOns) {
      try {
        parsedAddOns = JSON.parse(addOns);
        if (!Array.isArray(parsedAddOns)) {
          throw new Error('addOns must be an array');
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid addOns format, must be a JSON array' });
      }
    }

    const newMenuItem = new MenuItem({
      restaurantId,
      name,
      price,
      type,
      description,
      imgPath,
      addOns: parsedAddOns,
    });

    await newMenuItem.save();
    res.status(201).json({ message: 'Menu item added successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Menu Items for a Restaurant
router.get('/getMenuItems', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.query.restaurantId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Menu Item
router.put('/updateMenuItem/:id', upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, addOns } = req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    menuItem.name = name;
    menuItem.price = price;
    menuItem.description = description;

    // Parse addOns to an array if it's not already an array
    let parsedAddOns = [];
    if (addOns) {
      try {
        parsedAddOns = JSON.parse(addOns);
        if (!Array.isArray(parsedAddOns)) {
          throw new Error('addOns must be an array');
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid addOns format, must be a JSON array' });
      }
    }

    menuItem.addOns = parsedAddOns; // Update addOns

    if (req.file) {
      // If new image uploaded, replace old one
      menuItem.imgPath = `/uploads/${req.file.filename}`;
    }

    await menuItem.save();
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Menu Item
router.delete('/deleteMenuItem/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
