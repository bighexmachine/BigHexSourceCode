var gpioService = require('../gpioConfig/gpioService');
var compiler = require('../gpioConfig/compiler');
var assembler = require('../gpioConfig/assembler');
var ramWriter = require('../gpioConfig/writingToRamHelper');
const { fork } = require('child_process');

var fs = require("fs");

var isWritingToRAM = false;

module.exports.isCommandRestricted = function(command) {
  if(command == "compile" || command == "getasm" || command == "getprog") return false;
  return true;
}

module.exports.execute = function (command, data) {
    console.log( 'command recieved: ' + command + "\n");

    if(command === 'speed')
    {
        var clockSpeed = data;
        console.log('command recieved: speed: ' + formatSpeed(clockSpeed) + '\n');
        gpioService.setSpeed(clockSpeed);
    }
    else if(command === 'start' && !isWritingToRAM)
    {
      gpioService.startClock();
    }
    else if(command === 'stop' && !isWritingToRAM)
    {
      gpioService.stopClock();
    }
    else if(command == 'isrunning')
    {
      return gpioService.isClockRunning();
    }
    else if(command === 'step' && !isWritingToRAM)
    {
      let count = (data == undefined || isNaN(data) || data > 999 || data < 1) ? 1 : data;

      for(let i = 0; i < count; ++i)
      {
        gpioService.stepClock();
      }
    }
    else if(command === 'reset' && !isWritingToRAM)
    {
        gpioService.resetClock();
    }
    else if (command === 'load' && !isWritingToRAM)
    {
        var xCode = data;
        console.log("Loading Code");

        return new Promise((resolve, reject) => {
          compiler.compile(xCode, function(result) {
            if(result.success)
            {
              WriteToRam(result.u, result.l, gpioService, function() {
                resolve(JSON.stringify({keys:[]}));
              });
            }
            else
            {
              resolve(JSON.stringify(compiler.parseCompileErrors(result.output)));
            }
          });
        });
    }
    else if(command === 'compile') {
      var xCode = data;
      console.log("Compiling Code");

      return new Promise((resolve, reject) => {
        compiler.compile(xCode, function(result) {
          if(result.success)
          {
            resolve(JSON.stringify({keys:[]}));
          }
          else
          {
            let errors = compiler.parseCompileErrors(result.output);
            resolve(JSON.stringify(errors));
          }
        });
      });
    }
    else if(command === 'getasm') {
      var xCode = data;
      console.log("Generating ASM");
      return new Promise((resolve, reject) => {
        compiler.compile(xCode, function(result) {
          if(result.success)
          {
            resolve(compiler.disassemble(result.u, result.l, result.dataStart, result.dataEnd));
          }
          else
          {
            let errors = compiler.parseCompileErrors(result.output);
            resolve(JSON.stringify(errors));
          }
        });
      });

    }
    else if (command === 'loadassembly' && !isWritingToRAM) {
        var assembly = data;
        console.log("Recieved Assembly: "+assembly);
        return new Promise((resolve, reject) => {
          assembler.assemble(assembly, console.log,
              function(hexuArray, hexlArray){
                  hexuArray.push("  ");
                  hexlArray.push("  ");
                  console.log(hexuArray); console.log( hexlArray);
                  WriteToRam(hexuArray, hexlArray, gpioService, function() {
                    resolve("Done");
                  });
              });
        });
    }
    else if(command === 'runInstr' && !isWritingToRAM) {
        var instr = parseInt(data);
        console.log('command recieved: run Instruction: ' + (instr>>4) + ' ' + (instr & 0x00f) + '\n');
        gpioService.runInstruction(instr);
    }
    else if(command === 'runTestCmd' && !isWritingToRAM)
    {
      runTestCmd(data.suite, data.testID);
    }
    else if(command === 'getprog')
    {
        console.log('command recieved: loadprog: ' + data);

        return new Promise((resolve, reject) => {
          fs.readFile('./xPrograms/' + data, function(err, data) {
            if(err == null)
              resolve(data.toString())
            else
              reject(err);
          });
        });
    }

    return Promise.resolve({success: true});
};

function WriteToRam(hexuArray, hexlArray, gpioService, callback)
{
  isWritingToRAM = true;
  ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
  isWritingToRAM = false;
  callback();
}

function runTestCmd(suiteName, testID)
{
  var suiteText = fs.readFileSync('./public/resources/' + suiteName).toString();
  var suite = JSON.parse(suiteText);

  var cmds = [];

  if(testID == 'pre')
  {
    cmds = suite.preTest;
  }
  else
  {
    cmds = suite.tests[testID].cmds;
  }

  var running = true;
  var idx = 0;
  while(running)
  {
    if(idx >= cmds.length)
    {
      running = false;
      break;
    }

    let cmd = cmds[idx];
    let parts = cmd.split(" ");
    if(parts[0] == "SKIP")
    {
      module.exports.execute('step', undefined)
    }
    else if(parts[0] == "RESET")
    {
      module.exports.execute('reset', undefined);
    }
    else if(parts[0] == "SPEED")
    {
      let val = parseFloat(parts[1]);
      module.exports.execute('speed', val);
    }
    else if(parts[0] == "START")
    {
      module.exports.execute('start', undefined);
    }
    else if(parts[0] == "STOP")
    {
      module.exports.execute('stop', undefined);
    }
    else
    {
      let instr = parseInt(parts[0]);
      let opr = parseInt(parts[1]);

      module.exports.execute('runInstr', (instr << 4) + opr);
    }

    ++idx;
  }

}

function formatSpeed(speed) {
    if (speed < 10) {
        speed = Math.round(speed*10)/10;
        return speed + 'hz';
    }
    else if(speed <1000) {
        speed = Math.round(speed);
        return speed + 'hz';
    }
    else {
        var kspeed = Math.round(speed/100)/10;
        return kspeed + 'Khz';
    }
}
