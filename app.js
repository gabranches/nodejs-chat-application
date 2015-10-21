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

// Process a name change ajax request
app.post('/ajax/changename', function (request, response) {

    var client = request.body;

    // Check if name is taken
    if (chat.checkIfNameIsTaken(client.room, client.newname)) {
        chat.logEvent('Name taken');
        response.send({result: 'Fail'});
    } else {
        // Assign new name to session
        request.session.nick = client.newname;
        // Change user nick in roomList
        chat.changeName(client.room, client.nick, client.newname);

        chat.logEvent('Name available');
        response.send({result: 'Success'});
        chat.sendMessage('msg-to-room', 'server', 'Admin', client.room, '<span class="admin-name">' + 
                         client.nick + '</span> is now known as <span class="admin-name">' + 
                         client.newname + '</span>.')
    }

});

app.get('/:room', function (request, response) {
    var room = request.params.room.toLowerCase().split(' ').join('');
    var nick = request.session.nick ? request.session.nick : chat.getGuestNick(room);

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
    var room = request.body.room.toLowerCase().split(' ').join('');
    var nick = request.body.nick;
    if (nick === '') {
        nick = chat.getGuestNick(room);
    }
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