
//using util instead of sys since sys is deprecated.
var sys = require('util')
var execs = require('child_process').execSync;
var fs = require("fs");

var path = require('path');


module.exports.compile = function(Xsource){
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

  var stdout;

  try
  {
    stdout = execs(COMPILECMD);
  } catch(err) {
    console.log("Compile Failed");
    return {success: false, output:err.stdout.toString('utf8')};
  }

  console.log("Compile Successful");
  console.log("STDOUT:" + stdout.toString('utf8'));

  var hexu = fs.readFileSync(COMPILERFILES + '/sim3').toString();
  var hexuArray = hexu.split(" ");

  var hexl = fs.readFileSync(COMPILERFILES + '/sim2').toString();
  var hexlArray = hexl.split(" ");

  fs.chmodSync(COMPILERFILES + '/sim2', 777);
  fs.chmodSync(COMPILERFILES + '/sim3', 777);

  //console.log(hexuArray + '\n');
  //console.log(hexlArray + '\n');

  return { success: true, output: stdout.toString('utf8'), u: hexuArray, l: hexlArray};
}

module.exports.parseCompileErrors = function(stdout) {
  var errors = {keys:[]};
  var lines = stdout.split('\n');

  lines.forEach(function(line) {
    if(!line.startsWith("error near ")) return;

    let choppedLine = line.slice(11).split(':');
    if(choppedLine.length < 2) return;

    if(errors[choppedLine[0]] == undefined)
    {
      errors["keys"].push(choppedLine[0]);
      errors[choppedLine[0]] = [];
    }

    errors[choppedLine[0]].push(choppedLine[1]);
  });

  return errors;
}
