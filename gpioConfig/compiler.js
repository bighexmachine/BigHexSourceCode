
//using util instead of sys since sys is deprecated.
var sys = require('util')
var execs = require('child_process').exec;
var fs = require("fs");

var path = require('path');


var compile = function(Xsource, errorFunction, postCall){
  //writes code passed in to file source.x
  var SOURCEFILE = path.normalize(__dirname + '/../xPrograms/source.x');
  var COMPILERFILES = path.normalize(__dirname + '/../xCompiler');

  // delete old files so there is no chance of old data being used
  if(fs.existsSync(SOURCEFILE))
  {
    fs.unlinkSync(SOURCEFILE);
  }

  if(fs.existsSync(COMPILERFILES + '/sim3'))
  {
    fs.unlinkSync(COMPILERFILES + '/sim3');
  }

  if(fs.existsSync(COMPILERFILES + '/sim2'))
  {
    fs.unlinkSync(COMPILERFILES + '/sim2');
  }

  console.log("writing file to " + SOURCEFILE);
  fs.writeFileSync(SOURCEFILE, Xsource);

  // executes compile on file
  var COMPILECMD = "cd " + COMPILERFILES + " && ./a.out < " + SOURCEFILE;
  console.log(COMPILECMD);
  execs(COMPILECMD,
    function (error, stdout, stderr) {
      console.log("Trying to compile X code");
      errorFunction("Errors: " + error);
      errorFunction("StdError: " + stderr);
      errorFunction("STDOUT:" + stdout);

      var hexu = fs.readFileSync(COMPILERFILES + '/sim3').toString();
      var hexuArray = hexu.split(" ");

      var hexl = fs.readFileSync(COMPILERFILES + '/sim2').toString();
      var hexlArray = hexl.split(" ");

      //console.log(hexuArray + '\n');
      //console.log(hexlArray + '\n');

      postCall(hexuArray, hexlArray);

    }
  );
}

module.exports.compile = compile;
