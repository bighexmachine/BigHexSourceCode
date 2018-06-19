{
  "targets": [
    {
      "target_name": "gpioService",
      "sources": [ "gpioConfig/gpioService.cc", "gpioConfig/myobject.cc", "gpioConfig/referencemodel.cpp" ],
      "libraries": ["-lpthread"],
      "cflags": ["-std=c++11"]
    }
  ]
}
