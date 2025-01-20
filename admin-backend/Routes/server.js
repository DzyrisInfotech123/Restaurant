const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const restaurantRoutes = require('./RestaurantRoutes');
const menuRoutes = require('./menuRoutes');
const vendorRoutes = require('./VendorRoutes');
const productPricing = require('./ProductPricingRoutes');
const orderRoutes = require('./orderRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/menuitems", express.static(path.join(__dirname, 'menuitems')));


// MongoDB connection
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/Restaurant-Admins')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Use routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', menuRoutes);
app.use('/api', vendorRoutes);
app.use('/api', productPricing);
app.use('/api', orderRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
