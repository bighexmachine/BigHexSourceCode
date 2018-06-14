var sleep = require('sleep');

module.exports.writeToRam = function(hexu, hexl, gpioService){
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

    //process.stdout.write("\rINST:: upper:"+hexu[pc]+" lower:"+ hexl[pc] + " ("+parseInt(pc/(pcMax-1)*100)+"%) PC: "+pc+".");

    var inst_l = createLDACInstructions(hexu[pc], hexl[pc]); // instructions to load one nibble at a time (for each RAM)
    //var inst_l = createLDACInstructions("00", "00"); // write 00s to clear ram
    for(j = 0; j < inst_l.length; j++)
    { //loading nibble at a time
     gpioService.runInstruction( inst_l[j], false);
     totalInstructionCount++;
    }

    //process.stdout.write("\rINST:: upper:"+hexu[pc]+" lower:"+ hexl[pc] + " ("+parseInt(pc/(pcMax-1)*100)+"%) PC: "+pc+".");

    // store reg a to mem[pc]
    var inst_s = createLDAMInstructions(pc);
    for(j = 0; j < inst_s.length; j++)
    {
      gpioService.runInstruction( inst_s[j], false);
      totalInstructionCount++;
    }

  }
  console.log("\rFinished writing to RAM");
  console.log("Total Instructions Written : " + totalInstructionCount);

  gpioService.writeData( 0 );

  //turns off instruction from pi
  gpioService.selectRam();

  gpioService.resetClock();

}


function createLDACInstructions(hexu, hexl){
  var insts = new Array();

  insts[0] = (/*PFIX*/14 << 4) + (parseInt(hexu.charAt(0), 16));
  insts[1] = (/*PFIX*/14 << 4) + (parseInt(hexu.charAt(1), 16));
  insts[2] = (/*PFIX*/14 << 4) + (parseInt(hexl.charAt(0), 16));
  insts[3] = (/*LDAC*/3  << 4) + (parseInt(hexl.charAt(1), 16));

  return insts;
}

function createLDAMInstructions(num){
  var insts = [];

  insts.push((/*STAM*/2  << 4) + (num & 15));
  num = num >> 4;

  if(num != 0)
    insts.push((/*PFIX*/14 << 4) + (num & 15));

  num = num >> 4;

  if(num != 0)
    insts.push((/*PFIX*/14 << 4) + (num & 15));

  num = num >> 4;

  if(num != 0)
    insts.push((/*PFIX*/14 << 4) + (num & 15));

  insts.reverse();
  return insts;
}
