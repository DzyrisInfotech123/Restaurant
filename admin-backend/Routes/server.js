const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const userRoutes = require('./user');
const authRoutes = require('./auth');
const restaurantRoutes = require('./RestaurantRoutes');
const menuRoutes = require('./menuRoutes');
const vendorRoutes = require('./VendorRoutes');
const productPricing = require('./ProductPricingRoutes');
const orderRoutes = require('./orderRoutes');

const app = express();
const PORT = process.env.PORT || 4100;

// CORS configuration
const corsOptions = {
  origin: 'https://devadmin.digitalexamregistration.com', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/menuitems', express.static(path.join(__dirname, 'menuitems')));

// MongoDB connection
mongoose.set('strictQuery', true);
mongoose
  .connect('mongodb://localhost:27017/Restaurant-Admins', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', menuRoutes);
app.use('/api', vendorRoutes);
app.use('/api', productPricing);
app.use('/api', orderRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Admin API!');
});

// 404 Error handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
