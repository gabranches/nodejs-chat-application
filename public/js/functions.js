// Submits the front page form
function submitForm() {
  // First check if name is already taken
  $.ajax({
      url: 'ajax/namecheck',
      type: 'POST',
      dataType: 'json',
      data: {
        nick: $("#nick").val().trim(),
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
          $('#name-group').attr('class', 'form-group has-error has-feedback');
          $("#nick").val('');
          $("#nick").attr('placeholder', 'Name already taken.');
          $("#name-error").show();
        }
    }).fail(function() {
        alert('The request failed. Please try again.');
    });
}