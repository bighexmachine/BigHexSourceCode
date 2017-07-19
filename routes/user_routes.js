var path = require('path');
const apifunc = require('../public/api.js');


module.exports = function (app) {

    /**
     * html files
     */

    app.get('/', function (req, res) {
        console.log("get request to homepage");
        res.sendFile('gui.html', {root: './public'});
    });

    app.get('/loadprogram', function(req, res) {
    	res.sendFile('loadprogram.html', {root: './public'});
    });

    app.get('/runInstruction', function(req, res) {
        res.sendFile('runInstruction.html', {root: './public'});
    });

    app.get('/loadassembly', function(req, res) {
        res.sendFile('loadassembly.html', {root: './public'});
    });

    /**
     * js files
     */

    app.get('/resources/scripts.js', function(req, res) {
        res.sendFile('resources/scripts.js', {root: './public'});
    });

    app.get('/resources/loadProgramScript.js', function(req, res) {
        res.sendFile('resources/loadProgramScript.js', {root: './public'});
    });

    app.get('/resources/loadassemblyScript.js', function(req, res) {
        res.sendFile('resources/loadassemblyScript.js', {root: './public'});
    });

    app.get('/resources/styles.css', function(req, res) {
        res.sendFile('resources/styles.css', {root: './public'});
    });

    app.get('/resources/bootstrap.min.css', function(req, res) {
        res.sendFile('resources/bootstrap.min.css', {root: './public'});
    });

    app.get('/resources/bootstrap.min.js', function(req, res) {
        res.sendFile('resources/bootstrap.min.js', {root: './public'});
    });

    app.get('/resources/jquery.js', function(req, res) {
        res.sendFile('resources/jquery.js', {root: './public'});
    });

    //pdf
    app.get('/assemblySpec.pdf', function(req, res) {
        res.sendFile('assemblySpec.pdf', {root: './public'});
    });

    app.get('/api', function (req, res) {
        var comm = req.query.command;
        var data = req.query.data;
        apifunc(comm, data);
    });
};



var lastCommand = "";

/*
 * If a GET request is made to /api we need to execute a command
 * to control the signals being send to the machine via i2c.
 */
app.get('/api',
    function(req, res){

        var command = req.query.command;
        //a bit of logic so speed commands write on top of each other but no one else
        if (command == 'speed' && lastCommand == 'speed') {
          process.stdout.write('\r');
        } else {
          process.stdout.write('\n');
        }
        lastCommand = command;
        process.stdout.write( 'command recieved: ' + command );

				if(command == 'speed'){
					clockSpeed = req.query.data;
					//clear the line
					process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r')
			                process.stdout.write('command recieved: speed: ' + formatSpeed(clockSpeed));
					gpioService.setSpeed(clockSpeed);
				}
				else if(req.query.command == 'start'){
					gpioService.startClock();
				}
				else if(req.query.command == 'stop'){
					gpioService.stopClock();
				}
				else if(req.query.command == 'step'){
					gpioService.stepClock();
				}
				else if(req.query.command == 'reset'){
					gpioService.resetClock();
				}
				else if (req.query.command == 'load') {
					var xCode = req.query.data;
					console.log("Recieved Code");
					compiler.compile(xCode, console.log,
						function(hexuArray, hexlArray){
							ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
						});

				}
        else if (req.query.command == 'loadassembly') {
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
				else if (req.query.command == 'screen') {
					console.log("Recieved Screen Command");
					compiler.runScreenTest(
						function(hexuArray, hexlArray){
							ramWriter.writeToRam(hexuArray, hexlArray, gpioService);
						});
				}
			  else if(req.query.command == 'runInstr') {
					var instr = parseInt(req.query.data);
			                process.stdout.write('\r'+repeat(' ', process.stdout.columns)+'\r')
			                process.stdout.write('command recieved: run Instruction: ' + (instr>>4) + ' ' + (instr%4));
					gpioService.runInstruction(instr);
			  }
				else if(req.query.command == 'getprog')
				{
					var prog = fs.readFileSync(__dirname + '/src/' + req.query.data).toString();
					process.stdout.write('command recieved: loadprog: ' + req.query.data);

					res.end(prog);
				}
			res.end(); //make sure the response is actually executed! Otherwise the server will fall over after 8 commands are made!
    }
);

function repeat(s,n)
{
  if (n==0) { return '' }
  else { return s+repeat(s,n-1) }

}

function formatSpeed(speed)
{
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

gpioService.setSpeed(1);
//Initalize the web server to listen on port 80
var server = app.listen(80);
console.log("Node js Web server started on port 80 (default)");
