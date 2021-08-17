const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RaffleSchema = new Schema({
    raffle_name: {
        type: String,
        required: true
    },
    raffle_id:{
        type: Number,
        required: true
    },
    offer_id:{
        type: Number,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    required_members: {
        type: Number,
        required: true,
        default: 0
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
    joined_members: [{ 
        id: {
            type: String,
            required: true
        },
        opskinsId: {
            type: String,
            required: true
        },
        trade_url: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        image_url:{
            type: String
        },
        slot:{
            type: Number
        },
        twitter_follow:{
            type: Boolean,
            // required: true
        },
        youtube_follow:{
            type: Boolean,
            // required: true
        },
        twitch_follow:{
            type: Boolean,
            // required: true
        },
    }],
    active:{
        type: Boolean,
        default: true
    },
    winner: {
        type: String,
        default: null
    },
    winner_uid: {
        type: String,
        default: null
    },
    raffle_image_url:{
        type: String
    },
    winner_image_url:{
        type: String,
        default: null
    },
    createdBy:{
        type: String,
        required: true
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

module.exports = Menu = mongoose.model('raffle', RaffleSchema);