#ifndef MYOBJECT_H
#define MYOBJECT_H
#include <thread>
#include <node.h>

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

  //static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static New(const v8::FunctionCallbackInfo<value>& args);

  static Handle<Value> WriteData(const Arguments& args);
  static Handle<Value> RamPiSel(const Arguments& args);
  static v8::Handle<v8::Value> StartClock(const v8::Arguments& args);
  static v8::Handle<v8::Value> StopClock(const v8::Arguments& args);
  static v8::Handle<v8::Value> StepClock(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetSpeed(const v8::Arguments& args);
  static v8::Handle<v8::Value> Reset(const v8::Arguments& args);
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
