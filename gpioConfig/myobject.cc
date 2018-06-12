#include <node.h>
#include <stdio.h>
#include <iostream>
#include <unistd.h>
#include "wiringProxy.h"
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

MyObject::MyObject(): state(0), clockPhase(ClockPhase::FETCH), delay(10), signals{1, 0, 16, 0}, clockIsRunning(false) {
  clockThread = thread(&MyObject::Clock, this);
}

MyObject::~MyObject() {

}

void MyObject::Init(Local<Object> target) {
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
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "writeData", WriteData);
  NODE_SET_PROTOTYPE_METHOD(tpl, "startClock", StartClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "stopClock", StopClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "stepClock", StepClock);
  NODE_SET_PROTOTYPE_METHOD(tpl, "isClockRunning", IsClockRunning);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setSpeed", SetSpeed);
  NODE_SET_PROTOTYPE_METHOD(tpl, "ramPiSel", RamPiSel);
  NODE_SET_PROTOTYPE_METHOD(tpl, "reset", Reset);
  NODE_SET_PROTOTYPE_METHOD(tpl, "moveToPhase", MoveToPhase);
  constructor.Reset(isolate, tpl->GetFunction());
  target->Set(String::NewFromUtf8(isolate, "MyObject"), tpl->GetFunction());
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = new MyObject();
  obj->Wrap(args.This());
  args.GetReturnValue().Set(args.This());
}

void writeClock(int val)
{
  static mutex clockMutex;
  clockMutex.lock();

  //phase 0 clock
  digitalWrite (0, val & 1);
  //phase 0 reset
  digitalWrite (1, val & 2);
  //phase 1 clock
  digitalWrite (2, val & 16);
  //phase 1 reset
  digitalWrite (3, val & 32);

  clockMutex.unlock();
}

void MyObject::IncrementState()
{
  stateMutex.lock();
  state = (state+1) % 4;
  if(state == 3)
  {
    clockPhase = (ClockPhase)(((int)clockPhase + 1) % 4);
  }

  stateMutex.unlock();
}

void MyObject::ResetState()
{
  stateMutex.lock();
  state = 0;
  clockPhase = ClockPhase::FETCH;
  stateMutex.unlock();
}

void MyObject::SetPhase(ClockPhase desiredPhase, int desiredState)
{
  if(desiredState < 0 || desiredState > 3) return;

  while(clockPhase != desiredPhase && state != desiredState)
  {
    DoStepClock();
  }
}

void MyObject::Clock()
{
  cout << "Clock Service Ready" << endl;
  while(1)
  {

    updateMutex.lock();
    if(clockIsRunning)
    {
      writeClock( signals[state] );
      IncrementState();
    }
    updateMutex.unlock();

    usleep(delay < minDelay ? minDelay : delay);
  }
}

void MyObject::StartClock(const FunctionCallbackInfo<Value>& args)
{
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->clockIsRunning = true;

	printf("started\n");
  return;
}

void MyObject::DoStopClock()
{
  if(!clockIsRunning) return;

  updateMutex.lock();
  clockIsRunning = false;
  updateMutex.unlock();

	printf("stopped\n");
}

void MyObject::StopClock(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStopClock();
}

void MyObject::DoStepClock()
{
  if (clockIsRunning) DoStopClock();
  writeClock( signals[state] );
  IncrementState();
  usleep(minDelay);
}

void MyObject::StepClock(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStepClock();
}

void MyObject::IsClockRunning(const v8::FunctionCallbackInfo<v8::Value>& args)
{
  const MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  args.GetReturnValue().Set(obj->clockIsRunning);
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
  obj->ResetState();
  writeClock(34);
  usleep(minDelay);
  writeClock(0);
  usleep(minDelay);
  return;
}

void MyObject::MoveToPhase(const v8::FunctionCallbackInfo<v8::Value>& args)
{
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  ClockPhase desiredPhase = (ClockPhase)args[0]->NumberValue();
  int desiredState = args[1]->NumberValue();

  obj->SetPhase(desiredPhase, desiredState);
}
