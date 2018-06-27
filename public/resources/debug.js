// HTTP GET Parameters
var params = [];

// failing test IDs
var failures = [];

// Control signals that the user has manually verified are functioning correctly
var manuallyVerifiedCtrls = [];

var controlSignals = undefined;

var scoreThreshold = -1;

var failingOps = [];
var failingControls = [];

var listItemMarkup = (control, debuginfo) => `
    <div class="fault">
      <div class="fault-header" onclick="ToggleFaultDetails($(this));"><span class="arrow">▶</span> ${prettyPrint(control)}</div>
      <div class="fault-body" style="display:none;">
        <p>${debuginfo.location}</p>
        <ul class="checklist" style="display:none;">
        </ul>
        <div class="fault-footer">
          <button type="button" class="btn btn-primary" onclick="NextChecklistItem('${control}', $(this).parent().parent());" id="btn-yes">Start Checklist</button>
          <button type="button" class="btn btn-default" onclick="MarkControlWorking('${control}');">Dismiss Fault</button>
        </div>
      </div>
    </div>`;

$(document).ready(function() {
  // parse the parameters
  let inParams = window.location.search.substr(1).split('&');


  inParams.forEach(function(val) {
    let splitVal = val.split('=');
    params[splitVal[0]] = splitVal[1];
  });

  InitialiseDebugger();
});

function InitialiseDebugger()
{
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "./resources/controlsignals.json");
  xhr.onload = function() {
    controlSignals = JSON.parse(xhr.responseText);

    $.ajax({
      url:'/resources/' + params['suite'],
      type:'GET',
      success: function(res){
        suite = res;
        OnSuiteLoaded();
      }
    });
  };
  xhr.send();
}

function OnSuiteLoaded()
{
  $("#debugger-title").html("Debugger");

  $(".debug-table").html("<tr><td>Test ID</td><td>Expected Result</td><td>Operations</td><td></td></tr>");

  failures = JSON.parse(params['failures']);

  let testRow = (testId, test) => `<tr><td>${testId}</td><td>${test.checkText}</td><td>${test.verifies.toString()}</td><td>Re-run Test</td></tr>`;
  failures.forEach(function(testID) {
    $(".debug-table").append(testRow(testID, suite.tests[testID]));
  });

  CalculateControlSignalFailures();
}

function ArrayRemoveSwap(arr, value)
{
  let idx = arr.findIndex(function(val) {
    return val == value;
  });

  if(idx == -1) return false;
  ArrayRemoveSwap_Idx(arr, idx);
  return true;
}

function ArrayRemoveSwap_Idx(arr, idx)
{
  if(idx != arr.length-1)
  {
    let tmp = arr[arr.length-1];
    arr[arr.length-1] = arr[idx];
    arr[idx] = tmp;
  }

  arr.pop();
}

function MarkControlWorking(control)
{
  manuallyVerifiedCtrls.push(control);
  CalculateControlSignalFailures();
}

var currentChecklistControl = "";
var currentChecklist = [];
var currentChecklistItem = 0;

function NextChecklistItem(control, div)
{
  let checklistContainer = div.find(".checklist");

  if(control != currentChecklistControl)
  {
    currentChecklistControl = control;

    GenerateChecklist(control);
    currentChecklistItem = 0;

    checklistContainer.html("");

    currentChecklist.forEach(function(item) {
      checklistContainer.append("<li>" + item.msg + "</li>");
    });
    checklistContainer.show();
  }
  else
  {
    checklistContainer.children().eq(currentChecklistItem).removeClass("active");
    currentChecklistItem++;
  }

  checklistContainer.children().eq(currentChecklistItem).addClass("active");

  let cmd = currentChecklist[currentChecklistItem].cmd;

  if(cmd != undefined && cmd != -1)
  {
    sendReq('runInstr', cmd );
  }
}

function GenerateCmd(op)
{
  let opcode = 0;
  let operand = Math.floor(Math.random() * 16);

  if(op == "LDAM") opcode = 0;
  else if(op == "LDBM") opcode = 1;
  else if(op == "STAM") opcode = 2;
  else if(op == "LDAC") opcode = 3;
  else if(op == "LDBC") opcode = 4;
  else if(op == "LDAP") opcode = 5;
  else if(op == "LDAI") opcode = 6;
  else if(op == "LDBI") opcode = 7;
  else if(op == "STAI") opcode = 8;
  else if(op == "BR") opcode = 9;
  else if(op == "BRZ") opcode = 10;
  else if(op == "BRN") opcode = 11;
  else if(op == "BRB") opcode = 12;
  else if(op == "ADD") { opcode = 13; operand = 0; }
  else if(op == "SUB") { opcode = 13; operand = 1; }
  else if(op == "IN") { opcode = 13; operand = 2; }
  else if(op == "OUT") { opcode = 13; operand = 3; }
  else if(op == "PFIX") opcode = 14;
  else if(op == "NFIX") opcode = 15;
  else
  {
    console.warn("Tried to generate invalid command \"" + op + "\"");
    return -1;
  }

  return (opcode << 4) + operand;
}

function GenerateChecklist(control)
{
  let debugInfo = controlSignals.debugInfo[control];

  currentChecklist = [];
  currentChecklist.push({msg:"Perform a general check of cables in the area and ensure they are not lose or unplugged"});

  failingOps.forEach(function(op) {
    let vals = debugInfo.cmdVals[op];
    if(vals == undefined) return;

    let msg = "Check that ";

    debugInfo.inputs.forEach(function(input, idx) {
      if(idx != 0) msg += " and ";
      msg += input + " is " + (vals[idx] == 1 ? "ON" : (vals[idx] == 0 ? "OFF" : vals[idx]));
    });

    currentChecklist.push({cmd:GenerateCmd(op), msg: msg});
  });

  // set the machine into a state for testing
  let testingPhase = 2;
  if(debugInfo.testingPhase != undefined) testingPhase = debugInfo.testingPhase;

  reset();
  step(4 * testingPhase);

  console.log(currentChecklist);
}

function ToggleFaultDetails(headerDiv)
{
  let arrow = headerDiv.find(".arrow");
  let body = headerDiv.parent().find('.fault-body');

  if(arrow.html() == "▶")
  {
    arrow.html("▼");
    body.slideDown();
    headerDiv.addClass("open");
  }
  else
  {
    arrow.html("▶");
    body.slideUp();
    headerDiv.removeClass("open");
  }

}

function CalculateControlSignalFailures()
{
  let opScores = [];
  let signalScores = [];

  controlSignals.signals.forEach(function(signal) {
    signalScores[signal] = scoreThreshold;
  });

  controlSignals.ops.forEach(function(op) {
    opScores[op] = 0;
  });

  suite.tests.forEach(function(test, idx) {
    let failing = failures.includes(idx);

    let uniqueSignals = [];

    test.verifies.forEach(function(op) {
      if(failing)
      {
        opScores[op]++;
      }
      else
      {
          opScores[op] -= 100;
      }

      controlSignals.opSignals[op].forEach(function(control) {
        if(!uniqueSignals.includes(control))
        {
          uniqueSignals.push(control);
        }
      });
    });


    uniqueSignals.forEach(function(control) {
      if(failing)
      {
        signalScores[control]--;
      }
      else
      {
        signalScores[control]++;
      }
    });
  });

  failingOps = [];
  failingControls = [];

  controlSignals.ops.forEach(function(op) {
    if(opScores[op] > 0)
    {
        failingOps.push(op);
    }
  });

  controlSignals.signals.forEach(function(signal) {
    if(signalScores[signal] < 0)
    {
      failingControls.push(signal);
    }
  });

  manuallyVerifiedCtrls.forEach(function(control) {
    ArrayRemoveSwap(failingControls, control);
  });

  //ensure all failing ops use at least one failing control
  for(let i = failingOps.length-1; i >= 0; i--)
  {
    let valid = false;
    controlSignals.opSignals[failingOps[i]].forEach(function(control) {
      if(failingControls.includes(control))
      {
        valid = true;
      }
    });

    if(!valid)
    {
      ArrayRemoveSwap_Idx(failingOps, i);
    }
  }

  let likelyFailingControls = CalculateLikelyFailingControls(failingOps, failingControls);
  likelyFailingControls.reverse();
  let failuresList = $(".failures-list");

  failuresList.html("");

  likelyFailingControls.forEach(function(control, idx) {
    let div = failuresList.append(listItemMarkup(control, controlSignals.debugInfo[control]));

    if(idx == 0)
    {
      ToggleFaultDetails(div.find('.fault-header'));
    }
  });

  if(likelyFailingControls.length == 0)
  {
    scoreThreshold--;
    if(scoreThreshold > -10)
    {
      CalculateControlSignalFailures();
    }
    else
    {
      failuresList.append("<p>Failed to automatically calculate faults. Try running the failing tests manually or running a different test suite</p>");
    }
  }
}

//returns a list of the most likely controls to fail in reverse order (i.e the last control in the list is the most likely)
function CalculateLikelyFailingControls(inFailingOps, inFailingControls)
{
  if(inFailingOps.length == 0 || inFailingControls.length == 0) return [];

  // find the control used in the most failing operations
  let highestControl = "";
  let highestCount = -1;

  inFailingControls.forEach(function(control) {
    let count = 0;

    inFailingOps.forEach(function(op) {
      if(controlSignals.opSignals[op].includes(control))
      {
        count++;
      }
    });

    if(count > highestCount)
    {
      highestControl = control;
      highestCount = count;
    }
  });

  if(highestCount == -1) return [];

  let newFailingOps = inFailingOps.splice();

  // recursive call with the remaining ops and controls
  for(let i = newFailingOps.length-1; i >= 0; i--)
  {
    if(controlSignals.opSignals[newFailingOps[i]].includes(highestControl))
    {
      ArrayRemoveSwap_Idx(newFailingOps, i);
    }
  }

  let newFailingControls = failingControls.splice();
  ArrayRemoveSwap(newFailingControls, highestControl);

  let recursiveArr = CalculateLikelyFailingControls(newFailingOps, newFailingControls);
  recursiveArr.push(highestControl);
  return recursiveArr;
}
