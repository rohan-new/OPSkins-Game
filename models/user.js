const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    opskinsId:{
        type: String,
        required: true 
    },
    name: {
        type: String,
        required: true
    },
    trade_url: {
        type: String,
    },
    email:{
         type: String,
    },
    raffles_created: {
        type: Number,
        default: 0
    },
    raffles_joined: {
        type: Number,
        default: 0
    },
    raffles_won: {
        type: Number,
        default: 0
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now        
    }
});

module.exports = Menu = mongoose.model('user', UserSchema);