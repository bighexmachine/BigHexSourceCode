initSocket();

var socket;
var queuePos;

function initSocket()
{
  socket = new WebSocket("ws://" + location.hostname + "/");
  queuePos = -1;

  socket.onopen = function() {
      socket.send("askServerForAccessToAPI");
  };

  socket.onmessage = function(evt) {
      var receivedMsg = evt.data;
      console.log("Message is received: " + receivedMsg);
      var splitMsg = receivedMsg.split(" ");
      switch(splitMsg[0]) {
          case "denied":
              console.log("denied access to api");
              queuePos = splitMsg[1];
              updateQueueUI(queuePos);
              $("#warnModal").modal("hide");
              break;
          case "accessAPISuccess":
              if(queuePos != 1)
                console.log("queue position changed to 1");

              queuePos = 1;
              updateQueueUI(queuePos);
              break;
          case "moveUpQueue":
              queuePos = queuePos - 1;
              console.log("moved up queue");
              updateQueueUI(queuePos);
              break;
          case "leaveQueueSuccess":
              queuePos = -1;
              updateQueueUI(queuePos);
              socket.close();
              break;
          case "warning":
              $("#warnModal").modal();
              break;
      }
  };

  socket.onerror = function(err) {
    console.error(err);

    queuePos = -1;
    socket.close();
    updateQueueUI(queuePos);
  }

  socket.onclose = function() {
    queuePos = -1;
    updateQueueUI(queuePos);
  }
}

function askServerForAccessToAPI(callback) {
    if(socket.readyState === socket.OPEN)
    {
      socket.send("askServerForAccessToAPI");
    }
    else
    {
      queuePos = -1;
      updateQueueUI(queuePos);
    }

    if(queuePos === 1) {
        callback();
    }
}

function joinQueue() {
  if(socket.readyState === socket.OPEN)
  {
    socket.send("requestToAccessAPI");
  }
  else
  {
    initSocket();
  }
}

function leaveQueue() {
    socket.send("leaveQueue");
    $("#warnModal").modal("hide");
}


function stayInQueue()
{
  socket.send("stayInQueue");
  $("#warnModal").modal("hide");
}
