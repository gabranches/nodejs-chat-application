
//-- Chat room module --//

var chat = (function() {
    var me = {};

    // Client vars
    me.client = {
        nick: nodeVars.nick,
        room: nodeVars.room,
        sessionID: nodeVars.sessionID
    };

    // Chat room state
    me.state = {
        timerOn: false,
        recentMessages: [],
        typingList: [],
        timer: null
    };

    // Chat DOM elements
    me.elems = {
        nickDisplay: $("#status-nick"),
        chgNameInput: $("#change-name-input"),
        chgNameLoader: $('#change-name-loader'),
        chgNameFormDiv: $('#change-name-form div:first-child')
    }

    //-- Functions -- //

    // Send an AJAX request with the name change
    me.changeName = function () {
      $.ajax({
          url: 'ajax/changename',
          type: 'POST',
          dataType: 'json',
          data: {
            nick: this.client.nick,
            newname: this.client.newname,
            room: this.client.room,
            socketID: this.client.socketID
          },
        }).done(function(data) {
            // AJAX request successful
            me.elems.chgNameLoader.hide();
            
            if(data.result === 'Success') {
              // Name change successful
              me.client.nick = me.client.newname;
              me.elems.nickDisplay.text(me.client.nick);
              $("#change-name-modal").modal('hide');
              me.toggleChangeNameForm("off");
            } else {
              // Name change fail (name already taken)
              me.toggleChangeNameForm("error");
            }
        }).fail(function() {
            alert('The request failed. Please try again.');
        });
    }

    // Handles error effects in the change name input field
    me.toggleChangeNameForm = function (state) {
      if (state === "off") {
        this.elems.chgNameFormDiv.attr('class', 'form-group has-feedback');
        $("#change-name-error").hide();
      } else if (state === "error") {
        this.elems.chgNameFormDiv.attr('class', 'form-group has-error has-feedback');
        this.elems.chgNameInput.val('');
        this.elems.chgNameInput.attr('placeholder', 'Name already taken.');
        $("#change-name-error").show();
        this.elems.chgNameInput.focus();
      } else {
        this.elems.chgNameInput.focus();
      }
    }

    // Apend typing users to status bar
    me.updateTypingStatus = function () {
      var typingText = '';
      if (this.state.typingList.length == 1) {
        typingText = this.state.typingList[0] + ' is typing...';
      } else if (this.state.typingList.length > 1)  {
        typingText = (this.state.typingList.length) + ' users are typing...';
      }
      $("#typing-users").text(typingText);
    }

    

    me.printMessage = function (data) {
        data.msg = this.formatLinks(data.msg);
        // Print message to chat box
        if (data.socketID === this.client.socketID) {
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

    // Makes page title flash on tap if it is out of focus
    me.flashTitle = function (title) {
      if (document.hasFocus()){
        document.title = title;
        clearInterval(this.state.timer);
        this.state.timerOn = false;
      } else {
        if (this.state.timerOn === false) {
          this.state.timer = setInterval(function(){ 
            document.title = document.title == title ? 'New Message!' : title;
          }, 1000);
          this.state.timerOn = true;
        }
      }
    }

    // Resize chat window to fit screen properly
    me.resize = function () {
        var height = $(window).height();
        $('#chatbox').css('height', height - 130 + 'px');
    }

    // Send a message to server saying that the user stopped typing
    me.stopTyping = function () {
      socketHelper.emit('typing-to-server', {room: chat.client.room, status: 0, nick: chat.client.nick});
    }

    // Format hyperlinks
    me.formatLinks = function (text) {
      var regex = /((http:\/\/|https:\/\/|www\.)\S*)\s*/gi;
      var matches = text.match(regex);

      if (matches) {
        console.log('hit loop');
        matches.forEach(function (link) {
          // Remove whitespace
          link = link.trim();
          
          // Add http to www. links
          var www_match = link.match(/^www.*/gi);
          if (www_match) {
            text = text.replace(link, 'http://' + link);
            link = 'http://' + link;
          }

          // Add links to text 
          text = text.replace(link, '<a target="_blank" href="'+link+'">'+link+'</a>')
        });
      }
      return text;
    }

    //--- Event Listeners ---//

    // Resize Window
    $(window).resize(function() {
        me.resize();
    });

    // Update room info every 10 seconds
    window.setInterval( function () {
        if (me.client) {
            socketHelper.emit('update-request', me.client);
        }
    }, 10000);

    // New message flash notification (window)
    $(window).focus(function () {
        me.flashTitle(me.client.room);
        clearInterval(me.state.timer);
        me.state.timerOn = false;
    });

    // New message flash notification (document)
    $(document).on('focus', function () {
        flashTitle(me.client.room);
        clearInterval(me.state.timer);
        me.state.timerOn = false;
    });

    // Edit name
    $("#change-name").click(function() {
        // toggleChangNameForm("on");
        $('#change-name-modal').modal()
    });

    // Send the client's typing behavior
    $("#message").keyup(function() {
        if ($(this).val() === '') {
            me.stopTyping();
        } else {
            if (chat.state.typingList.indexOf(chat.client.nick) === -1) {
                socketHelper.emit('typing-to-server', {room: chat.client.room, status: 1, nick: chat.client.nick});
            }
        }
    });

    // Send changed name to server
    $('#change-name-form').submit(function(){
        var newname = me.elems.chgNameInput.val().trim();
        if (newname !== '' && newname.length < 30) {
            me.stopTyping();
            me.elems.chgNameLoader.show();
            chat.client.newname = newname;
            chat.changeName();
        }
        return false;
    });

    // Send message to server
    $('#msg-form').submit(function(){
        chat.client.msg = $('#message').val();
        socketHelper.emit('msg-to-server', chat.client);
        chat.printMessage({
            socketID: chat.client.socketID,
            msg: chat.client.msg,
            nick: chat.client.nick
        });
        $('#message').val('');
        me.stopTyping();
        return false;
    });

    return me;

}());