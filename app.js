"use strict";
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);
var chat = require('./lib/chat.js')(io);

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Routes

app.get('/api/room/:room?', function (request, response) {
    if (request.params.room){
        var room = request.params.room.toLowerCase();
        response.json(io.sockets.adapter.rooms[room]);
    } else {
        response.json(chat.findRooms());
    }
});

// app.get('/api/sockets', function (request, response) {
//     response.json(sockets)
// })

app.get('/:room', function (request, response) {
    var room = request.params.room.toLowerCase();
    // Render room page
    response.render('pages/chatroom', {
        locals: {
            room: room,
            title: room
        }
    });
});

app.get('/', function (response) {
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


require('./lib/io.js')(io, chat)