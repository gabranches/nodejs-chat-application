// Send an AJAX request with the name change
function changeName() {
  $.ajax({
      url: 'ajax/changename',
      type: 'POST',
      dataType: 'json',
      data: {
        nick: client.nick,
        newname: client.newname,
        room: client.room,
        socketID: client.socketID
      },
    }).done(function(data) {
        // AJAX request succeeded
        $('#change-name-loader').hide();
        if(data.result === 'Success') {
          // Name change successful
          client.nick = client.newname;
          $('#change-name-form').hide();
          $('#status-nick').text(client.nick);
          $('#status-nick').show();
          $('.glyphicon-pencil').show();
          $('#change-name-form div:first-child').attr('class', 'form-group has-feedback');
          $("#change-name-error").hide();
        } else {
          // Name change fail (name already taken)
          $('#change-name-form div:first-child').attr('class', 'form-group has-error has-feedback');
          $("#change-name-input").val('');
          $("#change-name-input").attr('placeholder', 'Name already taken.');
          $("#change-name-error").show();
        }
    }).fail(function() {
        alert('The request failed. Please try again.');
    });
}

function submitForm() {
    var form = $("#front-page-form");
    form.attr("action", "/" + $("#room").val().toLowerCase().split(' ').join(''));
    form.submit();
}

function printMessage(data) {
    // Print message to chat box
    if (data.socketID === client.socketID) {
        // If own message
        $('#chatbox').append($('<div class="own message"><span class="author">' + data.nick + '</span>: ' + data.msg + '</div>'));
    } else if (data.nick === 'Admin') {
        // If admin message
        $('#chatbox').append($('<div class="message"><span class="admin">' + data.msg + '</span></div>'));
    } else {
        // Regular message
        $('#chatbox').append($('<div class="message"><span class="author">' + data.nick + '</span>: ' + data.msg + '</div>'));
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

