module.exports = function (io, chat, roomList) {

    // Handles all socket.io requests
    io.on('connection', function (socket) {
        var userIP = socket.request.connection.remoteAddress;
        chat.logEvent('user ' + socket.id + ' (' + userIP + ') connected');

        // Receive info from client on connection, add user to room
        socket.on('user-connect', function (client) {
            // Add user to room (both the socket.io room and the roomList)
            socket.join(client.room);
            chat.logEvent(client.nick + ' joined ' + client.room);
            chat.addToRoom(client.room, client.nick, socket.id);
            // Send recent messages
            chat.sendMessage('recent-msgs', 'server', 'Admin', socket.id, roomList[client.room].recentMessages);
            chat.sendMessage('msg-to-room', 'server', 'Admin', client.room, client.nick +' has joined the room.');
            chat.sendStatus(client.room);
        });

        // Receive incoming messages
        socket.on('msg-to-server', function (client) {
            chat.logEvent(client.nick + ' ' + client.msg);
            chat.addToRecentMessages(client, roomList);
            // Send message to room
            chat.sendMessage('msg-to-room', client.socketID, client.nick, client.room, client.msg);
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