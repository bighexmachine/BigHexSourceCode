Docs on Big hex project

Author: Nathan Doorly

Modified by: Nick Pearson

## Installation

Installation requires the following dependencies
 * GNU Make Utility
 * GCC Compiler
 * Node JS version 6.11.0

On a raspberry pi installation is as follows
```bash
  $ git clone https://github.com/bighexmachine/BigHexSourceCode.git
  $ cd BigHexSourceCode
  $ npm install
```

The software can also be build on any other linux based system with one minor change. Navigate to **/gpioConfig/wiringProxy.h** and change `#define IS_PI 1` to `#define IS_PI 0`. This will disable the GPIO portion of the code. Re-run `npm install` as above. Compiling in this way is useful for implementing features of the webserver and frontend.

## Active Hours

The Big Hex Machine is designed to automatically switch off out of normal working hours. These hours are defined in **configure/shutdown.js** and can be modified. They also define a truth table of days of the week when the Machine will be active.

**NOTE:** If you are running code on your own machine locally there is a chance the server will try to put your machine to sleep. To combat this disable the shutdown system in `server.js` by commenting out the init function.

### How to use the machine out of hours

To boot the machine out of it's normal hours requires access to 2.16 MVB. Switch the machine off then on using the fuse on the wall to force the machine to boot up. Simarly this fuse can be used as a sort-of master off switch for the machine.

## Running

`server.js` is the main file of the server. It is recommended this is run via the provided shell script `server-start.sh` which handles log files.
The server runs on port 80, this requires elevated privileges so run with `sudo` (There is probably a better way to do this)

On the PI the node js module `forever` is used to run the server so that it automatically reboots itself if a crash occurs.

Install forever globally:
```bash
  $ npm install forever -g
```

Run the script:
```bash
  $ sudo forever start -c /bin/bash server-start.sh
```

## Hardware
 * Raspberry PI 2 (running the webserver, compiling code and driving the clock signals)
 * Bridging circuit that allows R-PI GPIO pins to drive build-a-comp signals
 * Build-a-comp boards (comprising the actual machine)
 * LED matrix and driver board
 * Buttons driven by custom circuit

The R-Pi has two wifi connections. One for eduroam and one to create a hotspot for people to connect to. There is no
bridge between the two, since it is not necessary for any work done or users to access. Could also create large security
problems.
The hostspot was created using this doc: https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md

### Compiing the X compiler
If the compiler gets corrupted or overritten etc. `cd` to compiler directory,
Run all these commands:

```bash
  $ make clean
  $ make
```

## Working on the R-Pi
There are a couple of ways to work on the Pi remotely. First and foremost it has ssh capability so you can
interact through a terminal and git pull any updates that are needed. Do this by connecting to the hotspot
and using:
`
    ssh pi@192.168.0.1
`
Also installed in the R-Pi is 'rmate'. It allows you to ssh in and pull files into atom if you have the package
installed locally. (Package must be activated in the menu). Run the command:
`
    ssh -R 52698:localhost:52698 pi@192.168.0.1
`
And open a file with
`
    rmate examplefile.js
`
see: https://github.com/textmate/rmate


## R-Pi

This is the current layout of the Pi's GPIO Pins and their uses

![GPIO Pin Layout Diagram](pi.jpg)


## Folder Structure

### Generated Folders
**Build:**
Build is created by node-gyp. Using commands 'node-gyp configure' and 'node-gyp build'. Don't really need to do much else to it.

**temp:**
This folder is created while the server is running and contains the working directories for compiling. It should be automatically cleared by the server regularly

**logs:**
Contains the 50 most recent log files for the server

### Project Folders
**Configure:**
Configure is used for any npm packages that need to be configured (who would've guessed?). Also used to configure the queue system and api calls Other potential packages like sql or Angular should be configured here.

**gpioConfig:**
Control of gpio pins from this folder. Also contains js portion of compiler and assember. Maybe should be moved in future?
c++ object created to run on own thread. It maintains control of the clock signal and regular data outputs. Needs to be c++ so clock is regular, as JS is single threaded.

**public:**
All html, css and browser run js files are in public. It is the front end scripts are in resources sub-directory. Everything in this directory is availible to view through the webserver so beware.

**routes:**
user_routes is where all http requests from a user are handled.

**xCompiler:**
David May's x compiler is here rebuilding written above. Also contains the old compiler if it is ever needed.

**xPrograms:**
Selection of example X programs that can be selected from the web UI

## NPM modules
 * sleep
 * bindings
 * express
 * node-gyp
 * hashmap
