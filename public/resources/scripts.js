/*
 * When everything on the page has loaded, bind the buttons to actions to do something.
 */
$(document).ready(function() {


    //Use jQuery to bind to the relevant actions. The send correct relevant command.

    $('#start').click(function() {
        //check place in queue
        //-get cookie num
        //-send to server to get ok
        askServerForAccessToAPI( function() {
            updateClock('start', undefined);
        });
    });
    $('#stop').click(function() {
        askServerForAccessToAPI( function()
            updateClock('stop', undefined);
        });
    });
    $('#step').click( function() {
        askServerForAccessToAPI( function() {
            updateClock('step' , undefined);
        });
    });
    $('#reset').click( function() {
        askServerForAccessToAPI( function() {
            updateClock('reset', undefined);
        });
    });
    $('#load').click( function() {
		    updateClock('load' , $('#text').val());
	  }
    );

    $('#screentest').click(function() {
        askServerForAccessToAPI( function() {
            updateClock('screen', undefined);
        });
    });
    $('#execInst').click(
      function(e) {
          e.preventDefault();
          updateClock('runInstr', parseInt($('#instr').val() << 4) + parseInt($('#opr').val()) );
      }
    );

    $('#speedSlider').val(12);

    $('#speedSlider').on('input change', function(){
        askServerForAccessToAPI( function() {
            updateSpeed();
        });
    });

    askServerForAccessToAPI(function() {updateSpeed();});

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

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//Copied from cookie.js, needs to be refactored at some point
function checkPlaceAndRunFunc(num, callbackFunc) {
    $.ajax({
        type: 'GET',
        url: '/placeinqueue',
        data: {'userNum': num},
        success: function(data){
            var $response=$(data);
            num = $response.selector;
            console.log("Your place in queue " + num);
            console.log("type = " + typeof num);
            if(num == '0') {
                callbackFunc();
            }
            else {
                alert("You are not first in the queue. Wait your turn.");
            }
        }
    });
}

function askServerForAccessToAPI(callbackFunc) {
    var userNum = getCookie("BIG_HEX");
    checkPlaceAndRunFunc(userNum, callbackFunc);
}
