var express = require('express')
var app = express()
var server = app.listen(process.env.PORT || 5000)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/static'))
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

rooms = []

app.get('/api/rooms', function(request, response) {
	response.send(JSON.stringify(rooms))
})

app.get('/:room', function(request, response) {
	var room = request.params.room
	// Render room page
	response.render('pages/index', {
		locals: {
			room: room
		}
	})
})


io.on('connection', function(socket){

	// Receive info from client on document ready
	socket.on('info', function(data) {
		var id = socket.io.engine.id
		console.log("User joined " + data.room)
	})

	// Receive incoming messages
	socket.on('msg-to-server', function(fullMsg) {
  		console.log(fullMsg)
  		var room = getroom(fullMsg)
  		var msg = getMessage(fullMsg)
  		// Send message to room
    	socket.emit('msg-to-room:' + room, msg)
  	})
})

app.get('/', function(request, response) {
	response.render('pages/index', {
		locals: {
			room: 'index'
		}
	})
})


app.listen(app.get('port'), function() {
  console.log('Node app is running.')
});



function setRoom(room) {
	var match = /\.ico/g.exec(room)
	if (!match) {
		console.log('User has joined ' + room)
		rooms.push(room)
		return room
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