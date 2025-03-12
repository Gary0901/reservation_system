// models/PricePolicy.js
const mongoose = require('mongoose');

const PricePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  applicableDays: {
    type: [Number], // 0-6 代表週日至週六
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priority: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('PricePolicy', PricePolicySchema);