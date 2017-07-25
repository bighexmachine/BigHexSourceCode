
//using util instead of sys since sys is deprecated.
var sys = require('util')
var execs = require('child_process').exec;
var fs = require("fs");

var path = require('path');


var compile = function(Xsource, errorFunction, postCall){
  //writes code passed in to file source.x
  var SOURCEFILE = path.normalize(__dirname + '/../xPrograms/source.x');
  var COMPILERFILES = path.normalize(__dirname + '/../xCompiler/oldCompiler');
  console.log("writing file to " + SOURCEFILE);
  fs.writeFileSync(SOURCEFILE, Xsource);

  // executes compile on file
  var COMPILECMD = 'sudo ' + COMPILERFILES + '/a.out' + ' < ' + SOURCEFILE;
  console.log(COMPILECMD);
  execs("cd ~/Documents/serverV2/xCompiler/oldCompiler/ && ./a.out < " + SOURCEFILE,

    function (error, stdout, stderr) {
      console.log("Trying to compile X code");
      errorFunction("Errors: " + error);
      errorFunction("StdError: " + stderr);
      errorFunction("STDOUT:" + stdout);

      var hexu = fs.readFileSync(COMPILERFILES + '/sim3').toString();
      var hexuArray = hexu.split(" ");

      var hexl = fs.readFileSync(COMPILERFILES + '/sim2').toString();
      var hexlArray = hexl.split(" ");

      console.log(hexuArray + '\n');
      console.log(hexlArray + '\n');

      postCall(hexuArray, hexlArray);

    }
  );
}

module.exports.compile = compile;
