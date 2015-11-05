
//-- Chat room front-end module --//

var chat = (function () {
    'use strict';
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
    var elems = {
        nickDisplay:    $('#status-nick'),
        chgNameInput:   $('#change-name-input'),
        chgNameLoader:  $('#change-name-loader'),
        chgNameFormDiv: $('#change-name-form div:first-child'),
        chgNameModal:   $('#change-name-modal'),
        chgNameError:   $('#change-name-error'),
        chatBox:        $('#chatbox'),
        messageBox:     $('#message'),
        typingStatus:   $('#typing-users'),
        chgNameButton:  $('#change-name'),
        chgNameForm:    $('#change-name-form'),
        msgForm:        $('#msg-form'), 
        shareModal:     $('#share-modal'),
        shareButton:    $('#share-button'),
        shareLinkInput: $('#share-link-input'),
        userListModal:  $('#user-list-modal'),
        userList:       $('#active-user-list'),
        userButton:     $('#user-button')
    };

    //-- Functions -- //

    // Send an AJAX request with the name change
    me.changeName = function () {

        // Check for name length
        if (this.client.newname.length > 24) {
          me.toggleChangeNameForm('error', 'Name is too long');
        } else {
            elems.chgNameLoader.show();
            $.ajax({
                url: 'ajax/changename',
                type: 'POST',
                dataType: 'json',
                data: {
                    nick: this.client.nick,
                    newname: this.client.newname,
                    room: this.client.room,
                    socketID: this.client.socketID
                }
            }).done(function(data) {
                // AJAX request successful
                elems.chgNameLoader.hide();

                if (data.result === 'Success') {
                    // Name change successful
                    me.client.nick = me.client.newname;
                    elems.nickDisplay.text(me.client.nick);
                    elems.chgNameModal.modal('hide');
                    me.toggleChangeNameForm('off');
                } else {
                    // Name change fail (name already taken)
                    me.toggleChangeNameForm('error', 'Name already taken.');
                }
            }).fail(function() {
                alert('The request failed. Please try again.');
            });
        }
    }

    // Handles error effects in the change name input field
    me.toggleChangeNameForm = function (state, text) {
        if (state === "off") {
            elems.chgNameFormDiv.attr('class', 'form-group has-feedback');
            elems.chgNameError.hide();
        } else if (state === "error") {
            elems.chgNameFormDiv.attr('class', 'form-group has-error has-feedback');
            elems.chgNameInput.val('');
            elems.chgNameInput.attr('placeholder', text);
            elems.chgNameError.show();
            elems.chgNameInput.focus();
        } else {
            elems.chgNameInput.focus();
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
        elems.typingStatus.text(typingText);
    }

    // Append a message to chat window
    me.printMessage = function (data) {
        data.msg = this.formatLinks(data.msg);
        // Print message to chat box
        if (data.socketID === this.client.socketID) {
            // If own message
            elems.chatBox.append($('<div class="own message"><span class="author">' + data.nick + '</span>: ' + data.msg + '</div>'));
        } else if (data.nick === 'Admin') {
            // If admin message
            elems.chatBox.append($('<div class="message"><span class="admin">' + data.msg + '</span></div>'));
            socketHelper.emit('update-request', me.client);
        } else {
            // Regular message
            elems.chatBox.append($('<div class="message"><span class="author">' + data.nick + '</span>: ' + data.msg + '</div>'));
        }
        elems.chatBox.prop({ scrollTop: elems.chatBox.prop("scrollHeight") });
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
        elems.chatBox.css('height', height - 130 + 'px');
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

    // Edit name modal
    elems.chgNameButton.click(function() {
        elems.chgNameModal.modal();
    });

    // Share modal
    elems.shareButton.click(function() {
        elems.shareModal.modal();
        elems.shareLinkInput.val(chat.client.room);
    });

    // Select all on focus (share-link)
    elems.shareLinkInput.focus(function(){
        elems.shareLinkInput.select();
    });

    // User list modal
    elems.userButton.click(function() {
        elems.userListModal.modal();
    });

    // Send the client's typing behavior
    elems.messageBox.keyup(function() {
        if ($(this).val() === '') {
            me.stopTyping();
        } else {
            if (chat.state.typingList.indexOf(chat.client.nick) === -1) {
                socketHelper.emit('typing-to-server', {room: chat.client.room, status: 1, nick: chat.client.nick});
            }
        }
    });

    // Send changed name to server
    elems.chgNameForm.submit(function(){
        var newname = elems.chgNameInput.val().trim();
        if (newname !== '') {
            me.stopTyping();
            chat.client.newname = newname;
            chat.changeName();
        }
        return false;
    });

    // Send message to server
    elems.msgForm.submit(function(){
        chat.client.msg = elems.messageBox.val();
        if (chat.client.msg.trim() != '') {
            socketHelper.emit('msg-to-server', chat.client);
            chat.printMessage({
                socketID: chat.client.socketID,
                msg: chat.client.msg,
                nick: chat.client.nick
            });
        }
        elems.messageBox.val('');
        me.stopTyping();
        return false;
    });

    return me;

}());