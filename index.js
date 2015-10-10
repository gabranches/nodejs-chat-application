var express = require('express')
  , http = require('http');

var app = express();
var server = app.listen(process.env.PORT || 5000);
var io = require('socket.io').listen(server);


app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/index')
})


io.on('connection', function(socket){
  socket.on('chat-message', function(msg){
    io.emit('chat-message', msg)
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running.');
});