var sleep = require('sleep');

var gpioServiceLibrary = require('bindings')('gpioService');

var gpioServiceLibraryObj = new gpioServiceLibrary.MyObject();

module.exports.startClock = function(){
    gpioServiceLibraryObj.startClock();
};

module.exports.stopClock = function(){
    gpioServiceLibraryObj.stopClock();
};

module.exports.setSpeed = function(speed){
    gpioServiceLibraryObj.setSpeed(speed);
};

module.exports.stepClock = function(){
    gpioServiceLibraryObj.stepClock();
};

module.exports.isClockRunning = function(){
    return gpioServiceLibraryObj.isClockRunning();
};

module.exports.resetClock = function(){
    gpioServiceLibraryObj.reset();
};

module.exports.selectRam = function(){
    gpioServiceLibraryObj.ramPiSel(0);
};

module.exports.selectPi = function(){
    gpioServiceLibraryObj.ramPiSel(1);
};

module.exports.writeData = function(pattern){
    gpioServiceLibraryObj.writeData(pattern);
};

module.exports.runInstruction = function(instr, switchInputs){
    if(switchInputs == undefined || switchInputs)
    {
      module.exports.selectPi();
      switchInputs = true;
    }

    module.exports.writeData(instr);

    sleep.usleep(400);

    for (i=0; i<16; i++)
    {
        module.exports.stepClock();
        sleep.usleep(100);
    }

    if(switchInputs)
      module.exports.selectRam();
};
