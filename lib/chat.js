module.exports = function (io, roomList) {

    var module = {};

    // Adds a user to a room. Creates room if it doesn't exist
    module.addToRoom = function(room, nick, socket) {
        if (!(room in roomList)) {
            roomList[room] = {users: {}, recentMessages: []};

        }
        roomList[room].users[nick] = {socket: socket}
    }

    // Add a message a room's recent messages
    module.addToRecentMessages =  function (data, roomList) {
        var room = data.room;
        data = {nick: data.nick, msg: data.msg};
        var arr = roomList[room].recentMessages;
        if (arr !== undefined) {
            if (arr.length >= 50) {
                arr.splice(0, 1);
            }
            arr.push(data);
        } else {
            arr = [data];
        }
        roomList[room].recentMessages = arr;
    },

    // Returns an array of users in the specified room
    module.getUsers = function (room) {
        return Object.keys(io.sockets.adapter.rooms[room]);
    },

    module.sendMessage = function (channel, socketID, nick, recipient, msg) {
        var data = {
            socketID: socketID,
            nick: nick,
            msg: msg
        };
        io.to(recipient).emit(channel, data);
    },

    // Sends the current status to a room
    module.sendStatus = function (room) {
        var status = {
            users: this.getUsers(room).length
        };
        this.sendMessage('room-status', 'server', room, status);
    },

    module.logEvent = function (msg) {
        var now = new Date();
        console.log('(' + now.toISOString() + ') ' + msg);
    },

    module.findRooms = function () {
        var availableRooms = [];
        var rooms = io.sockets.adapter.rooms;
        if (rooms) {
            for (var room in rooms) {
                if (!rooms[room].hasOwnProperty(room)) {
                    availableRooms.push({
                        room: room,
                        users: Object.keys(rooms[room])
                    });
                }
            }
        }
        return availableRooms;
    }

    return module
};