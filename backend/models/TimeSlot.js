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
  },
  isTemplate:{
    type:Boolean,
    default:false
  },
  name:{
    type:String,
    required : function() {
      return this.isTemplate === true;
    }
  },

  // 對於實際的時段 (非模板)，我們需要知道日期
  date:{
    type:Date,
    required : function() {
      return this.isTemplate === false;
    }
  }
});

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);