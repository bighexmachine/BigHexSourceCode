CC=gcc
CFLAGS=-O3
RM=rm -f

a.out: hexsimb.c xhexb.bin xhexb.x xhex16h.x
	$(CC) $(CFLAGS) hexsimb.c -o a.out
	cp xhexb.bin a.bin
	./a.out < xhexb.x
	cp sim2 a.bin
	./a.out < xhexb.x
	./a.out < xhex16h.x
	cp sim2 a.bin

clean:
	$(RM) a.out
	$(RM) a.bin
	$(RM) sim2
	$(RM) sim3
