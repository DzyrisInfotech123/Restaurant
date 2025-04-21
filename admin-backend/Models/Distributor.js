// models/Distributor.js
const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema({
    distributorName: { type: String, required: true },
    distributorId: { type: String, required: true, unique: true },
    constactNumber: { type: String, required: true },
    distributorAddress: { type: String, required: true },
    state: { type: String, required: true },
    gstIn: { type: String, required: true },
    active: { type: Boolean, required: true },
    //   stateCode: { type: String, required: true },
});

const Distributor = mongoose.model('Distributor', distributorSchema);

module.exports = Distributor;
