## XDB - A debugger for big hex programs
This project is designed to mimic **gdb** but run hex files. It is written in c++ and makes use of the reference model used by the main server.

### Compiling

```bash
  $ make
```

### Running the Debugger

The debugger is designed to be run from the top level of the repository. If you wanted to debug the program for factorial 5 you would run the following command from the root folder of the project.
```bash
  $ ./xdb/xdb ./xPrograms/fact.x
```

Once the debugger is loaded type `help` to get a list of commands you can perform

## Contribute
This project is in a very early stage. Some ideas for improvements:
* Data breakpoints, break when a line or region of memory is written to
* Read the stdout from the compiler to build a list of symbols so that you can print global variables by their name
* Inspect the stack, use the current stack pointer and memory to build a backtace for the current program
* Use the stack as above to implement 'step over' and 'step out' functions
* Work out method addresses and display them / call them by name
* Keep a history of used debugger commands, use the up and down arrows to select and run a command from the history
* Better error output when the user inputs an invalid command
* Map assembly to source code line so that the current line of the program can be printed along with the source code
