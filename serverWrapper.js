// wrapper to call the server with a log file
var spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const util = require('util');

var MAX_LOGFILES=50

var LOGSDIR = path.normalize(__dirname + '/logs/');

if(!fs.existsSync(LOGSDIR))
{
  fs.mkdirSync(LOGSDIR);
}

// if we have too many log files saved then delete the oldest
let Logfiles = fs.readdirSync(LOGSDIR);

if(Logfiles.length > MAX_LOGFILES)
{
  // sorts files by modified time
  Logfiles = Logfiles.map(function (fileName) {
    return {
      name: fileName,
      time: fs.statSync(LOGSDIR + '/' + fileName).mtime.getTime()
    };
  })
  .sort(function (a, b) {
    return b.time - a.time;
  })
  .map(function (v) {
    return v.name;
  });

  console.log(Logfiles);
  console.log(Logfiles.length + " logfiles detected (max " + MAX_LOGFILES + "), deleting oldest");
}

while ( Logfiles.length > MAX_LOGFILES)
{
  fs.unlinkSync(LOGSDIR + '/' + Logfiles[Logfiles.length - 1]);
  Logfiles.pop();
}

let now = new Date(Date.now());
let NewLogfileName = util.format('%d.%d.%d_%d.%d.%d',
      now.getDate(), now.getMonth()+1, now.getFullYear(),
      now.getHours(), now.getMinutes(), now.getSeconds());
let cmd = "sudo node ./server.js";

console.log("$ " + cmd);
let ws = fs.createWriteStream(LOGSDIR + '/' + NewLogfileName  + ".log");
let proc = spawn(cmd, {shell: true});

let uncorkHandle = -1;
proc.stdout.on('data', (data) => {
  ws.cork();
  ws.write(data.toString('utf8'));

  clearTimeout(uncorkHandle);
  setTimeout(function() {
    ws.uncork();
  }, 1000);
});

proc.on('close', (code) => {
  ws.end();
  console.log("Server proc terminated with code ${code}");
  if(code != 0) throw new Error("ServerError");
});
