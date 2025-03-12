const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true
    },
    date: {
        type:Date,
        required:true 
    },
    startTime: {
        type: String, // 格式 "HH:MM"
        required: true
    },
    endTime: {
        type: String, // 格式 "HH:MM"
        required: true
    },
    status: {
        type:String,
        enum:['pending','confirmed','cancelled'],
        default:'pending'
    },
    price:{
        type: Number,
        required: true
    },
    people_num: {
        type:Number,
        default:1
    }
})

module.exports = mongoose.model('Reservation',ReservationSchema)
