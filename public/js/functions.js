  function resize() {
    var height = $(window).height();
    $('#chatbox').css('height', height - 130 + 'px');
  }
 
  $(window).focus(function () {
    flashTitle()
    clearInterval(timer)
    timerOn = false
  })

  $(document).on('focus', function () {
    flashTitle()
    clearInterval(timer)
    timerOn = false
  })

  $(window).resize(function() {
    resize();
  });
