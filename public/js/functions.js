// Submits the front page form
function submitForm() {
  
  var name = $("#nick").val();

  // Check for name length
  if (name.length > 24) {
    frontPageFormError("length");
  } else {
    $.ajax({
        url: 'ajax/namecheck',
        type: 'POST',
        dataType: 'json',
        data: {
          nick: name.trim(),
          room: $("#room").val().toLowerCase().split(' ').join('')
        },
      }).done(function(data) {
          // AJAX request succeeded
          $('#change-name-loader').hide();
          if(data.result === 'Success') {
            // Name change successful
            var form = $("#front-page-form");
            form.attr("action", "/" + $("#room").val().toLowerCase().split(' ').join(''));
            form.submit();
          } else {
            frontPageFormError("taken")
          }
      }).fail(function() {
          alert('The request failed. Please try again.');
      });
  }

}

function frontPageFormError(type) {
  if (type === "length") {
    $("#nick").attr('placeholder', 'Your name is too long');
  } else {
    $("#nick").attr('placeholder', 'Name already taken.');
  }
  $('#name-group').attr('class', 'form-group has-error has-feedback');
  $("#nick").val('');
  $("#name-error").show();
}