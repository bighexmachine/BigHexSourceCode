var gpioService = require('../gpioConfig/gpioService');
var ramWriter = require('../gpioConfig/writingToRamHelper');
var compiler = require('../gpioConfig/compiler');
var assembler = require('../gpioConfig/assembler');

var fs = require("fs");

module.exports = function (command, data) {

    var lastCommand = "";

    /*
     * If a GET request is made to /api we need to execute a command
     * to control the signals being send to the machine via i2c.
     */
     //a bit of logic so speed commands write on top of each other but no one else
    if (command === 'speed' && lastCommand === 'speed') {
        process.stdout.write('\r');
    } else {
        process.stdout.write('\n');
    }

    lastCommand = command;
    process.stdout.write( 'command recieved: ' + command + "\n");

    if(command === 'speed'){
        var clockSpeed = data;
        //clear the line
        process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r')
        process.stdout.write('command recieved: speed: ' + formatSpeed(clockSpeed) + '\n');
        gpioService.setSpeed(clockSpeed);
    }
    else if(command === 'start'){
        gpioService.startClock();
    }
    else if(command === 'stop'){
        gpioService.stopClock();
    }
    else if(command == 'isrunning'){
      return gpioService.isClockRunning();
    }
    else if(command === 'step'){
        gpioService.stepClock();
    }
    else if(command === 'reset'){
        gpioService.resetClock();
    }
    else if (command === 'load') {
        var xCode = data;
        console.log("Recieved Code");
        var result = compiler.compile(xCode);

        if(result.success)
        {
          ramWriter.writeToRam(result.u, result.l, gpioService);
          return JSON.stringify({keys:[]});
        }
        else
        {
          let errors = compiler.parseCompileErrors(result.output);
          return JSON.stringify(errors);
        }
    }
    else if(command === 'compile') {
      var xCode = data;
      console.log("Recieved Code");
      var result = compiler.compile(xCode);

      if(result.success)
      {
        return JSON.stringify({keys:[]});
      }
      else
      {
        let errors = compiler.parseCompileErrors(result.output);
        return JSON.stringify(errors);
      }
    }
    else if (command === 'loadassembly') {
        var assembly = data;
        console.log("Recieved Assembly: "+assembly);
        assembler.assemble(assembly, console.log,
            function(hexuArray, hexlArray){
                hexuArray.push("  ");
                hexlArray.push("  ");
                console.log(hexuArray); console.log( hexlArray);
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });
    }
    else if (command === 'screen') {
        console.log("Recieved Screen Command");
        compiler.runScreenTest(
            function(hexuArray, hexlArray){
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });
    }
    else if(command === 'runInstr') {
        var instr = parseInt(data);
        process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r');
        process.stdout.write('command recieved: run Instruction: ' + (instr>>4) + ' ' + (instr & 0x00f));
        gpioService.runInstruction(instr);
    }
    else if(command === 'runTestCmd') {
      runTestCmd(data.suite, data.testID);
    }
    else if(command === 'getprog') {
        var prog = fs.readFileSync('./xPrograms/' + data).toString();
        process.stdout.write('command recieved: loadprog: ' + data);
        return prog;
    }
    return "";
};

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
      module.exports('step', undefined)
    }
    else if(parts[0] == "RESET")
    {
      module.exports('reset', undefined);
    }
    else if(parts[0] == "SPEED")
    {
      let val = parseFloat(parts[1]);
      module.exports('speed', val);
    }
    else if(parts[0] == "START")
    {
      module.exports('start', undefined);
    }
    else if(parts[0] == "STOP")
    {
      module.exports('stop', undefined);
    }
    else
    {
      let instr = parseInt(parts[0]);
      let opr = parseInt(parts[1]);

      module.exports('runInstr', (instr << 4) + opr);
    }

    ++idx;
  }

}

function repeat(s,n) {
    if (n==0) {
        return ''
    }
    else {
	let result = s;
	for(let i = 0; i < n-1; ++i)
	{
		result = result + s;
	}
	return result;
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
