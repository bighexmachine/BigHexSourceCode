#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>
#include <mutex>
#include <node_object_wrap.h>

using namespace v8;
using namespace std;


class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

 private:
  MyObject();
  ~MyObject();

  static Handle<v8::Value> New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> WriteData(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> RamPiSel(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> StartClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> StopClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> StepClock(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> SetSpeed(const v8::FunctionCallbackInfo<v8::Value>& args);
  static Handle<v8::Value> Reset(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
  std::thread clockThread;
  int state;
  int delay;
  void Clock();
  mutex clockLock;
  mutex pauseClockLock;
  int signals[4];
  int clockIsRunning;
};

#endif
