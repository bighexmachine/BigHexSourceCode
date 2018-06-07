initSocket();

var socket;
var queuePos;

function initSocket()
{
  console.log(location.hostname);
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
              break;
          case "accessAPISuccess":
              queuePos = 1;
              console.log("changed to 1");
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
      }
  };
}

function askServerForAccessToAPI(callback) {
    socket.send("requestToAccessAPI");
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
}
