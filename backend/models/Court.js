const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    courtNumber:{
        type:Number,
        required:true 
    },
    isActive: {
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model('Court',CourtSchema)