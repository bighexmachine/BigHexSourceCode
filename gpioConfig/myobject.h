#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>
#include <mutex>
#include <time.h>
#include <node_object_wrap.h>

using namespace v8;
using namespace std;

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
  static const int minDelay = 100;
  void Clock();
  int signals[4];
  bool clockIsRunning;

  class ReferenceModel* refModel;

  mutex stateMutex;
  mutex updateMutex;
};

#endif
