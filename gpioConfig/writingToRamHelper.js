var sleep = require('sleep');

module.exports.writeToRam = function(hexu, hexl, gpioService) {
  gpioService.resetClock();

  //enable instruction input on machine
  gpioService.selectPi();

  //going through every instruction
  console.log("Started writing to RAM");

  /*
  / it is length - 1 since the last element in the hex arrays are spaces
  / we didn't want to trim the spaces since in the case that the ram lower has more instructions than the higher,
  / its easiest to to parse the two spaces at the end of ram higher as instructions (which works because there is not error checking)
  / since a correct program never reads from this memory address then it is fine.
  */
  var pcMax = hexl.length-1;
  var totalInstructionCount = 0;

  for(pc = 0; pc < pcMax; pc++)
  {
    // load the instruction in to reg A

    //console.log("INST:: upper:"+hexu[pc]+" lower:"+ hexl[pc] + " ("+parseInt(pc/(pcMax-1)*100)+"%) PC: "+pc+" \n");

    var inst_l = createLDACInstructions(hexu[pc], hexl[pc]); // instructions to load one nibble at a time (for each RAM)
    //var inst_l = createLDACInstructions("00", "00"); // write 00s to clear ram
    for(j = 0; j < inst_l.length; j++)
    { //loading nibble at a time
     gpioService.runInstruction( inst_l[j], false);
     totalInstructionCount++;
    }

    //console.log("INST:: upper:"+hexu[pc]+" lower:"+ hexl[pc] + " ("+parseInt(pc/(pcMax-1)*100)+"%) PC: "+pc+" \n");

    // store reg a to mem[pc]
    var inst_s = createLDAMInstructions(pc);
    for(j = 0; j < inst_s.length; j++)
    {
      gpioService.runInstruction( inst_s[j], false);
      totalInstructionCount++;
    }

  }
  console.log("Finished writing to RAM");
  console.log("Total Instructions Written : " + totalInstructionCount);

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

  return createInstruction(3, value);
}

function createLDAMInstructions(num){
  return createInstruction(2, num);
}
