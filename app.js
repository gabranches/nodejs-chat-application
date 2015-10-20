// Globals

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);
var roomList = {};
var chat = require('./lib/chat.js')(io, roomList);

// Session variables

var expressSession = require('express-session');
var session = expressSession({
    secret: "cookie_secret",
    cookie: { maxAge: (60000 * 24 * 30)},
    resave: true,
    saveUninitialized: true
});

app.use(session);


// App Config

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Routes

app.get('/api/room/:room?', function (request, response) {
    if (request.params.room){
        var room = request.params.room.toLowerCase();
        response.json(roomList[room]);
    } else {
        response.json(roomList);
    }
});

app.get('/api/sessions', function (request, response) {
    response.json(request.session);
});

app.post('/ajax/changename', function (request, response) {
    var nick = request.body.nick;
    request.session.nick = nick;

    response.send({result: 'Name changed successfully.'});
    response.send({result: 'This name is already taken. Please choose another name.'});

});

app.get('/:room', function (request, response) {
    var room = request.params.room.toLowerCase();
    var nick = request.session.nick ? request.session.nick : '';
    debugger;
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
    request.session.nick = nick;
    // Render room page
    response.render('pages/chatroom', {
        locals: {
            room: room,
            nick: nick,
            title: room
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


require('./lib/io.js')(io, chat, roomList)