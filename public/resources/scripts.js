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
    desc: "Displays a smiley face on a ticker tape",
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
];

// list of all testable parts of the machine
var allops = [
  "RESET",
  "TIMING",

  "LDAM",
  "LDBM",
  "STAM",
  "LDAC",
  "LDBC",
  "LDAP",
  "LDAI",
  "LDBI",
  "STAI",
  "BR",
  "BRZ",
  "BRN",
  "BRB",
  "ADD",
  "SUB",
  "IN",
  "OUT",
  "PFX",
  "NFX",

  "PCLED",
  "ALED",
  "BLED"
];

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

    $("#programInput").linedtextarea();
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

var suite = undefined;
var results = [];
var testID = -1;
var instructionID = 0;

function openTestSuiteModal()
{
  // load the test file and clear previous test info
  $.ajax({
  url:'/resources/supervisedTest.json',
  type:'GET',
    success: function(res){
      cancelTest();
      $("#testContent").html("");
      $("#testSuiteModal").modal();

      suite = res;

      runPreTest(function() {
        nextTest(true);
      });
    }
  });
}

function runPreTest(callback, id = 0)
{
  if(suite.preTest == undefined ||
      id >= suite.preTest.length)
  {
    callback();
    return;
  }

  runTestCmd(suite.preTest[id], function() {
    runPreTest(callback, id+1);
  });
}

function cancelTest()
{
  suite = undefined;
  results = [];
  testID = -1;
  instructionID = 0;
}

function nextTest(pass)
{
  if(testID > -1)
  {
    // TODO: keep track of which tests pass

    var curRow = $(".test-current");
    curRow.removeClass("test-current");
    curRow.addClass("test-done");
    curRow.children().eq(0).html(pass ? "[/]" : "[X]");

    results.push(pass);
  }

  testID++;

  if(testID >= suite.tests.length)
  {
    showTestResults();
    return;
  }

  let rowMarkup = (test) => `<tr class="test-current">
  <td>[ ]</td><td>${test.checkText}</td></tr>`

  $("#testContent").append(rowMarkup(suite.tests[testID]));

  // run the test commands
  instructionID = -1;
  nextInstruction();
}

function nextInstruction()
{
  instructionID++;

  if(instructionID >= suite.tests[testID].cmds.length)
  {
    if(suite.tests[testID].loopCmds === true)
    {
      instructionID = 0;
    }
    else
    {
      return;
    }
  }

  runTestCmd(suite.tests[testID].cmds[instructionID], function() {
    nextInstruction();
  });
}

var commandSpeed = 50;
function runTestCmd(cmd, callback)
{
  let parts = cmd.split(" ");

  let req = {
    url:'/api',
    type:'GET',
    success: function(res){
      callback();
    }
  };

  if(parts[0] == "SKIP")
  {
    req.data = {'command':'step', 'data':undefined};
  }
  else if(parts[0] == "RESET")
  {
    req.data = {'command':'reset', 'data':undefined};
  }
  else if(parts[0] == "SPEED")
  {
    let val = parseFloat(parts[1]);
    req.data = {'command':'speed', 'data':val};
    commandSpeed = val;
  }
  else if(parts[0] == "START")
  {
    req.data = {'command':'start', 'data':undefined};
  }
  else if(parts[0] == "STOP")
  {
    req.data = {'command':'stop', 'data':undefined};
  }
  else
  {
    let instr = parseInt(parts[0]);
    let opr = parseInt(parts[1]);

    req.data = {'command':'runInstr', 'data':(instr << 4) + opr};
  }

  setTimeout(function() {
    $.ajax(req);
  }, 1000 / commandSpeed);
}

function showTestResults()
{
  let verifiedOps = [];
  allops.forEach(function(op) {
    verifiedOps.push({op: op, count: 0});
  });

  results.forEach(function(res, idx) {
    suite.tests[idx].verifies.forEach(function(op) {
      let found = verifiedOps.findIndex(function(item) {
        return item.op === op;
      });

      if(found == -1) return;

      verifiedOps[found].count += (res ? 1 : -1);
    });

  });

  verifiedOps.sort(function(a,b){
    return a.count - b.count;
  });

  alert(verifiedOps[0].op);
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
