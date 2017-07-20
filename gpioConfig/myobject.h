#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>
#include <mutex>
#include <node_object_wrap.h>

using namespace v8;
using namespace std;


using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

 private:
  MyObject();
  ~MyObject();

  static Handle<Value> New(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> WriteData(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> RamPiSel(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> StartClock(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> StopClock(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> StepClock(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> SetSpeed(const FunctionCallbackInfo<Value>& args);
  static Handle<Value> Reset(const FunctionCallbackInfo<Value>& args);
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
