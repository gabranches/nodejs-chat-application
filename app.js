"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var RedisStore = require('connect-redis')(session);
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);
var chat = require('./lib/chat.js')(io);
var session = require('express-session');


app.use(session({
    secret: "cookie_secret",
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var recentMessages = [];

// Routes

app.get('/api/room/:room?', function (request, response) {
    if (request.params.room){
        var room = request.params.room.toLowerCase();
        response.json(io.sockets.adapter.rooms[room]);
    } else {
        response.json(chat.findRooms());
    }
});

app.get('/api/sessions', function (request, response) {
    response.json(session);
});

app.get('/:room', function (request, response) {
    var room = request.params.room.toLowerCase();
    var nick = session.nick ? session.nick : '';
   
    // Render room page
    response.render('pages/chatroom', {
        locals: {
            room: room,
            title: room,
            nick: nick
        }
    });
});

app.post('/:room', function (request, response) {
    var room = request.body.room;
    var nick = request.body.nick;
    session.nick = nick;
    // Render room page
    response.render('pages/chatroom', {
        locals: {
            room: room,
            nick: nick,
            title: room,
            sessionID: request.session.sessionID
        }
    });
});

app.get('/', function (request, response) {
    response.render('pages/index', {
        locals: {
            room: 'index',
            title: 'Chat App'
        }
    });
});

app.listen(app.get('port'), function () {
    chat.logEvent('Node app is running.');
});


require('./lib/io.js')(io, chat, recentMessages, session)