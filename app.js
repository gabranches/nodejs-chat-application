var express = require('express')
var app = express()
var server = app.listen(process.env.PORT || 5000)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

// Routes

app.get('/api/room', function(request, response) {
	response.json(rooms)
})

app.get('/api/sockets', function(request, response) {
	response.json(sockets)
})

app.get('/:room', function(request, response) {
	var room = request.params.room.toLowerCase()
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
	var userIP = socket.request.connection.remoteAddress
	logEvent('user ' + socket.id + ' (' + userIP + ') connected')

	// Receive info from client on connection, add user to room
	socket.on('user-connect', function(data) {
		this.join(data.room)
		sendMessage('recent-msgs', 'server', this.id, getRecentMessages(data.room))
		sendMessage('msg-to-room', 'admin', this.id, 'You have joined ' + data.room + '.')
		sendStatus(data.room)
	})

	// Receive incoming messages
	socket.on('msg-to-server', function(client) {
  		logEvent(client.socketID + ' ' + client.msg)
  		addToRecentMessages(client)
  		// Send message to room
  		sendMessage('msg-to-room', client.socketID, client.room, client.msg)
  	})

	// Send an update to the room with the room status
  	socket.on('update-request', function(data) {
  		sendStatus(data.room)
  	})

  	socket.on('disconnect', function() {
  		logEvent('user ' + socket.id + ' (' + userIP + ') disconnected')
  	})
})

// Functions

function addToRecentMessages(data) {
	var arr = io.sockets.adapter.rooms[data.room].recentMessages
	if (arr !== undefined) {
		if (arr.length === 10) {
			arr.splice(0, 1)
		}
		arr.push(data)
	} else {
		arr = [data]
	}
	io.sockets.adapter.rooms[data.room].recentMessages = arr
}

function getRecentMessages(room) {
	return io.sockets.adapter.rooms[room].recentMessages
}

// Returns an array of users in the specified room
function getUsers(room) {
	return Object.keys(io.sockets.adapter.rooms[room])
}

// Sends the current status to a room
function sendStatus(room) {
	var status = {
		users: getUsers(room).length
	}
	sendMessage('room-status', 'server', room, status)

}

function sendMessage(channel, sender, recipient, msg) {
	var data = {
		sender: sender,
		msg: msg
	}
	io.to(recipient).emit(channel, data)
}


function logEvent(msg) {
	var now = new Date()
	console.log('(' + now.toISOString() + ') ' + msg)
}

app.listen(app.get('port'), function() {
  logEvent('Node app is running.')
});