#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>
#include <mutex>
#include <time.h>
#include <node_object_wrap.h>

using namespace v8;
using namespace std;

// returns how many nanoseconds later ts2 is compared to ts1. If ts2 is earlier the result will be negative
inline long diffts_nsec(const timespec& ts1, const timespec& ts2)
{
  return ((ts2.tv_sec - ts1.tv_sec) * 1000000000) + (ts2.tv_nsec - ts1.tv_nsec);
}

inline void nsleep(long nsecs)
{
  timespec ts;
  ts.tv_sec = 0;
  ts.tv_nsec = 0;

  if(nsecs < 250)
  {
    // use the high precision clock and yields as nanosleep is very unreliable
    clock_gettime(CLOCK_MONOTONIC, &ts);

    timespec ts2;
    ts2.tv_sec = ts.tv_sec;
    ts2.tv_nsec = ts.tv_nsec;

    while(diffts_nsec(ts, ts2) < nsecs)
    {
      sched_yield();
      clock_gettime(CLOCK_MONOTONIC, &ts2);
    }

    return;
  }


  while(nsecs >= 1000000000)
  {
    ts.tv_sec++;
    nsecs -= 1000000000;
  }

  ts.tv_nsec = nsecs;

  nanosleep(&ts, NULL);
}

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> target);

 private:
  MyObject();
  ~MyObject();

  void DoStartClock();
  void DoStopClock();
  void DoStepClock();


  void WriteClock(int val);

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void WriteData(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void RamPiSel(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StartClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StopClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StepClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void IsClockRunning(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetSpeed(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Reset(const v8::FunctionCallbackInfo<v8::Value>& args);

  static v8::Persistent<v8::Function> constructor;
  double value_;
  std::thread clockThread;
  int state;
  long delay;
  static const int minDelay = 40;
  void Clock();
  int signals[4];
  bool clockIsRunning;

  class ReferenceModel* refModel;
};

#endif
