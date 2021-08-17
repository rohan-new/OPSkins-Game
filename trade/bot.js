const ExpressTrade = require('expresstrade');
var Id = require('mongoose').Types.ObjectId;
const tradeConfig = require('../configuration/trade-config');
const Raffle = require('../models/raffle');
const User = require('../models/user');
const RaffleRequirements = require('../models/raffle-requirements');


const ET = new ExpressTrade({
  apikey: tradeConfig.opskinsApiKey,
  twofactorsecret: tradeConfig.secret,
  pollInterval: tradeConfig.opskinsPollInterval * 1000
});


function sendTradeToWinner(opskinsId, tradeUrl, itemstosend, message, cb) { 
  ET.ITrade.SendOffer({ uid: opskinsId, trade_url: tradeUrl, items_to_send: itemstosend, message: message }, (err, body) => {
    if (err)
      return cb(err);

    if (body.status !== 1)
      return cb(new Error(body.message));

    cb(null, body);
  });
} 


function sendTrade(steamid, itemstoreceive, message, cb) {
  ET.ITrade.SendOfferToSteamId({ steam_id: steamid, items_to_receive: itemstoreceive, message: message }, (err, body) => {
    if (err)
      return cb(err);

    if (body.status !== 1)
      return cb(new Error(body.message));

    cb(null, body);
  });
}



// Retrieves the bot inventory
function getBotInventory(cb) {
  if (!cb)
    throw new Error('A callback function must be provided');

  let demItems = [];
  let page = 1;

  getIt();

  function getIt() {
    ET.IUser.GetInventory({
      page: page,
      per_page: 500
    }, (err, body) => {
      if (err)
        return cb(err);
      if (body.status !== 1)
        return cb(new Error(body.message));

      let items = body.response.items;
      items.forEach(function (item) {
        demItems.push(item);
      });

      if (body.total_pages == body.current_page)
        return nextStep(demItems);

      page += 1;
      getIt();
    });
  }

  function nextStep(demItems) {
    let inventory = [];
    // Loop through bot items
    demItems.forEach(function (item) {

      let price = item.suggested_price;

      // If all is good, push only the data we need to a local inventory array:
      inventory.push({
        name: item.name,
        id: item.id,
        category: item.category,
        color: item.color,
        img: item.image['300px'],
        price: price,
        rarity: item.rarity
      });

    });
    // Call the callback, returning our nicely formatted inventory
    cb(null, inventory);
  }
}

// Retrieves a user inventory
function getUserInventory(steamid, cb) {
  let userInv = [];
  let appIdsCountValue = 0;

  if (!steamid || !cb)
    throw new Error('Missing SteamID parameter or callback function');

  return doIt();

  function doIt() {
    // let demItems = [];
    let page = 1;
    [1, 31, 19, 20, 21, 44, 17, 43, 22, 16, 13, 12, 18, 32, 14, 24, 7, 8, 9, 11 ].map((appId, i)=>{
      getIt(appId, i);
    })
    // getIt();

    function getIt(appId, index) {
      let demItems = [];
      ET.ITrade.GetUserInventoryFromSteamId({
        steam_id: steamid,
        app_id: appId,
        page: page,
        sort: 6,
        per_page: 500
      }, (err, body) => {
        if (err){
          console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', err)
          return cb(err);
        }
        if (body.status !== 1)
          return cb('An unknown error occurred fetching bot inventory');

        let items = body.response.items;
       console.log('items -------------------------', items)
        items.forEach(function (item) {
          console.log(item);
          demItems.push(item);
        });

        if (body.total_pages > body.current_page) {
          page += 1;
          getIt(appId);
        } else {
          nextStep(demItems, index);
        }
      });
    }

    function nextStep(demItems, index) {
     appIdsCountValue +=  index;
      // let userInv = [];
      demItems.forEach(function (item) {

        let price = item.suggested_price;
        if(price/100 >= 1){
        // If it's all good, push it to our local array
        userInv.push({
          name: item.name,
          id: item.id,
          category: item.category,
          color: item.color,
          img: item.image['300px'] == undefined ? item.image: item.image['300px'] ,
          price: price,
          rarity: item.rarity
        });
      }
      });
      console.log('user Inventory --------------------', userInv);
      console.log('APP Id Index--------------------', index);
      if(appIdsCountValue == 190){
      // Callback with our local formatted inventory
      cb(null, { inventory: userInv });
      }

    }
  }
}



ET.on('offerReceived', (_offer) => {
  console.log('offer accepted');
  console.log(_offer.id)
});


ET.on('offerSent', (_offer) => {
  console.log('offer sent');
  console.log(_offer.id)
});


// When a sent trade is accepted...
ET.on('offerAccepted', offer => {
  console.log('ofer accepted', offer);
  let recipientName = offer.recipient.display_name;
  let recipientSteamId = offer.recipient.steam_id;
  let recipientUid = offer.recipient.uid;
  let tradeId = offer.id;

  if (offer.sender.items.length > 0 && offer.recipient.items.length == 0) {
    console.log("winner");
    console.log('items', offer.sender.items);
    console.log('itemId --------', offer.sender.items[0].id);
    let itemId = offer.sender.items[0].id;
    
  } else { 

    RaffleRequirements.findOne({active: true, opskinsId: offer.recipient.uid, raffle_id: offer.recipient.items[0].id}, (err, result)=>{
      if(err) return console.log('error in fetching user raFFLE JOINING REQUIREMENTS')
      console.log('result for raffle requirements', result);
      var twitch_follow = false;
      var twitter_follow = false;
      var youtube_follow = false;
      var twitter_follow_username = null;
      var twitch_follow_channelname = null;
      var youtube_follow_channelname = null;

      if(result.twitter_follow){
        twitter_follow = true;
        twitter_follow_username = result.twitter_follow_username
      }
      if(result.youtube_follow){
        youtube_follow = true;
        youtube_follow_channelname = result.youtube_follow_channelname
      }
      if(result.twitch_follow){
        twitch_follow = true;
        twitch_follow_channelname = result.twitch_follow_channelname
      }

      const raffle = new Raffle({  
        raffle_name: offer.recipient.items[0].name,
        raffle_id: offer.recipient.items[0].id,
        offer_id: offer.id,
        user_id: offer.recipient.uid,
        price: offer.recipient.items[0].suggested_price,
        required_members: result.tickets,
        raffle_image_url: offer.recipient.items[0].image['300px'],
        createdBy: offer.recipient.display_name,
        twitter_follow,
        youtube_follow,
        twitch_follow,
        twitter_follow_username,
        youtube_follow_channelname,
        twitch_follow_channelname
      });
      raffle.save().then((raffle) => {
        console.log('saved raffle details ---------------------------',raffle);
        RaffleRequirements.findOneAndUpdate({raffle_id: offer.recipient.items[0].id}, {
          $set: {
            active: false,
          }
        }, {
          new: true
        }, (err, result)=>{
          if (err) {
            console.log('error in changing status to false  in the rafflerequirements collection', err);
          }
        })
      })
  });

    let userId = offer.recipient.steam_id;
    var options = { upsert: true, new: true, setDefaultsOnInsert: true };
        query = { opskinsId: userId };
        update = { $inc: { raffles_created: 1 } };


    User.findOneAndUpdate(query, update, options, (err, result) => {
      if (err) {
        console.log('error in saving joined raffle info in the users collection', err);
      }
    });

  }

  // Log a nice summary of the trade
  console.log(`
  [ACCEPTED TRADE]
  Name: ${recipientName}
  Steamid: ${recipientSteamId}
  UID: ${recipientUid}
  Offer ID: ${tradeId}`);
});



module.exports = {
  sendTrade,
  sendTradeToWinner,
  getBotInventory,
  getUserInventory

};