#include <stdio.h>
#include <unistd.h>
#include "wiringProxy.h"

#define VALUE_PIN 21
#define CLK_PIN 20
#define LD_PIN 16

unsigned int delaylen = 10000;
unsigned int halfdelay = delaylen/2;

inline void delay() { usleep(delaylen); }

void load_registers()
{
	write(LD_PIN, 0);
	delay();
	write(LD_PIN, 1);
	delay();
	write(LD_PIN, 0);
	delay();
	write(LD_PIN, 1);
	delay();
}

int main()
{
	setupGPIO();
	setPinIn(VALUE_PIN);
	setPinIn(CLK_PIN);
	setPinIn(LD_PIN);

	setPinOut(CLK_PIN);
	write(CLK_PIN, 0);

	setPinOut(LD_PIN);
	write(LD_PIN, 1);
	usleep(halfdelay);

	unsigned short lastvalue;

	while(true)
	{
		//printf("**LOAD**\n");

		load_registers();

		unsigned short value = 0;

		for(int i = 0; i < 16; ++i)
		{
			usleep(halfdelay);
			value = (value << 1) + read(VALUE_PIN);
			usleep(halfdelay);
			write(CLK_PIN, 1);
			usleep(delaylen);
			write(CLK_PIN, 0);
		}

		// swap some nibbles becase nick was an idiot and didn't solder it ther right way around
		value = ((value & 0x00f0) >> 4) + ((value & 0xf000) >> 4) + ((value & 0x0f00) << 4) + ((value & 0x000f) << 4);

		//if(value != lastvalue)
		{
			printf("Value : 0x%04x\n", value);
			lastvalue = value;
		}
	}

	return 0;
}
