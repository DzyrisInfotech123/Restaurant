const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/User'); // Assuming the User model is in the Models folder
const Vendor = require('../Models/Vendor'); // Assuming the Vendor model is in the Models folder

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the plain text password directly with the stored password
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If the user is a vendor, find the associated vendor using the vendorId from the user model
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findById(user.vendorId);

      // If no vendor is found, return error response
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
    }

    // Generate JWT token for the user including user info and vendorId
    const token = jwt.sign(
      { id: user._id, role: user.role, vendorId: user.vendorId }, 
      'secretkey', // You should replace this with a more secure key in a real application
      { expiresIn: '1d' } // Token expiration time
    );

    // Send the token and vendor data in the response (if the user is a vendor)
    res.json({
      token, // Send the generated token to the frontend
      user: user, // Send the user information to the frontend
      vendor: vendor || null // Send vendor information only if the user is a vendor
    });
  } catch (err) {
    // Catch any error and send it to the frontend
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
