#ifndef WIRING_PROXY_H
#define WIRING_PROXY_H

// trashy proxy header so that we can compile on machines that are not raspberry pis
#define IS_PI 1


#if IS_PI
  #include <wiringPi.h>
#else
  #include <unistd.h>
  #define OUTPUT 0

  void wiringPiSetup() {}
  void pinMode(int i, int j) {}
  void digitalWrite(int i, int j) {}

  void delayMicroseconds(int secs)
  {
    usleep(secs);
  }
#endif

#endif
