{
  "targets": [
    {
      "target_name": "gpioService",
      "sources": [ "gpioConfig/gpioService.cc", "gpioConfig/myobject.cc" ],
      "libraries": ["-lpthread"],
      "cflags": ["-std=c++11"]
    }
  ]
}
