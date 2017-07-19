

module.exports = function (comm, data) {
    console.log("Api called" + comm + data);
    //var gpioService = require('../gpioConfig/gpioService');
    var fs = require("fs");

    var lastCommand = "";
    console.log(formatSpeed(5));
    /*
     * If a GET request is made to /api we need to execute a command
     * to control the signals being send to the machine via i2c.
     */
     //a bit of logic so speed commands write on top of each other but no one else
    if (comm === 'speed' && lastCommand === 'speed') {
        process.stdout.write('\r');
    } else {
        process.stdout.write('\n');
    }
    lastCommand = command;
    process.stdout.write( 'command recieved: ' + command );

    if(command === 'speed'){
        clockSpeed = req.query.data;
        //clear the line
        process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r')
        process.stdout.write('command recieved: speed: ' + formatSpeed(clockSpeed));
        gpioService.setSpeed(clockSpeed);
    }
    else if(req.query.command === 'start'){
        gpioService.startClock();
    }
    else if(req.query.command === 'stop'){
        gpioService.stopClock();
    }
    else if(req.query.command === 'step'){
        gpioService.stepClock();
    }
    else if(req.query.command === 'reset'){
        gpioService.resetClock();
    }
    else if (req.query.command === 'load') {
        var xCode = req.query.data;
        console.log("Recieved Code");
        compiler.compile(xCode, console.log,
            function(hexuArray, hexlArray){
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });

    }
    else if (req.query.command === 'loadassembly') {
        var assembly = req.query.data;
        console.log("Recieved Assembly: "+assembly);
        assembler.assemble(assembly, console.log,
            function(hexuArray, hexlArray){
                hexuArray.push("  ");
                hexlArray.push("  ");
                console.log(hexuArray); console.log( hexlArray);
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });
    }
    else if (req.query.command === 'screen') {
        console.log("Recieved Screen Command");
        compiler.runScreenTest(
            function(hexuArray, hexlArray){
                ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
            });
    }
    else if(req.query.command === 'runInstr') {
        var instr = parseInt(req.query.data);
        process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r');
        process.stdout.write('command recieved: run Instruction: ' + (instr>>4) + ' ' + (instr%4));
        gpioService.runInstruction(instr);
    }
    else if(req.query.command === 'getprog')
    {
        var prog = fs.readFileSync(__dirname + '/src/' + req.query.data).toString();
        process.stdout.write('command recieved: loadprog: ' + req.query.data);

        
    };
}
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

    //gpioService.setSpeed(1);
