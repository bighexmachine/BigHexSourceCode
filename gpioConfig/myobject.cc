#include <node.h>
#include <stdio.h>
#include <iostream>
#include <unistd.h>
#include "wiringProxy.h"
#include "myobject.h"

/*
  PIN DEFINITIONS
 */
#define PIN_CLK_0 GPIO0
#define PIN_CLK_1 GPIO1
#define PIN_CLK_2 GPIO2
#define PIN_CLK_3 GPIO3

#define PIN_DATA_0 GPIO4
#define PIN_DATA_1 GPIO5
#define PIN_DATA_2 GPIO6
#define PIN_DATA_3 GPIO7
#define PIN_DATA_4 SDA
#define PIN_DATA_5 SCL
#define PIN_DATA_6 CE0
#define PIN_DATA_7 CE1

#define PIN_RAM_PI_SELECT MOSI


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

MyObject::MyObject(): state(0), clockPhase(ClockPhase::FETCH), delay(10), signals{1, 0, 16, 0}, clockIsRunning(false)
{}

MyObject::~MyObject()
{
  DoStopClock();
  clockThread.join();
}

void MyObject::Init(Local<Object> target) {
  //setting up gpio pins
  setupGPIO () ;
  Isolate* isolate = target->GetIsolate();
  static int allpins[13] = { PIN_CLK_0, PIN_CLK_1, PIN_CLK_2, PIN_CLK_3,
                             PIN_DATA_0, PIN_DATA_1, PIN_DATA_2, PIN_DATA_3,
                             PIN_DATA_4, PIN_DATA_5, PIN_DATA_6, PIN_DATA_7,
                             PIN_RAM_PI_SELECT };
  for(int i = 0; i < 13; ++i)
  {
    setPinIn (allpins[i]);
    setPinOut (allpins[i]);
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
  write (PIN_CLK_0, val & 1);
  //phase 0 reset
  write (PIN_CLK_1, val & 2);
  //phase 1 clock
  write (PIN_CLK_2, val & 16);
  //phase 1 reset
  write (PIN_CLK_3, val & 32);

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
  state = 3;
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
  cout << "Clock Service Started" << endl;
  while(clockIsRunning)
  {
    updateMutex.lock();
    writeClock( signals[state] );
    IncrementState();
    updateMutex.unlock();

    nsleep(delay);
  }
  cout << "Clock Service Stopped" << endl;
}

void MyObject::DoStartClock()
{
  if(clockIsRunning) return;

  clockIsRunning = true;

  // if the clock thread is not running start it
  if(!clockThread.joinable())
    clockThread = thread(&MyObject::Clock, this);
}

void MyObject::StartClock(const FunctionCallbackInfo<Value>& args)
{
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStartClock();
  return;
}

void MyObject::DoStopClock()
{
  if(!clockIsRunning) return;

  updateMutex.lock();
  clockIsRunning = false;
  updateMutex.unlock();
  clockThread.join();
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
  nsleep(minDelay);
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
  double period = 1000000000.0 / inputSpeed;
  obj->delay = (long)(period / 16); // a full cycle of the machine takes 16 clock ticks

  if(obj->delay < minDelay)
    obj->delay = minDelay;

  return;
}

void MyObject::WriteData(const FunctionCallbackInfo<Value>& args) {
  int byte = args[0]->NumberValue();

  static int pins[8] = {PIN_DATA_0, PIN_DATA_1, PIN_DATA_2, PIN_DATA_3, PIN_DATA_4, PIN_DATA_5, PIN_DATA_6, PIN_DATA_7};

  for (int i=0; i < 8; ++i )
  {
    write (pins[i], ( byte & (1<<i) ) >> i);
  }

  return;
}

void MyObject::RamPiSel(const FunctionCallbackInfo<Value>& args) {
  int input = args[0]->NumberValue();
  int bit = input & 1;
  write (PIN_RAM_PI_SELECT, bit);
  usleep(100);
  return;
}

void MyObject::Reset(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  if (obj->clockIsRunning) StopClock(args);
  obj->ResetState();
  writeClock(34);
  nsleep(minDelay);
  return;
}

void MyObject::MoveToPhase(const v8::FunctionCallbackInfo<v8::Value>& args)
{
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  ClockPhase desiredPhase = (ClockPhase)args[0]->NumberValue();
  int desiredState = args[1]->NumberValue();

  obj->SetPhase(desiredPhase, desiredState);
}
