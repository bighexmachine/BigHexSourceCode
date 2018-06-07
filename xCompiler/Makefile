CC=gcc
CFLAGS=-std=c99 -O3 -g
RM=rm -f

a.bin: a.out xhexb.bin xhexb.x xhex16h.x
	cp xhexb.bin a.bin
	./a.out < xhexb.x
	cp sim2 a.bin
	./a.out < xhexb.x
	./a.out < xhex16h.x
	cp sim2 a.bin

a.out: hexsimb.c
	$(CC) $(CFLAGS) hexsimb.c -o a.out

clean:
	$(RM) a.out
	$(RM) a.bin
	$(RM) sim2
	$(RM) sim3
