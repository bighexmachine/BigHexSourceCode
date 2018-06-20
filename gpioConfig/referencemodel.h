#ifndef REFERENCEMODEL_H
#define REFERENCEMODEL_H

#include <stdio.h>
#include <stdint.h>

//bit width of the reference model machine, signed and unsigned
typedef uint16_t uword_t;
typedef int16_t word_t;

enum class RAM_PI_SELECT : uint8_t
{
  RAM = 0,
  PI
};

enum class ClockPhase : uint8_t
{
  FETCH = 0,
  INC_PC = 1,
  EXE = 2,
  DISPLAY = 3
};

enum class OpCode : uint8_t
{
  LDAM = 0,
  LDBM = 1,
  STAM = 2,

  LDAC = 3,
  LDBC = 4,
  LDAP = 5,

  LDAI = 6,
  LDBI = 7,
  STAI = 8,

  BR = 9,
  BRZ = 10,
  BRN = 11,
  BRB = 12,

  OPR = 13,

  PFIX = 14,
  NFIX = 15
};

// Reference model for 16 bit hex machine
class ReferenceModel
{

public:
  ReferenceModel();
  virtual ~ReferenceModel();

  // main syncronous update function of the machine
  void UpdateClock(bool Phase0Clock, bool Phase0Reset, bool Phase1Clock, bool Phase1Reset);
  void SetRamPiSelect(bool selectRam);
  void SetPiDataInput(uint8_t input);

  void PrintDisplay();
  void PrintMemory(int max);

protected:

  void DoFetchPhase();
  void DoIncPCPhase();
  void DoExePhase();
  void DoDisplayPhase();

  void DoOPR();

private:
  // functions to take account of the missing top bit
  inline uword_t GetMem(uword_t addr) const
  {
    return mem[addr & 0x7fff];
  }

  inline void SetMem(uword_t addr, uword_t val)
  {
    mem[addr & 0x7fff] = val;
  }

  //memory ptr
  uword_t* mem;

  uint8_t phase0clock;
  uint8_t phase1clock;

  // registers
  uword_t a_reg;
  uword_t b_reg;
  uword_t op_reg;

  //program counter
  uword_t pc;

  //function register
  OpCode fn_reg;

  // whether we read from ram or the pi
  RAM_PI_SELECT ram_pi_sel;

  // PI instrction input
  uint8_t pi_instr_input;

};

#endif
