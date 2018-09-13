
const WebSocket = require('ws');

var queue = [];
var TimeoutSeconds = 120;
var inactiveTimerHandle = undefined;
var wss = undefined;

function updateAllClients() {
  wss.clients.forEach(function(client) {
    if (client.readyState === WebSocket.OPEN)
    {
      if(exports.getFrontOfQueue() == getIp(client))
      {
        client.send("accessAPISuccess");
      }
      else
      {
        var pos = exports.getQueuePositionOfIP(getIp(client));
        pos = pos+1;
        client.send("denied " + JSON.stringify(pos));
      }
    }
  });
};

function sendMessageToClient(ip, msg) {
  wss.clients.forEach(function(client) {
    if (client.readyState === WebSocket.OPEN)
    {
      if(ip == getIp(client))
      {
        client.send(msg);
      }
    }
  });
};



function getIp(ws) {
    var ipString = ws._socket.remoteAddress;
    var singleIp = ipString.split(':');
    return singleIp[3];
};

exports.setSocketServer = function(server) {
  wss = server;
}

exports.setActive = function() {
  restartInactiveTimer();
}

exports.length = function() { return queue.length; }

exports.addToQueue = function(ip) {
    if(queue.indexOf(ip) === -1) {
        queue.push(ip);
        console.log("\'" + ip + "\' joining the queue");

        if(inactiveTimerHandle == undefined)
        {
          restartInactiveTimer();
        }
    }
    else{

      console.log("\'" + ip + "\' already in the queue");
    }
}

exports.getFrontOfQueue = function() {
    return queue[0];
}

exports.getQueuePositionOfIP = function(ip) {
    return queue.indexOf(ip);
}

exports.removeFromQueue = function(userIP) {
    console.log("\'" + userIP + "\' is leaving the queue");
    var position = queue.indexOf(userIP);
    if(position !== -1) {
        queue.splice(position, 1);
    }

    if(position === 0)
    {
      restartInactiveTimer();
    }
    updateAllClients();
}


//Time user out after ertain number of seconds if innactive
function restartInactiveTimer() {
  clearTimeout(inactiveTimerHandle);
  inactiveTimerHandle = undefined;

  if(queue.length < 2) return;

  console.log("Setting timer");
  inactiveTimerHandle = setTimeout(function() {
    // TODO: Send a warning message to the user
    console.log("Timeout warning");
    sendMessageToClient(exports.getFrontOfQueue(), "warning");

    inactiveTimerHandle = setTimeout(function() {
      exports.removeFromQueue(queue[0]);
    }, 30000);
  }, TimeoutSeconds * 1000);//Timeout at 2 1/2 mins
}
