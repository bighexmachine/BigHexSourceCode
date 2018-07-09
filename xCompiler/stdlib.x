| ****************************|
|   BIG HEX STANDARD LIBRARY  |
| ****************************|
val framebuff = #FFF0;

var randseed;

var mul_x;
var div_x;

array alphabet[200];

module (stdlib) is

| delays execution for a short while (0.5s) |
proc delay() is
  var n;
{ n := 0;
  while n < 25 do n := n + 1
}

proc longdelay() is
var n;
{ n := 0;
  while n < 500 do n := n + 1
}

proc verylongdelay() is
var n;
{ n := 0;
  while n < 10000 do n := n + 1
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

proc memcpy(src, dst, size) is
  var n;
{
  n := size;

  while n > 0 do
  {
    dst[n] := src[n];
    n := n - 1
  }
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
          stai #F",
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

func abs(x) is if x < 0 then return x+#8000 else return x

func isOdd(x) is return lsh(x, 15) < 0

func isEven(x) is return ~(isOdd(x))


proc sRand(s) is randseed := s

|returns a random num in range 0 <= rand < x |
func genRand(x) is
{
  randseed := mod( mul(169, randseed) + 13, 193 );
  return mod(randseed, x)
}

| gets a READ ONLY reference to the character bitmap |
func getBitmapForChar(ch) is
  var idx;
{
  idx := 0;

  |                     Alphabet Layout                       |
  |0      : Blank Space (reserved for unsupported characters) |
  |1-10   : Numerics                                          |
  |11-36  : Lower case letters                                |
  |37-63  : Upper case letters                                |
  |63-66  : Symbols                                           |

  if (ch >= '0') and (ch <= '9') then
    idx := 1 + (ch - '0')
  else
  if (ch >= 'a') and (ch <= 'z') then
    idx := 11 + (ch - 'a')
  else
  if (ch >= 'A') and (ch <= 'Z') then
    idx := 37 + (ch - 'A')
  else
  if ch = '!' then
    idx := 63
  else
  if ch = '?' then
    idx := 64
  else
  if ch = '@' then
    idx := 65
  else
  if ch = '#' then
    idx := 66
  else
    skip;

  return alphabet[idx]
}

| copies the character bitmap into the array passed in |
proc copyBitmapForChar(ch,arr) is
  var src;
{
  src := getBitmapForChar(ch);

  arr[0] := src[0];
  arr[1] := src[1];
  arr[2] := src[2];
  arr[3] := src[3];
  arr[4] := src[4];
  arr[5] := src[5];
  arr[8] := src[8];
  arr[6] := src[6];
  arr[7] := src[7];
  arr[9] := src[9];
  arr[10] := src[10];
  arr[11] := src[11];
  arr[12] := src[12];
  arr[13] := src[13];
  arr[14] := src[14];
  arr[15] := src[15]
}

| Initialisation functions for various parts of the alphabet |
| They are split up so that the program takes less time to load into RAM, not because the memory usage is particularly high |
proc initAlphabet() is
{
  initUpperCase();
  initLowerCase();
  initNumbers();
  initSymbols()
}

proc initNumbers() is
{
  alphabet[0] := [#0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000,
    #0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000];

  alphabet[1] := [#0000,#0fc0,#3830,#7038,#e07c,#e0ce,#e18e,#e30e,
    #e60e,#7c1e,#381c,#1838,#07e0,#0000,#0000,#0000]; |0|
  alphabet[2] := [#0000,#0780,#3b80,#4380,#0380,#0380,#0380,#0380,
    #0380,#0380,#0380,#0380,#7ffc,#0000,#0000,#0000]; |1|
  alphabet[3] := [#0000,#3ff0,#603c,#001c,#001c,#0070,#00e0,#0380,
    #0600,#1c00,#3000,#7000,#7ffc,#0000,#0000,#0000]; |2|
  alphabet[4] := [#0000,#1fe0,#6070,#0038,#0038,#00f0,#1fc0,#0078,
    #001c,#001c,#001c,#6078,#3fc0,#0000,#0000,#0000]; |3|
  alphabet[5] := [#0000,#01e0,#03e0,#07e0,#0fe0,#1ee0,#3ce0,#70e0,
    #e0e0,#fffe,#00e0,#00e0,#00e0,#0000,#0000,#0000]; |4|
  alphabet[6] := [#0000,#7ff8,#7000,#7000,#7000,#7fc0,#00f0,#003c,
    #001c,#001c,#0038,#4070,#3fc0,#0000,#0000,#0000]; |5|
  alphabet[7] := [#0000,#03f8,#1e00,#3800,#3000,#71f0,#761c,#780e,
    #780e,#780e,#381c,#1c38,#07f0,#0000,#0000,#0000]; |6|
  alphabet[8] := [#0000,#7ffe,#000e,#001c,#0070,#00e0,#01c0,#0380,
    #0600,#0e00,#1c00,#1c00,#1c00,#0000,#0000,#0000]; |7|
  alphabet[9] := [#0000,#0fe0,#1838,#3838,#3838,#1e70,#07c0,#1c70,
    #3838,#701c,#701c,#3838,#1fe0,#0000,#0000,#0000]; |8|
  alphabet[10] := [#0000,#0fe0,#3838,#701c,#e01e,#e01e,#e01e,#706e,
    #1f8e,#000c,#001c,#0070,#3fc0,#0000,#0000,#0000] |9|
}

proc initLowerCase() is
{
  alphabet[0] := [#0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000,
                  #0000,#0000,#0000,#0000,#0000,#0000,#0000, #0000];

  alphabet[11] := [#0000,#0000,#0000,#0000,#07fc,#1c1c,#381c,#701c,
    #701c,#701c,#703c,#38fc,#1f9c,#0000,#0000,#0000]; |a|
  alphabet[12] := [#0000,#3800,#3800,#3800,#39f8,#3f1c,#3c0e,#380e,
    #380e,#380e,#381c,#3838,#3fe0,#0000,#0000,#0000]; |b|
  alphabet[13] := [#0000,#0000,#0000,#0000,#03fc,#0e04,#1c00,#3800,
    #3800,#3800,#1c00,#0e00,#03fe,#0000,#0000,#0000]; |c|
  alphabet[14] := [#0000,#000e,#000e,#000e,#03fe,#0e0e,#1c0e,#380e,
    #380e,#380e,#381e,#1c7e,#0fce,#0000,#0000,#0000]; |d|
  alphabet[15] := [#0000,#0000,#0000,#0000,#07f0,#1c1c,#380e,#700e,
    #7ffe,#7000,#3800,#1c06,#07fc,#0000,#0000,#0000]; |e|
  alphabet[16] := [#0000,#03fe,#0f00,#1c00,#1c00,#1c00,#fff8,#1c00,
    #1c00,#1c00,#1c00,#1c00,#1c00,#0000,#0000,#0000]; |f|
  alphabet[17] := [#0000,#0000,#0000,#0000,#07fc,#1c1c,#381c,#701c,
    #701c,#701c,#703c,#38fc,#1f9c,#001c,#6038,#3fe0]; |g|
  alphabet[18] := [#0000,#7000,#7000,#7000,#73f0,#7e3c,#781c,#701c,
    #701c,#701c,#701c,#701c,#701c,#0000,#0000,#0000]; |h|
  alphabet[19] := [#0000,#0380,#0000,#0000,#3f80,#0380,#0380,#0380,
    #0380,#0380,#0380,#0380,#03f8,#0000,#0000,#0000]; |i|
  alphabet[20] := [#0000,#0038,#0000,#0000,#0ff8,#0038,#0038,#0038,
    #0038,#0038,#0038,#0038,#0038,#0038,#0070,#1fc0]; |j|
  alphabet[21] := [#0000,#3800,#3800,#3800,#3818,#3860,#3880,#3b00,
    #3f80,#39c0,#3870,#383c,#381e,#0000,#0000,#0000]; |k|
  alphabet[22] := [#0000,#3f80,#0380,#0380,#0380,#0380,#0380,#0380,
    #0380,#0380,#0380,#0380,#03f8,#0000,#0000,#0000]; |l|
  alphabet[23] := [#0000,#0000,#0000,#0000,#e71c,#fbee,#e38e,#e38e,
    #e38e,#e38e,#e38e,#e38e,#e38e,#0000,#0000,#0000]; |m|
  alphabet[24] := [#0000,#0000,#0000,#0000,#73f0,#7e3c,#781c,#701c,
    #701c,#701c,#701c,#701c,#701c,#0000,#0000,#0000]; |n|
  alphabet[25] := [#0000,#0000,#0000,#0000,#0fe0,#3838,#701c,#e00e,
    #e00e,#e00e,#701c,#3838,#0fe0,#0000,#0000,#0000]; |o|
  alphabet[26] := [#0000,#0000,#0000,#0000,#73f0,#7e38,#781c,#701c,
    #701c,#701c,#7038,#7070,#7fc0,#7000,#7000,#7000]; |p|
  alphabet[27] := [#0000,#0000,#0000,#0000,#07fc,#1c1c,#381c,#701c,
    #701c,#701c,#703c,#38fc,#1f9c,#001c,#001c,#001c]; |q|
  alphabet[28] := [#0000,#0000,#0000,#0000,#39f8,#3f38,#3c38,#3800,
    #3800,#3800,#3800,#3800,#3800,#0000,#0000,#0000]; |r|
  alphabet[29] := [#0000,#0000,#0000,#0000,#1ff0,#7818,#7000,#3c00,
    #07f0,#007c,#001c,#603c,#1ff0,#0000,#0000,#0000]; |s|
  alphabet[30] := [#0000,#0000,#0e00,#0e00,#0e00,#fffc,#0e00,#0e00,
    #0e00,#0e00,#0e00,#0704,#03fc,#0000,#0000,#0000]; |t|
  alphabet[31] := [#0000,#0000,#0000,#0000,#701c,#701c,#701c,#701c,
    #701c,#701c,#703c,#78fc,#1f9c,#0000,#0000,#0000]; |u|
  alphabet[32] := [#0000,#0000,#0000,#0000,#c006,#600c,#701c,#3818,
    #1830,#0c60,#06c0,#07c0,#0380,#0000,#0000,#0000]; |v|
  alphabet[33] := [#0000,#0000,#0000,#0000,#e187,#e3c7,#63c6,#7446,
    #766e,#346c,#342c,#3c3c,#1818,#0000,#0000,#0000]; |w|
  alphabet[34] := [#0000,#0000,#0000,#0000,#701c,#3830,#0c60,#07c0,
    #0380,#0ee0,#1c70,#3018,#e00e,#0000,#0000,#0000]; |x|
  alphabet[35] := [#0000,#0000,#0000,#0000,#6003,#3006,#180e,#0c0c,
    #0618,#0330,#03f0,#01e0,#00c0,#0180,#0700,#fc00]; |y|
  alphabet[36] := [#0000,#0000,#0000,#0000,#7ffc,#0018,#0070,#00c0,
    #0380,#0600,#1c00,#3000,#7ffc,#0000,#0000,#0000]  |z|
}

proc initUpperCase() is
{
  alphabet[0] := [#0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000,
                  #0000,#0000,#0000,#0000,#0000,#0000,#0000, #0000];

  alphabet[37] := [#0000,#01c0,#03e0,#03e0,#0670,#0670,#0c38,#1c38,
    #181c,#3ffc,#300e,#600e,#e006,#0000,#0000,#0000]; |A|
  alphabet[38] := [#0000,#7ff0,#703c,#701c,#701c,#7070,#7fe0,#7038,
    #701e,#700e,#700e,#703c,#7ff0,#0000,#0000,#0000]; |B|
  alphabet[39] := [#0000,#03fc,#0e00,#3c00,#3800,#7000,#7000,#7000,
    #7000,#3800,#3c00,#0e00,#03fc,#0000,#0000,#0000]; |C|
  alphabet[40] := [#0000,#7fe0,#7038,#701c,#700e,#700e,#700e,#700e,
    #700e,#700c,#701c,#7038,#7fe0,#0000,#0000,#0000]; |D|
  alphabet[41] := [#0000,#3ffc,#3800,#3800,#3800,#3800,#3ff8,#3800,
    #3800,#3800,#3800,#3800,#3ffc,#0000,#0000,#0000]; |E|
  alphabet[42] := [#0000,#3ffc,#3800,#3800,#3800,#3800,#3ff8,#3800,
    #3800,#3800,#3800,#3800,#3800,#0000,#0000,#0000]; |F|
  alphabet[43] := [#0000,#03fc,#0e00,#3c00,#3800,#7000,#7000,#707c,
    #701c,#381c,#381c,#0e1c,#03fc,#0000,#0000,#0000]; |G|
  alphabet[44] := [#0000,#701c,#701c,#701c,#701c,#701c,#7ffc,#701c,
    #701c,#701c,#701c,#701c,#701c,#0000,#0000,#0000]; |H|
  alphabet[45] := [#0000,#7ffc,#0380,#0380,#0380,#0380,#0380,#0380,
    #0380,#0380,#0380,#0380,#7ffc,#0000,#0000,#0000]; |I|
  alphabet[46] := [#0000,#07f0,#0070,#0070,#0070,#0070,#0070,#0070,
    #0070,#0070,#0070,#40e0,#7f80,#0000,#0000,#0000]; |J|
  alphabet[47] := [#0000,#701c,#7038,#70e0,#71c0,#7380,#7f00,#7e00,
    #7380,#71c0,#7070,#7038,#700e,#0000,#0000,#0000]; |K|
  alphabet[48] := [#0000,#7000,#7000,#7000,#7000,#7000,#7000,#7000,
    #7000,#7000,#7000,#7000,#7ff0,#0000,#0000,#0000]; |L|
  alphabet[49] := [#0000,#e00e,#e00e,#f01e,#f836,#d836,#cc66,#cc66,
    #c6c6,#c386,#c386,#c006,#c006,#0000,#0000,#0000]; |M|
  alphabet[50] := [#0000,#701c,#781c,#7c1c,#7e1c,#761c,#731c,#719c,
    #70dc,#70fc,#707c,#703c,#701c,#0000,#0000,#0000]; |N|
  alphabet[51] := [#0000,#0fe0,#3838,#701c,#e00e,#e00e,#e00e,#e00e,
    #e00e,#e00e,#701c,#3838,#0fe0,#0000,#0000,#0000]; |O|
  alphabet[52] := [#0000,#7ff0,#701c,#700e,#700e,#701c,#7038,#7fe0,
    #7000,#7000,#7000,#7000,#7000,#0000,#0000,#0000]; |P|
  alphabet[53] := [#0000,#0fe0,#3838,#701c,#e00e,#e00e,#e00e,#e00e,
    #e00e,#600e,#701c,#3838,#0fe0,#00c0,#0070,#001f]; |Q|
  alphabet[54] := [#0000,#7fc0,#7070,#7070,#7070,#7060,#70c0,#7f80,
    #73c0,#71e0,#7070,#7038,#701c,#0000,#0000,#0000]; |R|
  alphabet[55] := [#0000,#0ff8,#3800,#7000,#7000,#3e00,#0fc0,#01f0,
    #0078,#001c,#001c,#0038,#7fe0,#0000,#0000,#0000]; |S|
  alphabet[56] := [#0000,#fffe,#0380,#0380,#0380,#0380,#0380,#0380,
    #0380,#0380,#0380,#0380,#0380,#0000,#0000,#0000]; |T|
  alphabet[57] := [#0000,#701c,#701c,#701c,#701c,#701c,#701c,#701c,
    #701c,#701c,#701c,#3838,#0fe0,#0000,#0000,#0000]; |U|
  alphabet[58] := [#0000,#c006,#e00e,#600c,#3018,#3018,#1830,#1c70,
    #0c60,#06c0,#06c0,#0380,#0380,#0000,#0000,#0000]; |V|
  alphabet[59] := [#0000,#e1e3,#e1c3,#e3c6,#e3e6,#e3e6,#7666,#366c,
    #3e7c,#3e7c,#1e3c,#1c38,#1c38,#0000,#0000,#0000]; |W|
  alphabet[60] := [#0000,#700c,#3818,#1c30,#0e60,#07c0,#0380,#07c0,
    #0ee0,#1c30,#3818,#700c,#e006,#0000,#0000,#0000]; |X|
  alphabet[61] := [#0000,#c006,#600c,#3018,#1830,#0e60,#07c0,#0380,
    #0380,#0380,#0380,#0380,#0380,#0000,#0000,#0000]; |Y|
  alphabet[62] := [#0000,#7ffc,#001c,#0038,#0070,#00e0,#01c0,#0380,
    #0700,#0e00,#1c00,#3800,#7ffc,#0000,#0000,#0000]  |Z|
}


proc initSymbols() is
{
  alphabet[0] := [#0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000,
    #0000,#0000,#0000,#0000,#0000,#0000,#0000,#0000];

  alphabet[63] := [#0000,#0780,#0780,#0780,#0780,#0300,#0300,#0300,
    #0300,#0300,#0000,#0780,#0780,#0000,#0000,#0000]; |!|
  alphabet[64] := [#0000,#3ff0,#003c,#001c,#003c,#0070,#00e0,#0180,
    #0700,#0700,#0000,#0f00,#0f00,#0000,#0000,#0000]; |?|
  alphabet[65] := [#0000,#07f8,#180e,#7003,#67f3,#cc31,#d831,#d8f3,
    #cfbe,#6000,#7000,#3810,#0fe0,#0000,#0000,#0000]; |@|
  alphabet[66] := [#b0000001111000000
                 , #b0000111111110000
                 , #b0001111111111000
                 , #b0011111111111100
                 , #b0111001111001110
                 , #b0111001111001110
                 , #b1111111111111111
                 , #b1111111111111111
                 , #b1111111111111111
                 , #b1111111111111111
                 , #b1111111111111111
                 , #b0111011111101110
                 , #b0011100110011100
                 , #b0001111001111000
                 , #b0000111111110000
                 , #b0000001111000000] |# - Smiley Face|
}



in
