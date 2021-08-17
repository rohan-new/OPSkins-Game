const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RaffleRequirementsSchema = new Schema({
    opskinsId:{
        type: String,
        required: true 
    },
    raffle_id:{
        type: String,
        required: true 
    },
    active:{
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true
    },
    tickets:{
        type: String,
        required: true
    },
    twitter_follow:{
        type: Boolean,
        required: true
    },
    youtube_follow:{
        type: Boolean,
        required: true
    },
    twitch_follow:{
        type: Boolean,
        required: true
    },
    twitter_follow_username:{
        type: String,
    },
    youtube_follow_channelname:{
        type: String,
    },
    twitch_follow_channelname:{
        type: String,
    },
    email:{
         type: String,
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

module.exports = Menu = mongoose.model('raffleRequirements', RaffleRequirementsSchema);