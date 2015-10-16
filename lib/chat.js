module.exports = function (io) {

    var module = {};

    module.addToRecentMessages =  function (data) {
        var arr = io.sockets.adapter.rooms[data.room].recentMessages;
        if (arr !== undefined) {
            if (arr.length === 10) {
                arr.splice(0, 1);
            }
            arr.push(data);
        } else {
            arr = [data];
        }
        io.sockets.adapter.rooms[data.room].recentMessages = arr;
    },

    module.getRecentMessages = function (room) {
        return io.sockets.adapter.rooms[room].recentMessages;
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

    return module
};