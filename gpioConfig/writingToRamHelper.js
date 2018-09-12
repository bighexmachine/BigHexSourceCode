var sleep = require('sleep');
var Aval = undefined;

module.exports.writeToRam = function(hexu, hexl, gpioService) {
  gpioService.resetClock();

  //enable instruction input on machine
  gpioService.selectPi();

  var pcMax = Math.min(hexl.length, hexu.length);
  var inst = [];

  for(let pc = 0; pc < pcMax; pc++)
  {
    inst = inst.concat(createLDACInstructions(hexu[pc], hexl[pc])); // load the instructions into the A register
    inst = inst.concat(createLDAMInstructions(pc)); // store reg a to mem[pc]
  }

  console.log("Total Instructions : " + inst.length);
  console.log("Started writing to RAM");

  for(let i = 0; i < inst.length; i++)
  {
    gpioService.runInstruction( inst[i], false);
    sleep.usleep(5000);
  }

  console.log("Finished writing to RAM");

  gpioService.writeData( 0 );

  //turns off instruction from pi
  gpioService.selectRam();

  gpioService.resetClock();
}

function createInstruction(opcode, operand)
{
  var insts = [];

  var operand0 = operand & 15;

  operand = operand >> 4;
  var operand1 = operand & 15;

  operand = operand >> 4;
  var operand2 = operand & 15;

  operand = operand >> 4;
  var operand3 = operand & 15;

  insts.push((opcode << 4) + operand0);

  if(operand2 == 15 && operand3 == 15)
  {
    // use NFIX
    insts.push((15 << 4) + operand1);
  }
  else if(operand3 == 15)
  {
    // use NFIX and a single PFIX
    insts.push((14 << 4) + operand1);
    insts.push((15 << 4) + operand2);
  }
  else
  {
    //use a sequence of prefixes
    if(operand3 != 0 || operand2 != 0 || operand1 != 0)
    {
      insts.push((14 << 4) + operand1);
    }

    if(operand3 != 0 || operand2 != 0)
    {
      insts.push((14 << 4) + operand2);
    }

    if(operand3 != 0)
    {
      insts.push((14 << 4) + operand3);
    }
  }

  return insts.reverse();
}


function createLDACInstructions(hexu, hexl) {
  var value = parseInt(hexu.charAt(0), 16);

  value = value << 4;
  value += parseInt(hexu.charAt(1), 16);

  value = value << 4;
  value += parseInt(hexl.charAt(0), 16);

  value = value << 4;
  value += parseInt(hexl.charAt(1), 16);

  if(value===Aval)
  {
    return [];
  }
  else
  {
    Aval = value;
    return createInstruction(3, value);
  }
}

function createLDAMInstructions(num){
  return createInstruction(2, num);
}
