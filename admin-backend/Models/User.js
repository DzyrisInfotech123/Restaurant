const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'admin', 'user', 'vendor'], // Add 'vendor' as an allowed role
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor', // Reference to the Vendor model (if needed)
    required: function() {
      // Make vendorId required only if the role is 'vendor'
      return this.role === 'vendor';
    }
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
