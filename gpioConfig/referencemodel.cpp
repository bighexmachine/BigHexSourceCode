#include "referencemodel.h"

#include <math.h>
#include <stdlib.h>

namespace
{
  const char* bit_rep[16] = {
      "0000", "0001", "0010", "0011",
      "0100", "0101", "0110", "0111",
      "1000", "1001", "1010", "1011",
      "1100", "1101", "1110", "1111" };

  void print_bits(uint16_t val)
  {
    printf("%s%s%s%s\n", bit_rep[val >> 12], bit_rep[(val >> 8) & 0x0F], bit_rep[(val >> 4) & 0x0F], bit_rep[val & 0x0F]);
  }
}


ReferenceModel::ReferenceModel() :
  phase0clock(0), phase1clock(0), a_reg(0), b_reg(0), op_reg(0), pc(0), fn_reg(OpCode::LDAM),
  ram_pi_sel(RAM_PI_SELECT::RAM), pi_instr_input(0)
{
  mem = (uword_t*)malloc(pow(2, sizeof(uword_t) * 8) * sizeof(uword_t));
}

ReferenceModel::~ReferenceModel()
{
  free(mem);
}

void ReferenceModel::UpdateClock(bool Phase0Clock, bool Phase0Reset, bool Phase1Clock, bool Phase1Reset)
{
  //update our two clock values
  if(Phase1Clock)
  {
    phase1clock = phase0clock;
  }
  else if(Phase1Reset)
  {
    phase1clock = 0;
  }

  if(Phase0Clock)
  {
    phase0clock = phase1clock + 1;
    if(phase0clock > 15)
    {
      phase0clock = 0;
    }
  }
  else if(Phase0Reset)
  {
    phase0clock = 0;
    a_reg = 0;
    b_reg = 0;
    pc = 0;
    op_reg = 0;
    return;
  }

  // only update when latching
  if(!Phase0Clock) return;

  ClockPhase machinePhase = (ClockPhase)(phase1clock % 4);

  switch (machinePhase) {
    case ClockPhase::FETCH:
      DoFetchPhase();
      break;
    case ClockPhase::INC_PC:
      DoIncPCPhase();
      break;
    case ClockPhase::EXE:
      DoExePhase();
      break;
    case ClockPhase::DISPLAY:
      //DoDisplayPhase();
      break;
    default:
      break;
  }
}

void ReferenceModel::SetRamPiSelect(bool selectRam)
{
  ram_pi_sel = selectRam ? RAM_PI_SELECT::RAM : RAM_PI_SELECT::PI;
}

void ReferenceModel::SetPiDataInput(uint8_t input)
{
  pi_instr_input = input;
}


void ReferenceModel::DoFetchPhase()
{
  uint8_t instr;
  uint8_t op;

  if(ram_pi_sel == RAM_PI_SELECT::RAM)
  {
    uword_t raw_mem_val = mem[(pc >> 1)];
    uint8_t selectedByte;

    if((pc & 1) == 1)
      selectedByte = (raw_mem_val & 0x00ff);
    else
      selectedByte = (raw_mem_val & 0xff00) >> 8;

    instr = (selectedByte & 0xf0) >> 4;
    op = (selectedByte & 0x0f);
  }
  else
  {
    instr = (pi_instr_input & 0xf0) >> 4;
    op = (pi_instr_input & 0x0f);
  }

  op_reg &= 0xfff0;
  op_reg += op;

  fn_reg = (OpCode)instr;
}

void ReferenceModel::DoIncPCPhase()
{
  ++pc;
}

void ReferenceModel::DoExePhase()
{
  switch (fn_reg)
  {
    case OpCode::LDAM:
      //printf("LDAM %04x\n", op_reg);
      a_reg = mem[op_reg];
      break;
    case OpCode::LDBM:
      //printf("LDBM %04x\n", op_reg);
      b_reg = mem[op_reg];
      break;
    case OpCode::STAM:
      //printf("STAM %04x\n", op_reg);
      mem[op_reg] = a_reg;
      break;
    case OpCode::LDAC:
      //printf("LDAC %04x\n", op_reg);
      a_reg = op_reg;
      break;
    case OpCode::LDBC:
      //printf("LDBC %04x\n", op_reg);
      b_reg = op_reg;
      break;
    case OpCode::LDAP:
      //printf("LDAP %04x\n", op_reg);
      a_reg = pc + op_reg;
      break;
    case OpCode::LDAI:
      //printf("LDAI %04x\n", op_reg);
      a_reg = mem[a_reg + op_reg];
      break;
    case OpCode::LDBI:
      //printf("LDBI %04x\n", op_reg);
      b_reg = mem[b_reg + op_reg];
      break;
    case OpCode::STAI:
      //printf("STAI %04x\n", op_reg);
      mem[b_reg + op_reg] = a_reg;
      break;
    case OpCode::BR:
      //printf("BR %04x\n", op_reg);
      pc = pc + op_reg;
      break;
    case OpCode::BRZ:
      //printf("BRZ %04x\n", op_reg);
      if(a_reg == 0) pc = pc + op_reg;
      break;
    case OpCode::BRN:
      //printf("BRN %04x\n", op_reg);
      if((word_t)a_reg < 0) pc = pc + op_reg;
      break;
    case OpCode::BRB:
      //printf("BRB %04x\n", op_reg);
      pc = b_reg + op_reg;
      break;
    case OpCode::OPR:
      //printf("OPR %04x\n", op_reg);
      DoOPR();
      break;
    case OpCode::PFIX:
      //printf("PFIX %04x\n", op_reg & 0xf);
      op_reg = op_reg << 4;
      break;
    case OpCode::NFIX:
      //printf("NFIX %04x\n", op_reg & 0xf);
      op_reg = 0xff00 | (op_reg << 4);
      break;
  }

  if(fn_reg != OpCode::PFIX && fn_reg != OpCode::NFIX)
  {
    op_reg = 0;
  }
}

void ReferenceModel::DoDisplayPhase()
{
  const int displayOffset = 32752;

  for(int i = 0; i < 16; ++i)
  {
    uword_t val = mem[displayOffset + 15 - i];
    print_bits(val);
  }
}

void ReferenceModel::DoOPR()
{
  if(op_reg == 0)
  {
    a_reg = a_reg + b_reg;
  }
  else if(op_reg == 1)
  {
    a_reg = a_reg - b_reg;
  }
  // TODO: Implement IN and OUT
}
