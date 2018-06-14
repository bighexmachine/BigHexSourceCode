// HTTP GET Parameters
var params = [];

// failing test IDs
var failures = [];

// Control signals that the user has manually verified are functioning correctly
var manuallyVerifiedCtrls = [];

var controlSignals = undefined;

var scoreThreshold = -1;

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
  $("#debugger-title").html("Debug");

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

  let failingOps = [];
  let failingControls = [];

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

  let listItemMarkup = (control) => `<li>${control}   (<a href="javascript:void(0);" onclick="MarkControlWorking('${control}');CalculateControlSignalFailures();">Not This</a>)</li>`;

  likelyFailingControls.forEach(function(control) {
    failuresList.append(listItemMarkup(control));
  });

  if(likelyFailingControls.length == 0)
  {
    scoreThreshold--;
    if(scoreThreshold > -10)
    {
      CalculateControlSignalFailures();
    }
  }
}

//returns a list of the most likely controls to fail in reverse order (i.e the last control in the list is the most likely)
function CalculateLikelyFailingControls(failingOps, failingControls)
{
  if(failingOps.length == 0 || failingControls.length == 0) return [];

  // find the control used in the most failing operations
  let highestControl = "";
  let highestCount = -1;

  failingControls.forEach(function(control) {
    let count = 0;

    failingOps.forEach(function(op) {
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

  // recursive call with the remaining ops and controls
  for(let i = failingOps.length-1; i >= 0; i--)
  {
    if(controlSignals.opSignals[failingOps[i]].includes(highestControl))
    {
      ArrayRemoveSwap_Idx(failingOps, i);
    }
  }

  ArrayRemoveSwap(failingControls, highestControl);

  let recursiveArr = CalculateLikelyFailingControls(failingOps, failingControls);
  recursiveArr.push(highestControl);
  return recursiveArr;
}
