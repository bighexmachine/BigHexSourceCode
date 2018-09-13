#include <node.h>
#include <stdio.h>
#include <iostream>
#include <unistd.h>
#include "wiringProxy.h"
#include "myobject.h"
#include "referencemodel.h"

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

MyObject::MyObject(): state(0), delay(10), signals{1, 0, 16, 0}, clockIsRunning(false)
{
  refModel = new ReferenceModel();
}

MyObject::~MyObject()
{
  DoStopClock();
  clockThread.join();
  cout << "Killing C++ Thread Object" << endl;
  delete refModel;
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
    write (allpins[i], 0);
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
  constructor.Reset(isolate, tpl->GetFunction());
  target->Set(String::NewFromUtf8(isolate, "MyObject"), tpl->GetFunction());
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = new MyObject();
  obj->Wrap(args.This());
  args.GetReturnValue().Set(args.This());
}

void MyObject::WriteClock(int val)
{
  //phase 0 clock
  write (PIN_CLK_0, val & 1);
  //phase 0 reset
  write (PIN_CLK_1, val & 2);
  //phase 1 clock
  write (PIN_CLK_2, val & 16);
  //phase 1 reset
  write (PIN_CLK_3, val & 32);

  refModel->UpdateClock(val & 1, val & 2, val & 16, val & 32);
}

void MyObject::Clock()
{
  cout << "Clock Service Started" << endl;
  while(clockIsRunning)
  {
    for(int i = 0; i < 16; ++i)
    {
      WriteClock( signals[state] );
      state = (state+1) % 4;

      nsleep(delay);
    }
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

  clockIsRunning = false;
  clockThread.join();
}

void MyObject::StopClock(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStopClock();
}

void MyObject::DoStepClock()
{
  if (clockIsRunning) DoStopClock();
  WriteClock( signals[state] );
  state = (state+1) % 4;
  nsleep(20000);
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
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStopClock();
  int value = args[0]->NumberValue();

  static int pins[8] = {PIN_DATA_0, PIN_DATA_1, PIN_DATA_2, PIN_DATA_3, PIN_DATA_4, PIN_DATA_5, PIN_DATA_6, PIN_DATA_7};

  for (int i=0; i < 8; ++i )
  {
    write (pins[i], ( value & (1<<i) ) >> i);
  }

  nsleep(800000);

  obj->refModel->SetPiDataInput(value);

  return;
}

void MyObject::RamPiSel(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  obj->DoStopClock();
  int input = args[0]->NumberValue();
  int bit = input & 1;
  write (PIN_RAM_PI_SELECT, bit);
  obj->refModel->SetRamPiSelect(bit == 0);
  nsleep(minDelay);
  return;
}

void MyObject::Reset(const FunctionCallbackInfo<Value>& args) {
  MyObject* obj = ObjectWrap::Unwrap<MyObject>( args.This() );
  if (obj->clockIsRunning) obj->DoStopClock();
  obj->state = 0;
  obj->WriteClock(34);
  nsleep(minDelay);
  return;
}
