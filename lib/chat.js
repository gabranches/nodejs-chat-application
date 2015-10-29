module.exports = function (io, roomList) {

    var module = {};

    // Adds a user to a room. Creates room if it doesn't exist
    module.addToRoom = function(room, nick, socket, sessionID) {
        nick = nick.toLowerCase();
        if (!(room in roomList)) {
            // Initialize room object
            roomList[room] = {
                users: {}, 
                recentMessages: [], 
                typing: []
            };
        }
        roomList[room].users[sessionID] = {socket: socket, nick: nick}
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
        this.sendMessage('room-status', 'server', 'Admin', room, status);
    },

    module.logEvent = function (msg) {
        var now = new Date();
        console.log('(' + now.toISOString() + ') ' + msg);
    },


    module.checkIfNameIsTaken = function (room, newNick) {
        newNick = newNick.toLowerCase();
        var nameFound = false;
        if (!(room in roomList)) {
            return nameFound;
        }
        
        var usersArray = roomList[room].users;
        
        for (var key in usersArray) {
            if (usersArray[key].nick.toLowerCase() === newNick) {
                nameFound = true;
            }
        }
         
        return nameFound;
    }

    // Updates the user nick in roomList after a name change
    module.changeName = function (room, sessionID, oldname, newname) {
        roomList[room].users[sessionID].nick = newname;

        // Notify room
        this.sendMessage('msg-to-room', 'server', 'Admin', room,
                         '<span class="admin-name">' + oldname + 
                         '</span> is now known as <span class="admin-name">' + 
                         newname + '</span>.');
    }

    // Generates a guest username
    module.getGuestNick = function(room) {
        if (!(room in roomList)) {
            return 'Guest1'
        } else {
            var num = Object.keys(roomList[room].users).length + 1;
            return 'Guest' + num;
        }
    }

    module.sendTyping = function (room, status, nick) {
        io.to(room).emit('typing-to-client', {status: status, nick: nick});
    }

    return module
};