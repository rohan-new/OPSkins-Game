const express = require('express');
var socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
var OPSkinsAPI = require('@opskins/api');
var cors = require('cors')
const mongoose = require('mongoose');
const request = require('request');
const { google } = require('googleapis');
var sharedsession = require("express-socket.io-session");
var ObjectId = mongoose.Types.ObjectId();

var session = require("express-session")({
  secret: 'messi123',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 10000000000000, secure: false,
    httpOnly: false
  }
});

const handler = require('./sockets/handler');

const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);

var io = socketIo(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session);
io.use(sharedsession(session));
app.use(express.static(path.join(__dirname, "client/build")))



// Cross Site Validation
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));


let packages = {
  app,
  request,
  express,
  ObjectId
}
// DB Config
const db_url = require('./configuration/mongo-config').mongoURI;

// DB Connect
mongoose.connect(db_url, {
  useNewUrlParser: true
}, (err) => {
  if (err) throw err;
  console.log('DB Connected');
});


require('./routes')(packages);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  console.log('dude data socket session', socket.handshake.session);	
  io.clients((error, clients) => {
    if (error) throw error;
    console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
    var user;
    user = socket.handshake.session.userDetails;

    socket.on("disconnect", () => console.log("Client disconnected"));

    handler(socket, user, clients);
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

server.listen(port, () => {
  console.log(`server started on port no ${port}`);
});
