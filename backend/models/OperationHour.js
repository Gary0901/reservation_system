// models/OperationHour.js
const mongoose = require('mongoose');

const OperationHourSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 代表週日至週六
    required: true
  },
  openTime: {
    type: String, // 格式 "HH:MM"
    required: true
  },
  closeTime: {
    type: String, // 格式 "HH:MM"
    required: true
  },
  isHoliday: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('OperationHour', OperationHourSchema);