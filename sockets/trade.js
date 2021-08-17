var Id = require('mongoose').Types.ObjectId;
const bot = require('../trade/bot');
const Raffle = require('../models/raffle');
const User = require('../models/user');
const RaffleRequirements = require('../models/raffle-requirements');
const config = require('../configuration/trade-config');

module.exports = {
  sendTrade: function (socket, user) {
    return function (data) {
      console.log('trade ------------', data)
      // If they're logged in
      if (!user) {
        console.log('no user or data ----------------', );
        socket.emit('login', `Please login to trade!`);
        return socket.emit('alert', `Please login to trade!`, 'error');
      }
      if (!data.itemId.length) {
        socket.emit('alert', `Please select some items first!`, 'error');
        return socket.emit('tradeFailed', `Please select some items first!`);
      }

      // Since OPSkins don't separate the two sides of the trade, we'll verify both
      // inventories to make sure items belong to the correct parties.
      bot.getUserInventory(user.id64, (err, localInventory) => {
        if (err) {
          console.error(err);
          return socket.emit('tradeFailed', `An error occurred, please try again`);
        }
        let localUserInv = localInventory.inventory;
        let proposedUserItems = [];
        let userTotalValue = 0;

        // For each proposed item, add it to the correct
        // separate array: check whether the proposed useritems exists.
        data.itemId.forEach((proposedItem) => {
          localUserInv.forEach((realUserItem) => {
            if (proposedItem == realUserItem.id) {
              if (realUserItem.price >= 10) { //chmage it to 200 later
                proposedUserItems.push(realUserItem);
                userTotalValue += realUserItem.price;
              } else {
                socket.emit('alert', `One or more of these items cannot be used to create a raffle as its value is less than 2 Dollars`);
                return socket.emit('tradeFailed', `One or more of these items cannot be used to create a raffle as its value is less than 2 Dollars`);
              }
            }
          });
        });

        if (proposedUserItems.length <= 0) {
          socket.emit('alert', `One or more selected items don't exist, try refreshing`, 'error');
          return socket.emit('tradeFailed', `One or more selected items don't exist, try refreshing`)
        }

        let userIdArr = [];

        proposedUserItems.forEach((userItem) => {
          userIdArr.push(userItem.id);
        });


        // Let the user know we're sending their offer now
        socket.emit('changeTradeStatus', `Sending offer...`);

        // Send the offer using the expresstrade module
        bot.sendTrade(user.id64, userIdArr.toString(), config.tradeMessage, (err, body) => {
          if (err) {
            console.error('error ----------------------------------------',   err);
            return socket.emit('tradeFailed', { error: String(err) });
          }
          console.log(body);
          socket.emit('tradeSuccess', {
            msg: `Trade offer sent!`,
            data: body.response.offer.id,
            userData: userIdArr
          });

          // req.session.userDetails
          var twitch_follow = false;
          var twitter_follow = false;
          var youtube_follow = false;
          var twitter_follow_username = null;
          var twitch_follow_channelname = null;
          var youtube_follow_channelname = null;

          console.log('raffle requiremnets----------------------', data);


          if(data.twitchUserName != null){
            twitch_follow = true;
            twitch_follow_channelname = data.twitchUserName
          }
          if(data.twitterUserName != null){
            twitter_follow = true;
            twitter_follow_username = data.twitterUserName
          }
          if(data.youtubeChannelname != null){
            youtube_follow = true;
            youtube_follow_channelname = data.youtubeChannelname
          }

          const raffleRequirements = new RaffleRequirements({ 
            opskinsId: user.id,
            name: user.username,
            raffle_id: data.itemId[0],
            tickets: data.members,
            twitter_follow: true,
            youtube_follow: true,
            email: user.email.contact_email,
            createdBy: user.username,
            twitter_follow,
            youtube_follow,
            twitch_follow,
            twitter_follow_username,
            youtube_follow_channelname,
            twitch_follow_channelname
          });
          raffleRequirements.save().then((raffle) => {
            console.log('raffle requirements saved', raffle);
          })
  
          let notif = `[SENT TRADE]`;

          // Log that an offer has been sent.
          console.log(`${notif} - Awaiting accept Offer ID: ${body.response.offer.id}`);
        });
      });
    }
  },





  // Send trade to the winner

  sendTradeToWinner: function (itemId, raffleId, cb) {
      var objectid = raffleId;
      var data = [];
      data.push(itemId);
      Raffle.find({ 
        _id: new Id(objectid)
      }).then((result) => {
        if (!result || result.length <= 0) {
         return cb('No raffle found, Please Try again');
        }
        // var filledSlots = result[0];
        // if (result.length > 0) {
        //   result[0].joined_members.map((slots) => {
        //     filledSlots.push(slots.slot);
        //   });
        // }
        var randomSlotIndex = Math.floor(Math.random() * result[0].required_members);
        console.log('random slot index winner -----------------', randomSlotIndex);
        var winnerId = result[0].joined_members[randomSlotIndex].id;
        var winnerOpskinsId = result[0].joined_members[randomSlotIndex].opskinsId;
        var winnerTradeUrl = result[0].joined_members[randomSlotIndex].trade_url;
        var winnerName = result[0].joined_members[randomSlotIndex].name;
        var winnerImageUrl = result[0].joined_members[randomSlotIndex].image_url;



        // Since OPSkins don't separate the two sides of the trade, we'll verify both
        // inventories to make sure items belong to the correct parties.
        bot.getBotInventory((err, items) => {
          if (err) {
            console.log('error in bot inventory ladup',err);
            // return socket.emit('tradeFailed', `An error occurred, please try again`);
          return  cb('error in fetching the bot inventory')
          }
          let localBotInv = items;
          let proposedBotItems = [];
          let botTotalValue = 0;

          // For each proposed item, add it to the correct
          // separate array: either bot or user.
          data.forEach((proposedItem) => {

            localBotInv.forEach((realBotItem) => {
              if (proposedItem == realBotItem.id) {
                proposedBotItems.push(realBotItem);
                botTotalValue += realBotItem.price;
              } 
            });
          });

          let botIdArr = [];

          proposedBotItems.forEach((botItem) => {
            botIdArr.push(botItem.id);
          });

          console.log('winner item to be sent to the winner -------------------xxxxx', botIdArr);
          // Send the offer using the expresstrade module
          bot.sendTradeToWinner(winnerOpskinsId, winnerTradeUrl, botIdArr.toString(), config.tradeMessage, (err, body) => {
            if (err) {
              console.error(err);
            return  cb('Unable to send trade offer to the winner');
            }
            let notif = `[SENT TRADE]`;

            Raffle.findOneAndUpdate({
              _id: new Id(objectid),
              active: true
            }, {
                $set: {
                  active: false,
                  winner: winnerName,
                  winner_image_url: winnerImageUrl,
                  winner_uid: winnerId
                }
              }, {
                new: true
              }, (err, result) => {
                if (err) {
                  return cb(err);
                }
                if (result) {
                  console.log('raffle data updated after sending the trade to winner--',result);
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true };
                  query = { opskinsId: winnerId, name: winnerName }
                  update = { $inc: { raffles_won: 1 } };
        
        
                  User.findOneAndUpdate(query, update, options, (err, result) => {
                    if (err) {
                      console.log('error in saving joined raffle info in the users collection');
                    }
                   return cb(null, result);
                  })
                }
                if (!result) {
                  console.log('no raffles found')
                  cb('no raffles found')
                }
              })


            // Log that an offer has been sent.
            console.log(`${notif} - Awaiting accept Offer ID: ${body.response.offer.id}`);
          });
        });
      })

      //ss
    // }
  }

};