#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>
#include <mutex>
#include <time.h>
#include <node_object_wrap.h>

using namespace v8;
using namespace std;

enum class ClockPhase : uint8_t
{
  FETCH = 0,
  INC_PC = 1,
  EXE = 2,
  DISPLAY = 3
};

inline void nsleep(long nsecs)
{
  timespec ts;
  ts.tv_sec = 0;

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

  void IncrementState();
  void ResetState();
  void SetPhase(ClockPhase desiredPhase, int desiredState = 0);

  void DoStartClock();
  void DoStopClock();
  void DoStepClock();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void WriteData(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void RamPiSel(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StartClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StopClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void StepClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void IsClockRunning(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetSpeed(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Reset(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void MoveToPhase(const v8::FunctionCallbackInfo<v8::Value>& args);

  static v8::Persistent<v8::Function> constructor;
  double value_;
  std::thread clockThread;
  int state;
  ClockPhase clockPhase;
  long delay;
  static const int minDelay = 10000;
  void Clock();
  int signals[4];
  bool clockIsRunning;

  mutex stateMutex;
  mutex updateMutex;
};

#endif
