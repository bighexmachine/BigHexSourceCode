

module.exports = function (command, data) {
    console.log("Api called" + command + data);
    var gpioService = require('../gpioConfig/gpioService');
    var ramWriter = require('../gpioConfig/writingToRamHelper');
    var compiler = require('../gpioConfig/compiler');
    var assembler = require('../gpioConfig/assembler');

    var fs = require("fs");

    var lastCommand = "";
    console.log(formatSpeed(5));
    
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
    process.stdout.write( 'command recieved: ' + command );

    if(command === 'speed'){
        var clockSpeed = data;
        //clear the line
        process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r')
        process.stdout.write('command recieved: speed: ' + formatSpeed(clockSpeed));
        gpioService.setSpeed(clockSpeed);
    }
    else if(command === 'start'){
        gpioService.startClock();
    }
    else if(command === 'stop'){
        gpioService.stopClock();
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
        compiler.compile(xCode, console.log,
            function(hexuArray, hexlArray){
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });

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
        process.stdout.write('command recieved: run Instruction: ' + (instr>>4) + ' ' + (instr%4));
        gpioService.runInstruction(instr);
    }
    else if(command === 'getprog')
    {
        var prog = fs.readFileSync(__dirname + '/src/' + data).toString();
        process.stdout.write('command recieved: loadprog: ' + data);

        
    }
};
    function repeat(s,n) {
        if (n==0) { return '' }
        else { return s+repeat(s,n-1) }

    }

    function formatSpeed(speed) {
        if (speed < 10) {
            speed = Math.round(speed*10)/10;
            return speed + 'hz';
        } else if(speed <1000) {
            speed = Math.round(speed);
            return speed + 'hz';
        } else {
            var kspeed = Math.round(speed/100)/10;
            return kspeed + 'Khz';
        }
    }
