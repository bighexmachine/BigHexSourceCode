# Big Hex Source Code

Author: Nathan Doorly

Modified by: Nick Pearson

## Introduction

This repository contains the code running on the Rasbperry PI which drives the [Big Hex Machine](https://bighexmachine.github.io/), a 16 bit processor at the University of Bristol. It contains the following programs
 * **Node JS Webserver:** The server which allows users to interact with the machine over WiFi. The entry point is server.js
 * **xCompiler:** This compiles .x files into assemlby code that can be run on the machine. Run the executable a.out passing in your source code over stdin
 * **xdb:** A debugger tool for .x programs on the machine. Allows you to add breakpoints and inspect memory of a simulated Big Hex machine

If you use [Atom](https://atom.io/) as your text editor you may also wish to download the [language-hex](https://atom.io/packages/language-hex) package which adds syntax highlighting and snippets to hex files

It also contains a number of example programs in X written for the machine. These can be found in the xPrograms folder.

## Installation

Installation requires the following dependencies
 * GNU Make Utility
 * GCC Compiler
 * Node JS version 6.11.0

To install the server and compiler on a Raspberry PI, use the following commands
```bash
  $ git clone https://github.com/bighexmachine/BigHexSourceCode.git
  $ cd BigHexSourceCode
  $ npm install
```
It is also possible to build the software on any other linux based system with one minor change. Navigate to **/gpioConfig/wiringProxy.h** and change `#define IS_PI 1` to `#define IS_PI 0`. This will disable the GPIO portion of the code. Re-run `npm install` as above. Compiling in this way is useful for implementing features of the webserver and frontend.

#### Installing XDB

The XDB utility is not compiled by default. For more information visit the [xdb README page](https://github.com/bighexmachine/BigHexSourceCode/tree/master/xdb).

## Active Hours

The Big Hex Machine is designed to automatically switch off out of normal working hours. These hours are defined in **configure/shutdown.js** and can be modified. They also define a truth table of days of the week when the Machine will be active.

#### How to use the machine out of hours

To boot the machine out of it's normal hours requires access to 2.16 MVB. Switch the machine off then on using the fuse on the wall to force the machine to boot up. Similarly this fuse can be used as a sort-of master off switch for the machine.

#### Technical Details
Raspberry PIs do not have a battery powered hardware clock like most other machines. This means it is impossilble for the PI to reboot itself at a set time after shutdown as it will not know the current time. To get around this we leave the PI switched on but running very few programs and use a CRON job to reboot the server at the required time.

## Running the Server

`server.js` is the main file of the server. It is recommended this is run via the provided shell script `server-start.sh` which handles log files.
The server runs on port 80, this requires elevated privileges so run with `sudo` (There is probably a better way to do this)

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

## Compiler Information
If the compiler becomes corrupt for any reason, navigate to **xCompiler** and run `make clean` followed by `make`. This will rebuild the compiler from scratch.

The main compiler is written in X and is run through a simulator of a 32 bit hex processor written in C. The compiler is bootstrapped through a prebuilt binary of a working compiler. When developing new features for the compiler I suggest only the top level bootstrapped compiler be modified.

Files:
 * **Makefile** : Code to build the stages of the compiler
 * **xhex16h.x** : The top level compiler that is used to compile user programs. Contains optimisations and features not present in the older compilers
 * **hexsim16.c** : Simulator of the 16 bit hex machine written in C (currently unused)
 * **hexsimb.c** : Simulator of a 32 bit sample hex machine in C
 * **stdlib.x** : The Big Hex standard library source code
 * **xhexb.bin** : Prebuilt compiler binary used to compiler the simple bootstrap compiler
 * **xhexb.x** : Simple bootstrap compiler used to compile the top level compiler

The top level compiler generates 2 files of instructions that should be loaded into the two memory modules of the big hex machine respectively. The simple compiler generates a single .bin file of instructions to be run through the C simulator.

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

**xdb:**
Contains source code of the X Debugger

## Contact

For more information about the project, including help for programming in the X langauge please visit the [official project website](https://bighexmachine.github.io/) or if you are a student at UoB talk to your lab helpers and leturers.
