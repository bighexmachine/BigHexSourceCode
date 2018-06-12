# Testing of Delays
If the PI drives the Big Hex machine too quickly some values will not have propagated so this test was to find the fastest safe speed

(Microseconds)

| Works? | Step Delay  |  Switching Delay  | GPIO Write Delay  |
|--------|-------------|-------------------|-------------------|
|   Y    |     100     |         0         |         100       |
|   N    |      25     |         0         |         100       |
|   N    |      25     |         0         |         100       |
|   Y    |      25     |         0         |         500       |
|   Y    |       5     |         0         |         500       |
|   Y    |       1     |         0         |         500       |
|   N    |       1     |         0         |         100       |
|   N    |       1     |         0         |         200       |
|   Y    |       1     |         0         |         400       |
