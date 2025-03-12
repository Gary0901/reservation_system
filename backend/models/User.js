const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    lineId:{
        type:String,
        required:true,
        unique:true
    },
    name: {
        type:String,
        required:true 
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
});

module.exports = mongoose.model('User',UserSchema)