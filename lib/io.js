module.exports = function (io, chat, roomList, socketList) {

    // Handles all socket.io requests
    io.on('connection', function (socket) {
        var userIP = socket.request.connection.remoteAddress;
        chat.logEvent('user ' + socket.id + ' (' + userIP + ') connected');
        // Receive info from client on connection, add user to room
        socket.on('user-connect', function (client) {
            // Add user to room (both the socket.io room and the roomList)
            socket.join(client.room);
            chat.logEvent(client.nick + ' joined ' + client.room);
            chat.addToRoom(client.room, client.nick, socket.id, client.sessionID);
            // Send recent messages
            chat.sendMessage('recent-msgs', 'server', 'Admin', socket.id,
                             roomList[client.room].recentMessages);
            // Send "joined room" message
            chat.sendMessage('msg-to-room', 'server', 'Admin', client.room,
                             '<span class="admin-name">' + client.nick +'</span> has joined the room.');
            chat.sendStatus(client.room);

            // Add to socketList
            socketList[socket.id] = client.room;
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

        // Receive typing status
        socket.on('typing-to-server', function (client) {
            chat.sendTyping(client.room, client.status, client.nick)
        });
        

        socket.on('disconnect', function () {
            var room = socketList[socket.id]
            chat.logEvent('user ' + socket.id + ' (' + userIP + ') disconnected');
            chat.userDisconnect(socket.id, room);
            chat.sendStatus(room)
            delete socketList[socket.id];
        });
    });
}