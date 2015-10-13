var express = require('express')

var app = express()
var server = app.listen(process.env.PORT || 5000)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/static'))
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')


app.get('/:channel', function(request, response) {
	var channel = request.params.channel
	logRequest(request)

	response.render('pages/index', {
		locals: {
			channel: channel
		}
	})
})

app.get('/', function(request, response) {
	logRequest(request)
	response.render('pages/index', {
		locals: {
			channel: 'index'
		}
	})
})

io.on('connection', function(socket){
	console.log('io connection')
	socket.on('msg-to-server', function(fullMsg){
  		console.log(fullMsg)
  		var ch = getChannel(fullMsg)
  		var msg = getMessage(fullMsg)
    	io.emit('msg-' + ch, msg)
  	})
})

app.listen(app.get('port'), function() {
  console.log('Node app is running.')
});


function logRequest(request) {
	if (request.url !== "/favicon.ico")
		console.log('GET Request: ' + request.url)
}

function getChannel(msg) {
	var match = /#(\S*)\s/g.exec(msg)
	return match[1]
}

function getMessage(msg) {
	var match = /#\S*\s(.*)/g.exec(msg)
	return match[1]
}