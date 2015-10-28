
//-- Socket IO module --//

var socket = io();

var socketHelper = (function () {
    'use strict';
    var me = {};

    //-- Functions --//

    // Helper function to emit messages from outside the module
    me.emit = function (channel, data) {
        socket.emit(channel, data);
    }

    //-- Connection Event --//

    // Send client info to server
    socket.on('connect', function () { 
        chat.client.socketID = socket.io.engine.id;
        socket.emit('user-connect', chat.client);
        $("#status-nick").html(chat.client.nick);
    });

    //-- Incoming Events --//

    // Receive message from server
    socket.on('msg-to-room', function (data){
        if (data.socketID !== chat.client.socketID) {
            chat.printMessage(data);
            chat.flashTitle(chat.client.room);
        }
    });

    // Receive room status info 
    socket.on('room-status', function(data){
        $('#active-users').html('<span class="glyphicon glyphicon-user"></span> ' + data.msg.users);
    });

    // Receive client typing behavior
    socket.on('typing-to-client', function (data) {
        if (data.status === 1) {
            // Push user to typing array if not already in
            if (chat.state.typingList.indexOf(data.nick) === -1 && data.nick !== chat.client.nick) {
                chat.state.typingList.push(data.nick);
            }
        } else {
            // Remove user from typing array
            if (data.nick !== chat.client.nick) {
                var index = chat.state.typingList.indexOf(data.nick);
                chat.state.typingList.splice(index, 1);
            }
        }
        chat.updateTypingStatus();
    });

    // Receive recent messages
    socket.on('recent-msgs', function(msgArray){
        console.log('Received recent messages.');
        if (msgArray.msg !== undefined) {
            msgArray.msg.forEach(function (data){
                chat.printMessage(data);
            });
        }
    });

    return me;

}());