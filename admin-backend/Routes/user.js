const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// Add User
router.post('/addUser', async (req, res) => {
  const { username, password, role, vendorId } = req.body;  // Include vendorId in the body
  const authenticateToken = require('./middleware/authenticateToken');

  try {
    // If the role is vendor, ensure vendorId is provided
    if (role === 'vendor' && !vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required for the vendor role' });
    }

    const newUser = new User({
      username,
      password,
      role,
      vendorId: role === 'vendor' ? vendorId : undefined,  // Assign vendorId only if role is 'vendor'
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/getUsers', async (req, res) => {
  try {
    const users = await User.find().select('-password');  // Do not return password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get All Users
router.get('/getCartuser', async (req, res) => {
  try {
    const username = req.headers['username']; // Extract username from headers
    if (!username) {
      return res.status(400).json({ error: "Username is missing" });
    }

    const user = await User.findOne({ username }).select('-password'); // Find user by username
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user); // Return user data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete User
router.delete('/deleteUser/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
