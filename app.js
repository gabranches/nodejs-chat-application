var express = require('express')
var app = express()
var server = app.listen(process.env.PORT || 5000)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')


var sockets = {}
var rooms = {}

// Routes

app.get('/api/rooms', function(request, response) {
	response.json(rooms)
})

app.get('/api/sockets', function(request, response) {
	response.json(sockets)
})

app.get('/:room', function(request, response) {
	var room = request.params.room
	// Render room page
	response.render('pages/chatroom', {
		locals: {
			room: room,
			title: room
		}
	})
})

app.get('/', function(request, response) {
	response.render('pages/index', {
		locals: {
			room: 'index',
			title: 'Chat App'
		}
	})
})

// IO

io.on('connection', function(socket){
	var sock = socket.id
	var userIP = socket.request.connection.remoteAddress
	log('user ' + sock + ' (' + userIP + ') connected')

	// Receive info from client on connection
	socket.on('info', function(data) {
		addUser(data.room, sock)
		socket.emit('room-status:' + data.room, rooms[data.room])
	})

	// Receive incoming messages
	socket.on('msg-to-server', function(fullMsg) {
  		log(sock + ' ' + fullMsg)
  		var data;
        var room = getroom(fullMsg)
  		var msg = getMessage(fullMsg)
  		// Send message to room
    	io.emit('msg-to-room:' + room, [socket.id, msg])
    	
  	})

	// Send an update to the room with the room status
  	socket.on('update-request', function() {
  		socket.emit('room-status:' + data.room, rooms[data.room])
  	})

  	socket.on('disconnect', function() {
  		log('user ' + sock + ' (' + userIP + ') disconnected')
  		// Remove user from room
  		removeUser(sock)
  	})
})

// Functions

function addUser(room, sock) {
	// Adds user to sockets array
	sockets[sock] = room
	// Adds user to a room
	log('user ' + sock + ' joined #' + room)
	if (room in rooms) {
		rooms[room].users.push(sock)
	} else {
		// Create room if it doesn't exist
		rooms[room] = ({users: [sock]})
	}
}

function removeUser(sock) {
	// Remove user from socket array and get room
	var room = sockets[sock]
	delete sockets[sock]
	// Remove user from rooms
	if (room in rooms) {
		var index = rooms[room].users.indexOf(sock)
		if (index > -1) {
			rooms[room].users.splice(index, 1)
		}
	}
}

function getroom(msg) {
	var match = /#(\S*)\s/g.exec(msg)
	return match[1]
}

function getMessage(msg) {
	var match = /#\S*\s(.*)/g.exec(msg)
	return match[1]
}

function log(msg) {
	var now = new Date()
	console.log('(' + now.toISOString() + ') ' + msg)
}

app.listen(app.get('port'), function() {
  log('Node app is running.')
});