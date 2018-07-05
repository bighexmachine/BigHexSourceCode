CC=g++
CFLAGS= -std=c++11 -O3
HEADERS=../gpioConfig/referencemodel.h
SOURCE=xdb.cpp ../gpioConfig/referencemodel.cpp

xdb: $(SOURCE) $(HEADERS)
	$(CC) $(CFLAGS) $(SOURCE) -o $@

clean:
	rm -r xdb
