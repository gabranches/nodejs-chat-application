var express = require('express')
  , http = require('http');

var app = express();
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
	response.render('pages/index')
})

app.get('/:channel', function(request, response) {
	channel = request.param('channel')
	console.log('User connected to #' + channel)
	response.render('pages/index', {channel: channel})
})

io.on('connection', function(socket){
  socket.on('msg-to-server', function(fullMsg){
  	console.log(fullMsg)
  	var ch = getChannel(fullMsg)
  	var msg = getMessage(fullMsg)
    io.emit('msg-' + ch, msg)
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running.');
});


function getChannel(msg) {
	var match = /#(\S*)\s/g.exec(msg)
	return match[1]
}

function getMessage(msg) {
	var match = /#\S*\s(.*)/g.exec(msg)
	return match[1]
}