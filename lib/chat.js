module.exports = function (io) {

    var module = {};

    module.addToRecentMessages =  function (data, recentMessages) {
        var arr = recentMessages[data.room];
        if (arr !== undefined) {
            if (arr.length >= 20) {
                arr.splice(0, 1);
            }
            arr.push(data);
        } else {
            arr = [data];
        }
        recentMessages[data.room] = arr;
    },

    // Returns an array of users in the specified room
    module.getUsers = function (room) {
        return Object.keys(io.sockets.adapter.rooms[room]);
    },

    module.sendMessage = function (channel, sender, recipient, msg) {
        var data = {
            sender: sender,
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
    }

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