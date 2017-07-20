{
  "targets": [
    {
      "target_name": "gpioService",
      "sources": [ "gpioConfig/gpioService.cc", "gpioConfig/myobject.cc" ],
      "libraries": ["-lwiringPi -lpthread"],
      "cflags": ["-std=c++0x"]
    }
  ]
}
