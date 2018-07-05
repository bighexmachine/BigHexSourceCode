// Copy of GDB but for X programs

#include <stdio.h>
#include <iostream>
#include <vector>
#include <signal.h>

#include "../gpioConfig/referencemodel.h"

using namespace std;

const char* stdlibPath = "./xCompiler/stdlib.x";
const char* intermediatePath = "./xdb/source.x";
const char* sim2Path = "./xdb/sim2";
const char* sim3Path = "./xdb/sim3";
const char* compilerCmd = "cd ./xCompiler/ && ./a.out -d=../xdb/ < ../xdb/source.x";

bool debugging = true;
volatile bool programRunning = false;
ReferenceModel* machine = NULL;
vector<int> breakpoints;

void printhelp();
int loadfile(const char* filename);
void startdebugging();
void signalHandler(int signal);

int main(int argc, const char** argv)
{
  if(argc != 2)
  {
    printhelp();
    return 0;
  }

  cout << endl << "Initialising debugger..." << endl;

  machine = new ReferenceModel();
  if(loadfile(argv[1]) != 0)
  {
    cout << "Failed to initialise" << endl;
    return 1;
  }

  signal(SIGINT, signalHandler);

  cin.unsetf(std::ios::dec);
  cin.unsetf(std::ios::hex);
  cin.unsetf(std::ios::oct);

  startdebugging();
  return 0;
}

void signalHandler(int signal)
{
  if(programRunning)
  {
    programRunning = false;
  }
  else
  {
    exit(0);
  }
}


void printhelp()
{
  cout << "XDB - Debugger for X Programs" << endl;
  cout << "Usage:" << endl;
  cout << "xdb [program.x]" << endl;
}

int getval(char c)
{
  if(c >= '0' && c <= '9') return c - '0';
  else if(c >= 'A' && c <= 'F') return 10 + c - 'A';
  else if(c >= 'a' && c <= 'a') return 10 + c - 'a';

  return 0;
}

int loadfile(const char* filename)
{
  FILE* slfp = fopen(stdlibPath, "r");
  FILE* cfp = fopen(filename, "r");
  FILE* ifp = fopen(intermediatePath, "w");

  if(slfp == NULL)
  {
    cout << "Unable to open file " << stdlibPath << endl;
    return 1;
  }
  else if(cfp == NULL)
  {
    cout << "Unable to open file " << filename << endl;
    return 1;
  }
  else if(ifp == NULL)
  {
    cout << "Unable to open file " << intermediatePath << endl;
    return 1;
  }

  char c = EOF;

  c = fgetc(slfp);
  while (c != EOF)
  {
    fputc(c, ifp);
    c = fgetc(slfp);
  }
  fclose(slfp);

  c = fgetc(cfp);
  while (c != EOF)
  {
    fputc(c, ifp);
    c = fgetc(cfp);
  }
  fclose(cfp);

  fclose(ifp);

  cout << "Compiling code..." << endl;

  // Run the compiler
  if(system(compilerCmd) != 0)
  {
    cout << "Compiler Errors, see above" << endl;
    return 1;
  }

  cout << "Uploading to simulator..." << endl;

  // Write to reference model RAM
  FILE* sim2fp = fopen(sim2Path, "r");
  FILE* sim3fp = fopen(sim3Path, "r");

  if(sim2fp == NULL)
  {
    cout << "Unable to read file " << sim2Path << endl;
    return 1;
  }
  else if(sim3fp == NULL)
  {
    cout << "Unable to read file " << sim3Path << endl;
    return 1;
  }

  machine->UpdateClock(false, true, false, true);

  uword_t pc = 0;
  char uc = fgetc(sim2fp);
  while(uc != EOF)
  {
    char uc2 = fgetc(sim2fp);
    char lc = fgetc(sim3fp);
    char lc2 = fgetc(sim3fp);

    machine->SetMem(pc, (getval(lc) << 12) + (getval(lc2) << 8) + (getval(uc) << 4) + getval(uc2) );

    fgetc(sim2fp); fgetc(sim3fp);
    uc = fgetc(sim2fp);

    pc += 1;
  }

  machine->UpdateClock(false, true, false, true);

  fclose(sim2fp);
  fclose(sim3fp);


  cout << "Ready!" << endl << endl;

  return 0;
}


void printi(uword_t instr)
{
  switch(instr)
  {
  case 0:
    cout << "LDAM";
    break;
  case 1:
    cout << "LDBM";
    break;
  case 2:
    cout << "STAM";
    break;
  case 3:
    cout << "LDAC";
    break;
  case 4:
    cout << "LDBC";
    break;
  case 5:
    cout << "LDAP";
    break;
  case 6:
    cout << "LDAI";
    break;
  case 7:
    cout << "LDBI";
    break;
  case 8:
    cout << "STAI";
    break;
  case 9:
    cout << "BR  ";
    break;
  case 10:
    cout << "BRZ ";
    break;
  case 11:
    cout << "BRN ";
    break;
  case 12:
    cout << "BRB ";
    break;
  case 13:
    cout << "OPR ";
    break;
  case 14:
    cout << "PFIX";
    break;
  case 15:
    cout << "NFIX";
    break;
  default:
    cout << "????";
    break;
  }
}

void printdisassembly()
{
  uword_t mpc = machine->GetPCReg();

  // start disassembly a little before the current instruction
  uword_t ipc = mpc;
  if(ipc > 1) ipc -= 2;
  else if(ipc > 0) ipc -= 1;

  for(int pc = ipc; pc < (ipc + 6); ++pc)
  {
    uword_t mem = machine->GetMem(pc >> 1);

    if(pc % 2 == 1)
    {
      mem = (mem >> 8);
    }

    mem &= 0x00ff;

    if(pc == mpc)
    {
      cout << "->";
    }
    else
    {
      cout << "  ";
    }

    printf("%04x  ", pc);
    printi((mem & 0xf0) >> 4);
    printf(" %04x\n", mem & 0x0f);
  }
}

// returns true if a break point was hit
bool singleStep()
{
  OpCode fn;
  word_t op;

  for(int i = 0; i < 4; i++)
  {
    machine->UpdateClock(true,  false, false, false);
    machine->UpdateClock(false, false, false, false);
    machine->UpdateClock(false, false, true,  false);
    machine->UpdateClock(false, false, false, false);

    if(i == 0)
    {
      fn = machine->GetFNReg();
      op = (word_t)machine->GetOReg();
    }
  }

  uword_t pc = machine->GetPCReg();

  if(fn == OpCode::BR && op == -2)
  {
    printf("STOP detected. Addr 0x%04x\n", pc);
    return true;
  }

  //Check for any breakpoints that have been hit

  for(int addr : breakpoints)
  {
    if(addr == pc)
    {
      printf("Breakpoint hit! Addr 0x%04x\n", addr);
      return true;
    }
  }

  return false;
}

void continueProg()
{
  programRunning = true;
  while(!singleStep() && programRunning) {}
  if(programRunning)
  {
    programRunning = false;
  }
  else
  {
    cout << "Manual breakpoint hit!" << endl << "Type \'quit\' if you wish to exit the debugger" << endl;
  }
}

char toLower(char c)
{
  if(c >= 'A' && c <= 'Z') return (c - 'A') + 'a';
  return c;
}

void runcommand(const std::string& input)
{
  char cmd = toLower(input[0]);

  if(cmd == 'h')
  {
    cout << endl << "Debugger Commands:" << endl;
    cout << "  break add [addr]           - adds a breakpoint at the specified address" << endl;
    cout << "  break data [addr](,addrmax)- adds a data breakpoint at the address or address range" << endl;
    cout << "  break list                 - lists all breakpoints" << endl;
    cout << "  break remove [id]          - removes the specified breakpoint using its #id" << endl;
    cout << "  run                        - starts execution from the beginning" << endl;
    cout << "  continue                   - continues paused execution" << endl;
    cout << "  step                       - executes one instruction then pauses again" << endl;
    cout << "  quit                       - exits this program" << endl;
    cout << "  help                       - prints debugger commands" << endl;
    cout << "  print [addr](,addrmax)     - prints this area of memory" << endl;
    cout << "  regs                       - prints the values of all registers" << endl;
    cout << "  disassemble                - disassembles the local commands and prints them" << endl;
    cout << endl;
  }
  else if(cmd == 'b')
  {
    string command;
    cin >> command;

    char commandChar = toLower(command[0]);

    if(commandChar == 'a')
    {
      int addr;
      cin >> addr;
      breakpoints.push_back(addr);
    }
    else if(commandChar == 'd') {}
    else if(commandChar == 'l')
    {
      for(int i = 0; i < breakpoints.size(); ++i)
      {
        printf("#%d at 0x%04x\n", i, breakpoints[i]);
      }

      if(breakpoints.size() == 0) cout << "No current active breakpoints" << endl;
    }
    else if(commandChar == 'r')
    {
      int id = -1;
      cin >> id;

      if(id < 0 || id >= breakpoints.size())
      {
        cout << "Invalid breakpoint ID" << endl;
      }
      else
      {
        if(id != breakpoints.size()-1)
        {
          std::swap(breakpoints[id], breakpoints[breakpoints.size()-1]);
        }

        breakpoints.pop_back();
      }
    }
    else
    {
      cout << "Invalid Command, type help for a list of commands" << endl;
    }
  }
  else if(cmd == 'd' && toLower(input[1]) == 'a')
  {

  }
  else if(cmd == 'l')
  {
  }
  else if(cmd == 'r' && toLower(input[1]) == 'u')
  {
    machine->UpdateClock(false, true, false, true);
    continueProg();
  }
  else if(cmd == 'c')
  {
    continueProg();
  }
  else if(cmd == 's')
  {
    char c;

    int count = 1;
    if(scanf("%c", &c) == 1 && c == ' ') cin >> count;

    for(int i = 0; i < count; ++i)
      singleStep();
  }
  else if(cmd == 'q')
  {
    debugging = false;
  }
  else if(cmd == 'p')
  {
    int addr, max;
    cin >> addr;
    max = addr + 15;

    char c;
    if(scanf("%c", &c) ==1 && c == ',') cin >> max;
    machine->PrintMemory(addr, max);
  }
  else if(cmd == 'r' && toLower(input[1]) == 'e')
  {
    printf("A                  0x%04x\n", machine->GetAReg());
    printf("B                  0x%04x\n", machine->GetBReg());
    printf("O                  0x%04x\n", machine->GetOReg());
    printf("Program Counter    0x%04x\n", machine->GetPCReg());
  }
  else if(cmd == 'd' && toLower(input[1]) == 'i')
  {
    printdisassembly();
  }
  else
  {
    cout << "Invalid Command, type help for a list of commands" << endl;
  }
}

void startdebugging()
{
  debugging = true;
  std::string command;

  while (debugging)
  {
    cout << "(xdb) ";

    cin >> command;

    runcommand(command);

    command.clear();
  }
}
