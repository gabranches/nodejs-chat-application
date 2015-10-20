module.exports = function (io, chat, roomList) {

    // Handles all socket.io requests
    io.on('connection', function (socket) {
        var userIP = socket.request.connection.remoteAddress;
        chat.logEvent('user ' + socket.id + ' (' + userIP + ') connected');

        // Receive info from client on connection, add user to room
        socket.on('user-connect', function (client) {
            // Add user to room (both the socket.io room and the roomList)
            socket.join(client.room);
            chat.addToRoom(client.room, client.nick, socket.id);
            chat.sendMessage('recent-msgs', 'server', socket.id, roomList[client.room].recentMessages);
            chat.sendMessage('msg-to-room', 'admin', client.room, client.nick +' has joined the room.');
            chat.sendStatus(client.room);
        });

        // Receive incoming messages
        socket.on('msg-to-server', function (client) {
            chat.logEvent(client.socketID + ' ' + client.msg);
            chat.addToRecentMessages(client, roomList);
            // Send message to room
            chat.sendMessage('msg-to-room', client.socketID, client.room, client.msg);
        });

        // Send an update to the room with the room status
        socket.on('update-request', function (data) {
            chat.sendStatus(data.room);
        });

        socket.on('disconnect', function () {
            chat.logEvent('user ' + socket.id + ' (' + userIP + ') disconnected');
        });
    });
}