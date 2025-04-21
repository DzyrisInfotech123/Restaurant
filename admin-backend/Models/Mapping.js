const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  distributorIds: [
    {
      type: String, // distributorName, since you're using names in frontend
      required: true,
    },
  ],
});

module.exports = mongoose.model('Mapping', MappingSchema);
