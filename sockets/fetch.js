const bot = require('../trade/bot');

module.exports = {
 
  loadBotInventory: function(socket, user) {
    return function() {

      bot.getBotInventory((err, items) => {
        if (err)
          return console.error(err);
        // If there's no error, update the inventory array:
        App.inventory = items;
        socket.emit('botInvLoaded', {
          botInventory: App.inventory
        });
      });
    }
  },
  
  loadUserInventory: function(socket, user) {
    console.log('rrr')
    return function() {
      if (!user) {
      console.log('not user');
        return socket.emit('userInvLoaded', {
          userInventory: []
        }); 
      }
      if (!user.id64){
      return socket.emit('alert', `Please use an account with a SteamID linked to trade!`, 'error');
      }
      
      bot.getUserInventory(user.id64, (err, result) => {
        if (err) {
          console.error(err);
          return socket.emit('alert', `An error occurred fetching your inventory, please try again`, 'error');
        }

        // Send the inventory contents to the client
      return socket.emit('userInvLoaded', {
          userInventory: result.inventory
        });
      });
    }
  }

};