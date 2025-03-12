// models/TimeSlot.js
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  courtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  startTime: {
    type: String, // 格式 "HH:MM"
    required: true
  },
  endTime: {
    type: String, // 格式 "HH:MM"
    required: true
  },
  defaultPrice: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);