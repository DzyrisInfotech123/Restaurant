const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String, 
    required: true,
    unique: true
  },  
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  contactNo: { 
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'user', 'Vendor', 'Distributor','employee'], // Add 'vendor' as an allowed role
    required: true,
  },

  // vendorId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Vendor', // Reference to the Vendor model (if needed)
  //   // required: function() {
  //   //   // Make vendorId required only if the role is 'vendor'
  //   //   return this.role === 'Distributor'; 
  //   // }
  // },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
