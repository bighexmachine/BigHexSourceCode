var examples = [
  {
    name: "Starter Program",
    desc: "Program with an empty main function",
    path: "starter.x"
  },
  {
    name: "Factorial",
    desc: "Computes 5!",
    path: "fact.x"
  },
  {
    name: "Wink",
    desc: "",
    path: "wink.x"
  },
  {
    name: "Welcome to CS",
    desc: "Writes Welcome to CS at Bristol! ☺ on the display output in a loop",
    path: "welcome.x"
  },
  {
    name: "Raction Game",
    desc: "",
    path: "reaction.x"
  },
  {
    name: "Pong Game",
    desc: "",
    path: "pong.x"
  },
  {
    name: "Hi David",
    desc: "",
    path: "rotating_text.x"
  },
  {
    name: "Faces",
    desc: "",
    path: "inputFaces.x"
  },
  {
    name: "Nayn",
    desc: "",
    path: "nyan.x"
  },
  {
    name: "Will's Automata",
    desc: "",
    path: "ca.x"
  },
  {
    name: "Christmas Text",
    desc: "",
    path: "christmas.x"
  },,
  {
    name: "Christmas Tree",
    desc: "",
    path: "tree.x"
  }
]

/*
 * When everything on the page has loaded, bind the buttons to actions to do something.
 */
$(document).ready(function() {

    //Use jQuery to bind to the relevant actions. The send correct relevant command.
    $('#load').click( function() {
		    sendReq('load' , $('#text').val());
	  }
    );

    $('#speedSlider').val(12);

    $('#speedSlider').on('input change', function(){
        askServerForAccessToAPI( function() {
            updateSpeed();
        });
    });
    updateSpeed();

    if($("#programInput").val() == "")
    {
      loadprog('starter.x')
    }
});

function start()
{
  //check place in queue
  //-get cookie num
  //-send to server to get ok
  askServerForAccessToAPI( function() {
      sendReq('start', undefined);
  });
}

function stop()
{
  askServerForAccessToAPI( function() {
      sendReq('stop', undefined);
  });
}

function step()
{
  askServerForAccessToAPI( function() {
      sendReq('step' , undefined);
  });
}

function reset()
{
  askServerForAccessToAPI( function() {
      sendReq('reset', undefined);
  });
}

function loadToRAM()
{
  $("#compile-errors").html("");
  $("#loadToRAM").html("Loading...");

	askServerForAccessToAPI( function() {
      sendReq('load', $('#programInput').val(), function(res) {

        $("#loadToRAM").html("Load into RAM");

        var result = JSON.parse(res);
        parseCompileErrors(result);
      });
	});
}

function compile()
{
  $("#compile-errors").html("");
  $("#compileBtn").html("Compiling...");

  sendReq('compile', $("#programInput").val(), function(res) {
    $("#compileBtn").html("Compile");
    var result = JSON.parse(res);
    parseCompileErrors(result);
  });
}

function parseCompileErrors(result)
{

  if(result.keys.length == 0)
  {
    $("#compile-success").show();
  }
  else
  {
    $("#compile-success").hide();
    result.keys.forEach(function(key) {
      var row = "<tr><td>" + key + "</td><td>";

      result[key].forEach(function(error) {
        row = row + error + "</td></tr>";
        $("#compile-errors").append(row);
        row = "<tr><td></td><td>";
      });
    });
  }
}

function openRunInstructionModal()
{
  $("#instructionModal").modal();
}

function runInstruction()
{
  sendReq('runInstr', parseInt($('#instr').val() << 4) + parseInt($('#opr').val()) );
}

function openExampleProgramsModal()
{
  let container = $("#programsTable");
  container.html("");
  let markup = (example) =>
    `<tr>
      <td style="margin-right:auto">${example.name}</td>
      <td><button type="button" class="btn btn-primary" onclick="loadprog('${example.path}')" data-dismiss="modal">Load</button></td>
    </tr>
    <tr>
      <td class="small-text">${example.desc}</td><td></td>
    </tr>`;

  examples.forEach(function(example) {
    container.append(markup(example));
  });

  $("#examplesModal").modal();
}

function loadprog(prog)
{
  sendReq('getprog', prog, function(res) {
		$('#programInput').val(res);
    $("#compile-errors").html("");
  });
}

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
    sendReq('speed',speed);
}

function updateQueueUI(place) {
  $(".queue-header").removeClass("active");
  $("#leaveQueue").show();
  $("#joinQueue").hide();
  $("#controls").hide();
  $("#controls-hidden").show();

  if(place == 1) {
      $('#queueUI').text('In Control');
      $(".queue-header").addClass("active");
      $("#controls").show();
      $("#controls-hidden").hide();
  }
  else if(place == -1) {
      $('#queueUI').text('Not waiting');
      $("#leaveQueue").hide();
      $("#joinQueue").show();
  }
  else {
      $('#queueUI').text('Waiting, position ' + place);
  }
}



/*
 * Sends a simple command to the server @ port 8080.
 * Sending commands to /api should make stuff happen!
 *
 * Could add a response function here to check the server
 * has actually confirmed the command has been executed successfully.
 *
 */
function sendReq(command, data, callback) {
    $.ajax({
    url:'/api',
    type:'GET',
    data:{'command':command, 'data':data},
    success: function(res){
      if(callback != undefined) callback(res);
    }
    });

}
