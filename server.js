/**
 * Created by ndoorly on 19/07/17.
 */

const configureExpress = require("./configure/express");

//Import useful libraries, use npm to install express, i2c-bus etc.
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require("fs");
var gpioService = require('./gpioConfig/gpioService.js');
const WebSocket = require('ws');
const queue = require('./configure/queue');

const api = require('./configure/api.js');

const autoShutdown = require('./configure/shutdown.js')

const app = configureExpress();
gpioService.setSpeed(1);

function getIp(ws) {
    var ipString = ws._socket.remoteAddress;
    var singleIp = ipString.split(':');
    return singleIp[3];
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    var ip = getIp(ws);

    queue.addToQueue(ip);

    let updateAllClients = function() {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN)
        {
          if(queue.getFrontOfQueue() == getIp(client))
          {
            client.send("accessAPISuccess");
          }
          else
          {
            var pos = queue.getQueuePositionOfIP(getIp(client));
            pos = pos+1;
            client.send("denied " + JSON.stringify(pos));
          }
        }
      });
    };

    ws.on('message', function incoming(message) {
        console.log('\'' + ip + '\' => %s', message);

        switch (message) {
            case "askServerForAccessToAPI":
                if(queue.getFrontOfQueue() == ip) {
                    //user can access the Big hex, set active for queue timeout
                    queue.setActive();
                    ws.send("accessAPISuccess");
                }
                else {
                    //return position along with deny to ensure client is up to date
                    var pos = queue.getQueuePositionOfIP(ip);
                    pos = pos+1;
                    ws.send("denied " + JSON.stringify(pos));
                }
                break;
            case "leaveQueue":

                queue.removeFromQueue(ip);
                updateAllClients();

                ws.send("leaveQueueSuccess");
                break;
            default:
                break;
        }
    });

    ws.on('close', function close() {
        console.log('disconnected');

        queue.removeFromQueue(ip);
        updateAllClients();

    });
});

var randomProgramTimer = -1;

server.listen(80, function () {
    console.log('Web Server listening on port 80');

    api.execute('reset', undefined);
    runRandomProgram();
    randomProgramTimer = setInterval(runRandomProgram, 5*60000);
});

//auto-shutdown
autoShutdown.init(function (done) {
  clearInterval(randomProgramTimer);

  //setup the machine in a low use state
  gpioService.resetClock();
  for(let i = 0; i < 16; i++)
  {
    gpioService.runInstruction((15 << 4) + 15);
    gpioService.runInstruction((2 << 4) + i);
  }
  gpioService.resetClock();

  wss._server.close(function() {
    server.close(function() {
      gpioService.kill();
      done();
    });
  });
  return true;
});


let randidx = 0;
let randomPrograms = ["wink.x", "pong.x", "welcome.x", "nyan.x", "rotating_text.x"];
//let randomPrograms = ["rotating_text.x"];
function runRandomProgram() {
  // start the next program
  randidx += 1;
  if(randidx >= randomPrograms.length) randidx = 0;

  if(queue.length() == 0)
  {
    console.log("Loading random program... " + randomPrograms[randidx]);
    api.execute('load', fs.readFileSync('xPrograms/' + randomPrograms[randidx]).toString()).then((resultstr) => {
      let result = JSON.parse(resultstr);

      if(result.keys.length == 0)
        return api.execute('speed', 1000000000);

      return Promise.reject(new Error("Failed to load program"));
    }).then(() => {
      return api.execute('start', undefined);
    }).catch((err) => {
      throw err;
    });
  }
}
