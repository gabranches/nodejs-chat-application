function printMessage(data) {
    // Print message to chat box
    if (data.sender === client.socketID) {
        // If own message
        $('#chatbox').append($('<div class="own message"><span class="author">Anonymous</span>: ' + data.msg + '</div>'));
    } else if (data.sender === 'admin') {
        // If admin message
        $('#chatbox').append($('<div class="message"><span class="admin">' + data.msg + '</span></div>'));
    } else {
        // Regular message
        $('#chatbox').append($('<div class="message"><span class="author">Anonymous</span>: ' + data.msg + '</div>'));
    }
    $("#chatbox").prop({ scrollTop: $("#chatbox").prop("scrollHeight") });
}

function flashTitle(title) {
  // Makes page title flash on tap if it is out of focus
  if (document.hasFocus()){
    document.title = title;
    clearInterval(timer);
    timerOn = false;
  } else {
    if (timerOn === false) {
      timer = setInterval(function(){ 
        document.title = document.title == title ? 'New Message!' : title;
      }, 1000);
      timerOn = true;
    }
  }
}

function resize() {
    // Resize chat window to fit screen properly
    var height = $(window).height();
    $('#chatbox').css('height', height - 130 + 'px');
}

$(window).focus(function () {
    flashTitle(client.room);
    clearInterval(timer);
    timerOn = false;
});

$(document).on('focus', function () {
    flashTitle(client.room);
    clearInterval(timer);
    timerOn = false;
});

$(window).resize(function() {
    resize();
});

window.setInterval( function () {
    // Update room info every 10 seconds
    if (client) {
        socket.emit('update-request', client);
        console.log('Sent update request.');
    }
}, 10000);