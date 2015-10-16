module.exports = function (io, chat, recentMessages) {

    // Handles all socket.io requests
    io.on('connection', function (socket) {
        var userIP = socket.request.connection.remoteAddress;
        chat.logEvent('user ' + socket.id + ' (' + userIP + ') connected');

        // Receive info from client on connection, add user to room
        socket.on('user-connect', function (data) {
            socket.join(data.room);
            chat.sendMessage('recent-msgs', 'server', socket.id, recentMessages[data.room]);
            chat.sendMessage('msg-to-room', 'admin', socket.id, 'You have joined ' + data.room + '.');
            chat.sendStatus(data.room);
        });

        // Receive incoming messages
        socket.on('msg-to-server', function (client) {
            chat.logEvent(client.socketID + ' ' + client.msg);
            chat.addToRecentMessages(client, recentMessages);
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