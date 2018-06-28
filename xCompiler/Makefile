CC=gcc
CFLAGS=-std=c99 -O3 -g
RM=rm -f

a.bin: a.out bootstrap.bin xhex16h.x
	./a.out -i=bootstrap.bin < xhex16h.x
	cp sim2 a.bin

bootstrap.bin: a.out xhexb.bin xhexb.x xhexb.bin xhexb.x
	./a.out -i=xhexb.bin < xhexb.x
	cp sim2 bootstrap.bin

a.out: hexsimb.c
	$(CC) $(CFLAGS) hexsimb.c -o a.out

clean:
	$(RM) a.out
	$(RM) a.bin
	$(RM) bootstrap.bin
	$(RM) sim2
	$(RM) sim3
