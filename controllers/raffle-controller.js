const request = require('request');
var Id = require('mongoose').Types.ObjectId;
const Raffle = require('../models/raffle');
const User = require('../models/user');
const trade = require('../sockets/trade');

module.exports.getRafflesList = async (req, res) => {

  Raffle.find({
    active: true
  }).then((result) => {
    if (result) {

      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}


module.exports.getCompletedRafflesList = async (req, res) => {

  Raffle.find({
    active: false
  }).sort({ createdAt: -1 }).then((result) => {
    if (result) {

      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No completed Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching completed Raffles List',
      error: err
    });
  });
}

//count of raffles completed in a day.

module.exports.getCompletedRafflesCountInADay = async (req, res) => {

  Raffle.find({
    active: false,
    createdAt: { "$gt": new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).sort({ price: -1 }).then((result) => {
    if (result) {
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Completed Raffles Today"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}


// Top Raffle Wins In a Day 
module.exports.topRafflesWins = async (req, res) => {

  Raffle.find({
    active: false,
    createdAt: { "$gt": new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).sort({ price: -1 }).limit(3).then((result) => {
    if (result) {
      console.log('top 3 ----', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}


//Sort By Most Recent Active Raffles 
module.exports.mostRecentRaffles = async (req, res) => {
  Raffle.find({
    active: true,
  }).sort({ createdAt: -1 }).then((result) => {
    if (result) {
      console.log('recent raffles  ----', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}


//sort by expensive raffles
module.exports.sortByExpensiveRaffles = async (req, res) => {
  Raffle.find({
    active: true,
  }).sort({ price: -1 }).then((result) => {
    if (result) {
      console.log('expensive raffles  ----', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}



//sort by expensive completd raffles
module.exports.sortByExpensiveCompletedRaffles = async (req, res) => {
  Raffle.find({
    active: false,
  }).sort({ price: -1 }).then((result) => {
    if (result) {
      console.log('expensive raffles  ----', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}



//Sort By Most Recent Completed Raffles 
module.exports.mostRecentCompletedRaffles = async (req, res) => {
  Raffle.find({
    active: false,
  }).sort({ createdAt: -1 }).then((result) => {
    if (result) {
      console.log('recent raffles  ----', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}

module.exports.getRafflesDetails = async (req, res) => { 
  var id = req.query.id;
  Raffle.find({
    _id: new Id(id),
  }).then((result) => {
    if (result.length > 0) {
      console.log('raffle details --------------------------------------------', result);
      return res.json({
        status: true,
        data: result
      });
    }
    if (!result || result.length <= 0) {
      return res.json({
        status: false,
        message: "No Active Raffles"
      });
    }

  }).catch((err) => {
    return res.json({
      status: false,
      message: 'Error in fetching Raffles List',
      error: err
    });
  });
}



module.exports.updateRequiredMembers = async (req, res) => {
  req.session.save();
  var input = req.body;
  var raffle_id = input.itemId;
  var required_members = input.members;
  var createdBy = req.session.userDetails.username;
  Raffle.findOneAndUpdate({
    raffle_id: raffle_id,
    createdBy: createdBy
  }, {
      $set: {
        required_members: required_members
      }
    }, {
      new: true
    }, (err, result) => {
      if (err) {
        return res.json({
          status: false,
          error: err
        });
      }
      if (result) {
        return res.json({
          status: true,
          data: result
        });
      }
      if (!result) {
        return res.json({
          status: false,
          message: "No Dish Found in the Menu with this name"
        });
      }
    })
}




module.exports.joinRaffle = async (req, res) => { 
  console.log('join raffle data', req.body);
  var input = req.body;
  var objectid = input.id;
  var slotNo = input.slotNo;
  var name = req.session.userDetails.username;
  var imageUrl = req.session.userDetails.avatar;
  var userId = req.session.userDetails.id64;
  var opskinsId = req.session.userDetails.id;
  var email = req.session.userDetails.email.contact_email;
  var tradeUrl = req.session.userDetails.options.trade_url;
  console.log('trade url of the user joining raffle', tradeUrl, req.session.userDetails.options.trade_url )
  var memberData = { id: userId, opskinsId: opskinsId, name: name, image_url: imageUrl, slot: slotNo, trade_url: tradeUrl };
  console.log('twiter adta ------------', req.session.twitterOauth)  

  if(req.session.twitterOauth == undefined || req.session.twitterOauth == null ||  req.session.twitchSession == undefined ||  req.session.twitchSession == null){
    
    return res.json({
      status: false,
      message: "Please log into twitter, twitch and Youtube!!"
    })
  }

  Raffle.find({ _id: new Id(objectid)},(err, result)=>{

    console.log('raffle join raflle details -------------------------------xxxxxxxxxxxxxxx', result);
    if (err) {
      return res.json({
        status: false,
        error: err
      });
    }

    if (!result || result.length <= 0) {
      return res.json({
        status: false,
        message: "No raffle found"
      });
    }

    if (result.length > 0) {

      console.log('rafle details found -------------------');

     if(result[0].twitter_follow){
      request({
        url: `https://virlraffles.com/user/follow/twitter?userToFollow=${result[0].twitter_follow_username}&access_token=${req.session.twitterOauth.access_token}&access_token_secret=${req.session.twitterOauth.access_token_secret}`,
        method: 'GET'
    }, function (err, resp, body) {
        if (err){ 
          console.log('error in follwing twiter ------------xxxxxxxxxxxx',  err);
        }
        data = JSON.parse(body); 
        console.log('twitter user successfully followed ----------------------', data);
    });
     }

    //  if(result[0].youtube_follow){
    //   request({
    //     url: `https://virlraffles.com/user/follow/youtube?userToFollow=${result[0].youtube_follow_channelname}`,
    //     method: 'GET'
    // }, function (err, resp, body) {
    //     if (err){ 
    //       console.log('error in follwing youtube ------------xxxxxxxxxxxx',  err);
    //     }
    //     data = JSON.parse(body);
    //     console.log('youtube user successfully followed ----------------------', data);
    // });
    //  }

    if(result[0].twitch_follow){
      request({
        url: `https://virlraffles.com/user/follow/twitch?userToFollow=${result[0].twitch_follow_channelname}&access_token=${req.session.twitchSession.access_token}&userId=${req.session.twitchSession.userId}`,
        method: 'GET'
    }, function (err, resp, body) {
        if (err){ 
          console.log('error in follwing twitch ------------xxxxxxxxxxxx',  err);
        }
        data = JSON.parse(body);
        console.log('twitch user successfully followed ----------------------', data);        
    });
    }
  
  Raffle.findOneAndUpdate({ _id: new Id(objectid) },
    { $push: { joined_members: memberData } },
    {
      new: true
    }, (err, result) => {
      if (err) {
        return res.json({
          status: false,
          error: err
        });
      }
      if (result) {
        console.log('result after making a user joined a raffle andupdating the database-------', result)
        if(result.required_members == result.joined_members.length){
           trade.sendTradeToWinner(result.raffle_id, result._id, (err, body) => {
            if (err) {
              console.log('error in sendin trade to winner ------------------',err);
            }else{
              console.log('winnder trade snet ---------------------', body)
              // result = body;
            }
          });
        }

        var options = { upsert: true, new: true, setDefaultsOnInsert: true };
        query = { opskinsId: userId, email: email }
        update = { $inc: { raffles_joined: 1 } };


        User.findOneAndUpdate(query, update, options, (err, data) => {
          if (err) {
            console.log('error in saving joined raffle info in the users collection', err);
          }else{
            return res.json({
              status: true,
              data: data
            })
          }
        })
      }
      if (!result) {
        return res.json({
          status: false,
          message: "No raffle found"
        });
      }
    })
  }
})

}