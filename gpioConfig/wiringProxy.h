#ifndef WIRING_PROXY_H
#define WIRING_PROXY_H

// PIN IDs for the various GPIO pins (BCM Numbering)
#define GPIO0 17
#define GPIO1 18
#define GPIO2 27
#define GPIO3 22
#define GPIO4 23
#define GPIO5 24
#define GPIO6 25
#define GPIO7 4
#define SDA 2
#define SCL 3
#define CE0 8
#define CE1 7
#define MOSI 10

// defines functions for accessing GPIO
// setupGPIO() initialises the gpio system
// setPinOut(p) sets pin p as an output
// setPinIn(p) sets pin p as an input
// write(p, v) sets pin p to the value v

#define IS_PI 1

#define USE_WIRING_PI 0

#if IS_PI

  #if USE_WIRING_PI
    #include <wiringPi.h>

    #undef GPIO0
    #undef GPIO1
    #undef GPIO2
    #undef GPIO3
    #undef GPIO4
    #undef GPIO5
    #undef GPIO6
    #undef GPIO7
    #undef SDA
    #undef SCL
    #undef CE0
    #undef CE1
    #undef MOSI

    #define GPIO0 0
    #define GPIO1 1
    #define GPIO2 2
    #define GPIO3 3
    #define GPIO4 4
    #define GPIO5 5
    #define GPIO6 6
    #define GPIO7 7
    #define SDA 8
    #define SCL 9
    #define CE0 10
    #define CE1 11
    #define MOSI 12

    inline void setupGPIO()
    {
      wiringPiSetup();
    }

    inline void setPinOut(int p)
    {
      pinMode (p, OUTPUT);
    }

    inline void setPinIn(int p)
    {
      pinMode (p, INPUT);
    }

    inline void write(int p, int v)
    {
      digitalWrite (p, v);
    }

    inline void read(int p)
    {
      #error "read not implemented for wiring pi"
    }
  #else
    #include "nativeWiring.h"
  #endif

#else

  inline void setupGPIO() {}
  inline void setPinOut(int p) {}
  inline void setPinIn(int p) {}
  inline void write(int p, int v) {}
  inline int read(int p) { return 0; }

#endif // IS_PI

#endif // WIRING_PROXY_H
