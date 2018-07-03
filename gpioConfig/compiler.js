
//using util instead of sys since sys is deprecated.
var sys = require('util')
var exec = require('child_process').exec;
var fs = require("fs");
var HashMap = require('hashmap');

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


rmdirRecursive(path.normalize(__dirname + '/../temp/'));

module.exports.compile = function(Xsource, callback, quiet){
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
  var STDLIB = path.normalize(COMPILERFILES + '/stdlib.x');
  var COMPILECMD = "cd " + COMPILERFILES + " && " + COMPILERFILES + "/a.out -d=" + COMPILEDIR + " < " + SOURCEFILE;

  if(quiet == undefined || quiet == false)
    console.log("writing file to " + SOURCEFILE);

  let promise = new Promise((resolve, reject) => {
    fs.readFile(STDLIB, function(err, data) {
      if(err) throw err;

      fs.writeFile(SOURCEFILE, data.toString('utf8'), function(err) {
        if(err) throw err;

        fs.appendFile(SOURCEFILE, Xsource, function(err) {
          if(err) throw err;

          if(quiet == undefined || quiet == false)
            console.log("Done writing");

          resolve();
        });
      });
    });
  });

  // executes compile on file
  promise.then(() => {
    if(quiet == undefined || quiet == false)
      console.log(COMPILECMD);

    exec(COMPILECMD, function(err, stdout, stderr) {
      if(err)
      {
        if(quiet == undefined || quiet == false)
        {
          console.log("Compile Failed");
          console.log("OUTPUT:");
          console.log(stdout.toString('utf8'));
          console.log(stderr.toString('utf8'));
        }
        rmdirRecursive(COMPILEDIR);
        callback({success: false, output:stdout.toString('utf8')});
        return Promise.resolve();
      }

      let stdoutstring = stdout.toString('utf8');

      if(quiet == undefined || quiet == false)
      {
        console.log("Compile Successful");
        console.log("STDOUT:" + stdoutstring);
      }

      let lines = stdoutstring.split("\n");
      let dataSectionStart = 3;
      let dataSectionEnd = 3;
      lines.forEach(function(line) {
        if(line.startsWith("data section:"))
        {
          let vals = line.substr(13).split(",");
          dataSectionStart = parseInt(vals[0]);
          dataSectionEnd = parseInt(vals[1]);
        }
      });

      var hexu = fs.readFileSync(COMPILEDIR + '/sim3').toString();
      var hexuArray = hexu.split(" ");

      var hexl = fs.readFileSync(COMPILEDIR + '/sim2').toString();
      var hexlArray = hexl.split(" ");

      //console.log(hexlArray + '\n');
      //console.log(hexuArray + '\n');

      rmdirRecursive(COMPILEDIR);

      callback({ success: true, output: stdout.toString('utf8'), u: hexuArray, l: hexlArray, dataStart: dataSectionStart, dataEnd: dataSectionEnd });
      return Promise.resolve();
    });
  });
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

module.exports.generateReadableCommand = function(str)
  {
    let cmd = str.charAt(0);
    let cmdstr = "????";

    switch (cmd)
    {
      case "0":
        cmdstr = "LDAM";
        break;
      case "1":
        cmdstr = "LDBM";
        break;
      case "2":
        cmdstr = "STAM";
        break;
      case "3":
        cmdstr = "LDAC";
        break;
      case "4":
        cmdstr = "LDBC";
        break;
      case "5":
        cmdstr = "LDAP";
        break;
      case "6":
        cmdstr = "LDAI";
        break;
      case "7":
        cmdstr = "LDBI";
        break;
      case "8":
        cmdstr = "STAI";
        break;
      case "9":
        cmdstr = "BR";
        break;
      case "A":
        cmdstr = "BRZ";
        break;
      case "B":
        cmdstr = "BRN";
        break;
      case "C":
        cmdstr = "BRB";
        break;
      case "D":
        cmdstr = "OPR";
        break;
      case "E":
        cmdstr = "PFIX";
        break;
      case "F":
        cmdstr = "NFIX";
        break;
      default:
    }

    return cmdstr;
  }

module.exports.disassemble = function(hexu, hexl, dataStart, dataEnd)
  {
    let labels = new HashMap();

    dataEnd = ((dataEnd - dataStart) * 2) + dataStart;

    disassemble_Internal(hexu, hexl, labels, dataStart, dataEnd);
    return disassemble_Internal(hexu, hexl, labels, dataStart, dataEnd);
  }

function disassemble_Internal(hexu, hexl, labels, dataStart, dataEnd)
{
  let outString = "";
  let opval = 0;
  let lineNo = 0;
  let isData = false;

  for(let i = 0; i < hexu.length; ++i)
  {
    for(let j = 0; j < 2; ++j)
    {
      if(labels.has(lineNo))
      {
        outString += labels.get(lineNo) + ":\n";
      }

      let val = (j == 0) ? hexl[i] : hexu[i];

      if(val == "") continue;

      let cmd = val.charAt(0);
      opval += parseInt(val.charAt(1), 16);

      if(isData || (lineNo > dataStart && lineNo < dataEnd && j == 0) || (lineNo >= 4 && lineNo <= 9))
      {
        if(!isData)
        {
          isData = true;
          outString += "DATA 0x" + val;

          if(lineNo == 4 && !labels.has(lineNo))
          {
            labels.set(lineNo, "sp");
          }
        }
        else
        {
          isData = false;
          outString += val + "\n";
        }
      }
      else if(cmd == "E" || cmd == "F")
      {
        opval = opval << 4;

        if(cmd == "F")
        {
          opval |= 0xff00;
        }
      }
      else
      {
        if(opval > 32767) opval = -(65536 - opval);

        if(cmd == "9")
        {
          let addr = lineNo + 1 + opval;
          let labelName = (labels.size == 0) ? "main_wrapper" : "label" + labels.size;

          if(labels.has(addr))
          {
            labelName = labels.get(addr);
          }
          else
          {
            if(labels.has(lineNo-1) && labels.get(lineNo-1) == "main_wrapper") labelName = "main";

            labels.set(addr, labelName);
          }

          outString += "BR " + labelName + "\n";
        }
        else if(cmd == "D")
        {
          let opname = opval + "?";

          if(opval == 0)  {
            opname = "ADD";
          } else if(opval == 1) {
            opname = "SUB";
          } else if(opval == 2) {
            opname = "IN";
          } else if(opval == 3) {
            opname = "OUT";
          }

          outString += module.exports.generateReadableCommand(val) + " " + opname + "\n";
        }
        else if(cmd == "0" || cmd == "1" || cmd == "2")
        {
          let labelName = opval + "";
          let addr = opval * 2;

          if(addr > dataStart && addr < dataEnd)
          {
            if(labels.has(addr))
            {
              labelName = labels.get(addr);
            }
            else
            {
              labelName = "label" + labels.size;
              labels.set(addr, labelName);
            }
          }

          outString += module.exports.generateReadableCommand(val) + " " + labelName + "\n";
        }
        else
        {
          outString += module.exports.generateReadableCommand(val) + " " + opval + "\n";
        }

        opval = 0;
      }

      lineNo++;
    }
  }

  return outString;
}
