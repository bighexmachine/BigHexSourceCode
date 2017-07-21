
#include "stdio.h"

#define true     -1
#define false    0


FILE *codefile;

FILE *simio[8];

char connected[] = {0, 0, 0, 0, 0, 0, 0, 0};

#define i_ldam   0x0
#define i_ldbm   0x1
#define i_stam   0x2

#define i_ldac   0x3
#define i_ldbc   0x4
#define i_ldap   0x5

#define i_ldai   0x6 
#define i_ldbi   0x7 
#define i_stai   0x8

#define i_br     0x9
#define i_brz    0xA 
#define i_brn    0xB
#define i_brb    0xC

#define i_opr    0xD
#define i_pfix   0xE
#define i_nfix   0xF

#define o_add    0x0
#define o_sub    0x1
#define o_in     0x2
#define o_out    0x3


unsigned short mem[32768];
unsigned char *pmem = (unsigned char *) mem;

unsigned short pc;
unsigned short sp;

unsigned short areg;
unsigned short breg;
unsigned short oreg;

unsigned short inst;


int hexval(int ch)
{ int v;
  if (('0' <= ch) && (ch <= '9'))
    v = ch - '0';
  else 
    v = (ch - 'A') + 10;
  return v;
}

void loadmem(int n)
{ 
    char ch;
    int addr; 
    addr = n;
    ch = fgetc(codefile);
    while ((('0' <= ch) && (ch <= '9')) || (('A' <= ch) && (ch <= 'F')))  
    { 
        pmem[addr] = (hexval(ch) << 4 | hexval(fgetc(codefile)));
        ch = fgetc(codefile); ch = fgetc(codefile);
        addr = addr + 2; 
    }  
};

 		  		  
void load()
{ 
    codefile = fopen("sim2", "rb");
    loadmem(0);	
    codefile = fopen("sim3", "rb");
    loadmem(1);
}


void simout(unsigned short b, unsigned short s)
{ char fname[] = {'s', 'i', 'm', ' ', 0};
    int f;
    if (s < 256)
        putchar(b);
    else 
    {   
        f = (s >> 8) & 7;
        if (! connected[f])
        { 
            fname[3] = f + '0';
            simio[f] = fopen(fname, "wb");
            connected[f] = true;
        };	
        fputc(b, simio[f]);
    };	  
};

int simin(unsigned short s)
{ char fname[] = {'s', 'i', 'm', ' ', 0};
    int f;
    if (s < 256)
        return getchar();
    else 
    { 
        f = (s >> 8) & 7;
        fname[3] = f + '0';
        if (! connected[f])
        {
            simio[f] = fopen(fname, "rb");
            connected[f] = true;
        }	
    return fgetc(simio[f]) ;	  
    };
};



void main() 
{

    printf("\n");

    load();

    oreg = 0; 

    while (true) 

    { 
        inst = pmem[pc];


        pc = pc + 1;    

        oreg = oreg | (inst & 0xf); 

        switch ((inst >> 4) & 0xf)
        {
        case i_ldam:   areg = mem[oreg]; oreg = 0; break;
        case i_ldbm:   breg = mem[oreg]; oreg = 0; break;
        case i_stam:   mem[oreg] = areg; oreg = 0; break;   

        case i_ldac:   areg = oreg; oreg = 0; break;
        case i_ldbc:   breg = oreg; oreg = 0; break;
        case i_ldap:   areg = pc + oreg; oreg = 0; break;

        case i_ldai:   areg = mem[areg + oreg]; oreg = 0; break;
        case i_ldbi:   breg = mem[breg + oreg]; oreg = 0; break;
        case i_stai:   mem[breg + oreg] = areg; oreg = 0; break;    

        case i_br:     pc = pc + oreg; oreg = 0; break;
        case i_brz:    if (areg == 0) pc = pc + oreg; oreg = 0; break;
        case i_brn:    if ((short int)areg < 0) pc = pc + oreg; oreg = 0; break;
        case i_brb:    pc = breg + oreg; oreg = 0; break; 

        case i_opr:
            switch (oreg)
            {
                case o_add:    areg = areg + breg; oreg = 0; break; 
                case o_sub:    areg = areg - breg; oreg = 0; break;
                case o_in:     areg = simin(breg); oreg = 0; break;
                case o_out:    simout(areg, breg); oreg = 0; break;
                  
            };
            break; 
                  
          case i_pfix:   oreg = oreg << 4; break;
          case i_nfix:   oreg = 0xFFFFFF00 | (oreg << 4); break;
      
        };
        
    }
    
}   