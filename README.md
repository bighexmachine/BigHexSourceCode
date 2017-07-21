Hello. This is an attempt on documentation.


#R-Pi#

Pin 13 is clock



#NPM modules#

sleep
bindings
express
node-gyp
hashmap

#Folder Structure#

Build:

-Build is created by node-gyp. Using commands 'node-gyp configure' and 'node-gyp build'.
-Don't really need to do much else to it.

Configure:
    express.js - Main configure file for express

-Configure is used for any npm packages that need to be configured (who would've guessed?).
-Other potential packages like sql or Angular should be configured here to avoid spaghetti code.


gpioConfig:
    build:
    assembler.js
    compiler.js
    gpioService.js
    gpioService.cc
    myobject.h
    myobject.cc

-Build comes from node-gyp again.
-