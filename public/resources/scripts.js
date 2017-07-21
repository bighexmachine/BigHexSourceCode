/*
 * When everything on the page has loaded, bind the buttons to actions to do something.
 */
$(document).ready(function() {


    //Use jQuery to bind to the relevant actions. The send correct relevant command.

    $('#start').click(function() { updateClock('start', undefined) });
    $('#stop').click(function() { updateClock('stop', undefined) });

    $('#step').click( function() { updateClock('step' , undefined) });
    $('#reset').click( function() { updateClock('reset', undefined) });
    $('#load').click( function() {
		    updateClock('load' , $('#text').val());
	  }
    );

    $('#screentest').click(function() { updateClock('screen', undefined) });

    $('#execInst').click(
      function(e) {
          e.preventDefault();
          updateClock('runInstr', parseInt($('#instr').val() << 4) + parseInt($('#opr').val()) );
      }
    );

    $('#speedSlider').val(12);

    $('#speedSlider').on('input change', function(){
        updateSpeed();
    });

    updateSpeed();

});

function updateSpeed() {
    var base = 10;
    var max = 49;
    var speed = $('#speedSlider').val() / 40;
    var speed = Math.pow(base,speed);
    speed--;
    if (speed < 10) {
      speed = Math.round(speed*10)/10;
      $('#speedOut').text(speed + 'hz');
    } else if(speed <1000) {
      speed = Math.round(speed);
      $('#speedOut').text(speed + 'hz');
    } else {
      var kspeed = Math.round(speed/100)/10;
      $('#speedOut').text(kspeed + 'Khz');
    }
    updateClock('speed',speed);
}


/*
 * Sends a simple command to the server @ port 8080.
 * Sending commands to /api should make stuff happen!
 *
 * Could add a response function here to check the server
 * has actually confirmed the command has been executed successfully.
 *
 */
function updateClock(command, data) {
    $.ajax({
    url:'/api',
    type:'GET',
    data:{'command':command, 'data':data},
    success: function(res){}
    });

}
