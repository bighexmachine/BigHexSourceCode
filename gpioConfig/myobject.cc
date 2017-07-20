#include <node.h>
#include <stdio.h>
#include <wiringPi.h>
#include <iostream>
#include "myobject.h"


using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

Persistent<Function> MyObject::constructor;

MyObject::MyObject(): state(0), delay(10), signals{1, 0, 16, 0}, clockIsRunning(0) {
  clockLock.lock();
  clockThread = thread(&MyObject::Clock, this);
}

MyObject::~MyObject() {

}

void MyObject::Init(Handle<Object> target) {
  //setting up gpio pins
  wiringPiSetup () ;
  Isolate* isolate = target->GetIsolate();
  int i;
  for(i=0;i<13;i++)
  {
    pinMode (i, OUTPUT) ;
  }

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewSymbol("MyObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "writeData", WriteData);
  NODE_SET_PROTOTYPE_METHOD(tpl, "startClock", StartClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "stopClock", StopClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "stepClock", StepClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setSpeed", SetSpeed);
  NODE_SET_PROTOTYPE_METHOD(tpl, "ramPiSel", RamPiSel);
  NODE_SET_PROTOTYPE_METHOD(tpl, "reset", Reset);
  constructor = Persistent<Function>::New(tpl->GetFunction());
  target->Set(String::NewSymbol("MyObject"), constructor);
}

Handle<v8::Value> MyObject::New(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = new MyObject();
  obj->Wrap(args.This());
  return args.This();
}

void writeClock(int val)
{
  //phase 0 clock
  digitalWrite (0, val & 1);
  //phase 0 reset
  digitalWrite (1, val & 2);
  //phase 1 clock
  digitalWrite (2, val & 16);
  //phase 1 reset
  digitalWrite (3, val & 32);
}

void MyObject::Clock()
{
  cout << "Clock Service Ready" << endl;
  while(1)
  {
    pauseClockLock.lock();
    pauseClockLock.unlock();
    clockLock.lock();
    writeClock( signals[state] );
    delayMicroseconds(delay);
    state = (state+1) % 4;
    clockLock.unlock();
  }
}

void MyObject::StartClock(const FunctionCallbackInfo<Value>& args)
{
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->clockIsRunning = 1;
  obj->pauseClockLock.unlock();
  obj->clockLock.unlock();
  return;
}

void MyObject::StopClock(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  if(obj->clockIsRunning != 0)
  {
    obj->pauseClockLock.lock();
    obj->clockLock.lock();
    obj->clockIsRunning = 0;
  }
  return;
}

void MyObject::StepClock(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  if (obj->clockIsRunning) StopClock(args);
  writeClock( obj->signals[obj->state] );
  obj->state = (obj->state+1) % 4;
  return;
}

void MyObject::SetSpeed(const FunctionCallbackInfo<Value>& args) {

  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  double inputSpeed = args[0]->NumberValue();
  int period = 1000000 / inputSpeed; 
  obj->delay = period / 4;
  return;
}

void MyObject::WriteData(const FunctionCallbackInfo<Value>& args) {

  int byte = args[0]->NumberValue();
  int base = 4;
  int i;
  for ( i=base; i<base+8; i++ )
  {
    int shift = i-base;
    digitalWrite (i, ( byte & (1<<shift) ) >> shift);
  }
  return;
}

void MyObject::RamPiSel(const FunctionCallbackInfo<Value>& args) {
  
  int input = args[0]->NumberValue();
  int bit = input & 1;
  digitalWrite (12, bit);
  return;
}

void MyObject::Reset(const FunctionCallbackInfo<Value>& args) {

  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  if (obj->clockIsRunning) StopClock(args);
  obj->state = 0;
  digitalWrite (0, 0);
  digitalWrite (1, 1);
  digitalWrite (2, 0);
  digitalWrite (3, 1);
  return;
}

