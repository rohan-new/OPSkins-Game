const fetch = require('../sockets/fetch'),
	  trade = require('../sockets/trade');

module.exports = (socket, user, clients) => {
	socket.on('loadBotInventory', fetch.loadBotInventory(socket, user));
	socket.on('loadUserInventory', fetch.loadUserInventory(socket, user));
	socket.on('sendTrade', trade.sendTrade(socket, user));
	// socket.on('decideWinner', trade.sendTradeToWinner(socket, user, clients));
};
 