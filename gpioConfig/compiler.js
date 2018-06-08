
//using util instead of sys since sys is deprecated.
var sys = require('util')
var execs = require('child_process').execSync;
var fs = require("fs");

var path = require('path');

function rmdirRecursive(path)
{
  if(!fs.existsSync(path)) return;

  fs.readdirSync(path).forEach(function(file)
  {
    var curPath = path + "/" + file;

    if (fs.lstatSync(curPath).isDirectory())
    {
      rmdirRecursive(curPath);
    } else
    {
      fs.unlinkSync(curPath);
    }
  });

  fs.rmdirSync(path);
}


module.exports.compile = function(Xsource){
  var TEMPDIR = path.normalize(__dirname + '/../temp/');

  if(!fs.existsSync(TEMPDIR))
  {
    fs.mkdirSync(TEMPDIR);
    fs.chmodSync(TEMPDIR, '777');
  }

  // find a fee ID slot
  var compileID = 0;
  var COMPILEDIR = TEMPDIR + compileID;

  while(fs.existsSync(COMPILEDIR))
  {
    compileID += 1;
    COMPILEDIR = TEMPDIR + compileID;
  }

  fs.mkdirSync(COMPILEDIR);
  fs.chmodSync(COMPILEDIR, '777');

  //writes code passed in to file source.x
  var SOURCEFILE = path.normalize(COMPILEDIR + '/source.x');
  var COMPILERFILES = path.normalize(__dirname + '/../xCompiler');

  console.log("writing file to " + SOURCEFILE);
  fs.writeFileSync(SOURCEFILE, Xsource);

  // executes compile on file
  var COMPILECMD = "cd " + COMPILERFILES + " && " + COMPILERFILES + "/a.out " + COMPILEDIR + " < " + SOURCEFILE;
  console.log(COMPILECMD);

  var stdout;

  try
  {
    stdout = execs(COMPILECMD);
  } catch(err) {
    console.log("Compile Failed");
    console.log("STDOUT:" + err.stdout.toString('utf8'));
    rmdirRecursive(COMPILEDIR);
    return {success: false, output:err.stdout.toString('utf8')};
  }

  console.log("Compile Successful");
  console.log("STDOUT:" + stdout.toString('utf8'));

  var hexu = fs.readFileSync(COMPILEDIR + '/sim3').toString();
  var hexuArray = hexu.split(" ");

  var hexl = fs.readFileSync(COMPILEDIR + '/sim2').toString();
  var hexlArray = hexl.split(" ");

  //console.log(hexuArray + '\n');
  //console.log(hexlArray + '\n');

  rmdirRecursive(COMPILEDIR);

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

    let message = "";
    for(let i = 1; i < choppedLine.length; i++)
    {
      message += choppedLine[i];
    }

    errors[choppedLine[0]].push(message);
  });

  if(errors.keys.length == 0)
  {
    errors["keys"].push("ERROR");
    errors["ERROR"] = ["Compiler Crashed, see server log for details"];
  }

  return errors;
}
