| ****************************|
|   BIG HEX STANDARD LIBRARY  |
| ****************************|
val framebuff = #FFF0;

var randseed;

var mul_x;
var div_x;

module (stdlib) is

| delays execution for a short while (0.5s) |
proc delay() is
  var n;
{ n := 0;
  while n < 25 do n := n + 1
}

| copies the provided bitmat into the display buffer |
proc displayBitmap(b) is
{
|see notes, quicker to do this way than using a loop|
  framebuff[15] := b[0];
  framebuff[13] := b[2];
  framebuff[11] := b[4];
  framebuff[9] := b[6];
  framebuff[7] := b[8];
  framebuff[5] := b[10];
  framebuff[3] := b[12];
  framebuff[1] := b[14];
  framebuff[14] := b[1];
  framebuff[12] := b[3];
  framebuff[10] := b[5];
  framebuff[8] := b[7];
  framebuff[6] := b[9];
  framebuff[4] := b[11];
  framebuff[2] := b[13];
  framebuff[0] := b[15]
}

| sets all bits in the display buffer to 0 |
proc clearDisplay() is
{
  __asm ("stai #0
          stai #1
          stai #2
          stai #3
          stai #4
          stai #5
          stai #6
          stai #7
          stai #8
          stai #9
          stai #A
          stai #B
          stai #C
          stai #D
          stai #E
          stai #FFFF",
        0,
        framebuff)
}

func lsu(x, y) is
  if (x < 0) = (y < 0)
  then
    return x < y
  else
    return y < 0

func mul_step(b, y) is
  var r;
{ if (b < 0) or (~lsu(b, mul_x))
  then
    r := 0
  else
    r := mul_step(b + b, y + y);
  if ~lsu(mul_x, b)
  then
  { mul_x := mul_x - b;
    r := r + y
  }
  else
    skip;
  return r
}

func mul(n, m) is
{ mul_x := m;
  return mul_step(1, n)
}

func div_step(b, y) is
  var r;
{ if (y < 0) or (~lsu(y, div_x))
  then
    r := 0
  else
    r := div_step(b + b, y + y);
  if ~lsu(div_x, y)
  then
  { div_x := div_x - y;
    r := r + b
  }
  else
    skip;
  return r
}

func div(n, m) is
{ div_x := n;
  if lsu(n, m)
  then
    return 0
  else
    return div_step(1, m)
}

func rem(n, m) is
  var x;
{ x := div(n, m);
  return div_x
}

func lsh(x, n) is
 var i;
 var y;
{
  y:=x;
  i:=0;
  while i<n do {y:=y+y;i:=i+1};
  return y
}

func rsh(x, n) is
var i;
var w;
{
  i := 0;
  w:=x;
  while i < (16-n) do
  {
    if w < 0
    then
      w := w + w + 1
    else
      w := w + w;
    i := i + 1
  };
  if w<0 then w:=w+#8000 else skip;
  return w
}

proc abs(x) is if x < 0 then return x+#8000 else return x

proc isOdd(x) is return lsh(x, 15) < 0

func isEven(x) is return ~(isOdd(x))

func mod(modulus, divisor) is
var m;
{
    if (divisor < (modulus+1)) and (divisor < #7FFF )
    then
      m := mod(modulus, divisor+divisor)
    else
      m := modulus;

    if divisor < (m+1)
    then
      m:=m-divisor
    else
      skip;

    return m
}

proc genRand() is delay()
proc genRandUpTo()  is delay()

| populates the array parameter with the display representation of the character |
proc getBitmapForChar(ch,arr) is
{
  if ch = 'H' then
  {
    arr[0]  := #b0000000000000000;
    arr[1]  := #b0111000000001110;
    arr[2]  := #b0111000000001110;
    arr[3]  := #b0111000000001110;
    arr[4]  := #b0111000000001110;
    arr[5]  := #b0111000000001110;
    arr[6]  := #b0111000000001110;
    arr[7]  := #b0111111111111110;
    arr[8]  := #b0111111111111110;
    arr[9]  := #b0111000000001110;
    arr[10] := #b0111000000001110;
    arr[11] := #b0111000000001110;
    arr[12] := #b0111000000001110;
    arr[13] := #b0111000000001110;
    arr[14] := #b0111000000001110;
    arr[15] := #b0000000000000000
  }
  else if ch = 'I' then
  {
    arr[0]  := #b0000000000000000;
    arr[1]  := #b0011111111111100;
    arr[2]  := #b0011111111111100;
    arr[3]  := #b0000000110000000;
    arr[4]  := #b0000000110000000;
    arr[5]  := #b0000000110000000;
    arr[6]  := #b0000000110000000;
    arr[7]  := #b0000000110000000;
    arr[8]  := #b0000000110000000;
    arr[9]  := #b0000000110000000;
    arr[10] := #b0000000110000000;
    arr[11] := #b0000000110000000;
    arr[12] := #b0000000110000000;
    arr[13] := #b0011111111111100;
    arr[14] := #b0011111111111100;
    arr[15] := #b0000000000000000
  }
  else
  {
    arr[0]  := #b0000000000000000;
    arr[1]  := #b0000000000000000;
    arr[2]  := #b0000000000000000;
    arr[3]  := #b0000000000000000;
    arr[4]  := #b0000000000000000;
    arr[5]  := #b0000000000000000;
    arr[6]  := #b0000000000000000;
    arr[7]  := #b0000000000000000;
    arr[8]  := #b0000000000000000;
    arr[9]  := #b0000000000000000;
    arr[10] := #b0000000000000000;
    arr[11] := #b0000000000000000;
    arr[12] := #b0000000000000000;
    arr[13] := #b0000000000000000;
    arr[14] := #b0000000000000000;
    arr[15] := #b0000000000000000
  }
}

in
