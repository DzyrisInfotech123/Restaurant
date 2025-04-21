const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// Add User
router.post('/addUser', async (req, res) => {
  const { userName, password, role, userId, contactNo, active } = req.body;

  console.log(req.body)

  // return res.status(201).json({ message: 'User added successfully' });

  // Validate request data

  if (!userName || !password || !role) {
    return res.status(400).json({ error: 'userName, password, and role are required.' });
  }

  if ((role === 'Distributor' || role === 'Vendor') && !userId) {
    return res.status(400).json({ error: 'Vendor ID is required for Distributor or Vendor role.' });
  }

  try {
    const newUser = new User({
      userName,
      password,
      role, 
      contactNo,
      userId,
      active
    });

    console.log(newUser)

    await newUser.save();

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err });
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

router.put('/updateUser', async (req, res) => {
  try {
    const { userName, password, role, userId, contactNo, active } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId not found" });
    }

    const users = await User.updateOne({ userId }, {
      userName, password, role, userId, contactNo, active
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get All Users
router.get('/getCartuser', async (req, res) => {
  try {
    const userName = req.headers['userName']; // Extract userName from headers
    if (!userName) {
      return res.status(400).json({ error: "userName is missing" });
    }

    const user = await User.findOne({ userName }).select('-password'); // Find user by userName
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
