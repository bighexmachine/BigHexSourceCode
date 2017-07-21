Docs on Big hex project - year 2
Author: Nathan Doorly


The R-Pi has two wifi connections. One for eduroam and one to create a hotspot for people to connect to. There is no 
bridge between the two, since it is not necessary for any work done or users to access. Could also create large security
problems.
The hostspot was created using this doc: https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md

node version: 6.11.0



## Working on the R-Pi
There are a couple of ways to work on the Pi remotely. First and foremost it has ssh capability so you can interact 
through a terminal and git pull any updates that are needed. Do this by connecting to the hotspot and using: 
` 
    ssh pi@192.168.0.1
`
Also installed in the R-Pi is 'rmate'. It allows you to ssh in and pull files into atom if you have the package 
installed locally. (Package must be activated in the menu). Run the command: 
`
    ssh -R 52698:localhost:52698 pi@192.168.0.1
`
see: https://github.com/textmate/rmate



## R-Pi

Pin 13 is clock


## Folder Structure

Build:

-Build is created by node-gyp. Using commands 'node-gyp configure' and 'node-gyp build'.
-Don't really need to do much else to it.

Configure:
    express.js - Main configure file for express

-Configure is used for any npm packages that need to be configured (who would've guessed?).
-Other potential packages like sql or Angular should be configured here to avoid spaghetti code.


gpioConfig:
├──   build:
|└── 
├──   assembler.js
├──    compiler.js
├──    gpioService.js
├──    gpioService.cc
├──    myobject.h
└──    myobject.cc

Build comes from node-gyp again.



## NPM modules
sleep
bindings
express
node-gyp
hashmap

