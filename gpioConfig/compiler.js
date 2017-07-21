var sys = require('util')
var exec = require('child_process').exec;
var fs = require("fs");

var path = require('path');
var currentDir = path.join()

module.exports = {}

var compile = function(Xsource, errorFunction, postCall){
  //writes code passed in to file
  var SOURCEFILE = __dirname + '/'+  'source.x';
  console.log("writing file to " + SOURCEFILE);
  fs.writeFileSync(SOURCEFILE, Xsource);
  // executes compile on file
  var COMPILECMD = 'sudo '+ __dirname + '/simulator < ' + __dirname + '/source.x';
  console.log(COMPILECMD);
  exec(COMPILECMD,
    function (error, stdout, stderr) {
      console.log("Trying to compile X code");
      errorFunction("Errors: " + error);
      errorFunction("StdError: " + stderr);
      errorFunction("STDOUT:" + stdout);

      var hexu = fs.readFileSync(__dirname + '/sim3').toString();
      var hexuArray = hexu.split(" ");

      var hexl = fs.readFileSync(__dirname + '/sim2').toString();
      var hexlArray = hexl.split(" ");

      console.log(hexuArray + '\n');
      console.log(hexlArray + '\n');

      postCall(hexuArray, hexlArray);

    }
  );
}

module.exports.compile = compile;
