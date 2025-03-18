// models/OperationHour.js
const mongoose = require('mongoose');

const OperationHourSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 代表週日至週六
    required: true,
    min:0,
    max:6,
    validate:{
      validator: function(v)  {
        return Number.isInteger(v);
      },
      message: props => `${props.value} 不是有效的星期數！必須是0-6的整數`
    }
  },
  openTime: {
    type: String, // 格式 "HH:MM"
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} 不是有效的時間格式！必須是 HH:MM`
    }
  },
  closeTime: {
    type: String, // 格式 "HH:MM"
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} 不是有效的時間格式！必須是 HH:MM`
    }
  },
  isHoliday: {
    type: Boolean,
    default: false
  }
});

OperationHourSchema.index({dayOfWeek:1},{unique:true})

module.exports = mongoose.model('OperationHour', OperationHourSchema);