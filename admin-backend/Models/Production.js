const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
    date: { type: String, required: true },
    productionid: { type: String, required: true, unique: true },
    batch: { type: String, required: true, unique: true }, 
    restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor' },
    quantities: { type: Object, required: true }
});

module.exports = mongoose.model('Production', ProductionSchema);
