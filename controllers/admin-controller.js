var bcrypt = require('bcryptjs');
const User = require('../models/user');
const Raffle = require('../models/raffle');
const Admin = require('../models/admin');


const saltRounds = 10;

module.exports.registerAdmin = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    if(err) return res.json({
      status: false,
      error: err
    })
    const admin = new Admin({
      username: username,
      password: hash,
      role: 'Admin'
    });
    
    admin
    .save()
    .then((admin) =>{return res.json(admin)})
    .catch(err => console.log(err));
  });

}


module.exports.loginAdmin = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  Admin.findOne({
    username
}).then(admin => {
    if (!admin) {
        errors.username = "Username not found";
        return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, admin.password).then(isMatch => {
        if (isMatch) {
          return res.json({
            status: true,
            data: admin.name
          })
            
        } else {
            var errors = {};
            errors.password = 'Password incorrect';
            return res.status(400).json(errors);
        }
    });
});

}

module.exports.getTopWinnersList = (req, res)=>{
  User.find({},null, {sort: { raffles_won : -1 }}, (err, result)=>{
    if(err){
      console.log('error in fetching users list', err);
    }
    if(result.length>0){
      return res.json({
        status: true,
        data: result
      })
    }
    if(!result || result.length == 0){
      console.log('No users have registered');
    }
  })
}

//Top Raffles creators
module.exports.getTopRafflesCreatorList = (req, res)=>{
  User.find({},null, {sort: { raffles_created : -1 }}, (err, result)=>{
    if(err){
      console.log('error in fetching users list', err);
    }
    if(result.length>0){
      return res.json({
        status: true,
        data: result
      })
    }
    if(!result || result.length == 0){
      console.log('No users have registered');
    }
  })
}



module.exports.getUsersList = (req, res)=>{
  User.find({},(err, result)=>{
    if(err){
      console.log('error in fetching users list', err);
    }
    if(result.length>0){
      return res.json({
        status: true,
        data: result
      })
    }
    if(!result || result.length == 0){
      console.log('No users have registered');
    }
  })
}



module.exports.totalRafflesCreated = (req, res)=>{
  Raffle.find({},(err, result)=>{
    if(err){
      console.log('error in fetching raffles list', err);
    }
    if(result.length>0){
      return res.json({
        status: true,
        data: result
      })
    }
    if(!result || result.length == 0){
      console.log('No raffls have been created');
    }
  })
}



// Total Raffle Wins In a Day 
module.exports.topRafflesWins = async (req, res) => {

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
        message: "No Raffles Completed"
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


// Total Raffle cREATED In a Day 
module.exports.RafflesInADay = async (req, res) => {

  Raffle.find({
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
        message: "No Raffles Created in the last 24 hrs"
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

// Total Active Raffle  In a Day 
module.exports.activeRafflesInADay = async (req, res) => {

  Raffle.find({
    active: true,
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
        message: "No Raffles Created in the last 24 hrs"
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





// Total Raffle Wins 
module.exports.totalRafflesWins = async (req, res) => {

  Raffle.find({
    active: false,
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
        message: "No Raffles Completed"
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




module.exports.getActiveRafflesList = async (req, res) => {

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
