| ****************************|
|   BIG HEX STANDARD LIBRARY  |
| ****************************|
val framebuff = #FFF0;

module (stdlib) is

| delays execution for a short while (0.5s) |
proc delay() is
  var n;
{ n := 0;
  while n < 25 do n := n + 1
}

| copies the provided bitmat into the display buffer |
proc displayBitmap(b) is
  var n;
{
  n := 0;
  while n < 16 do
  {
    framebuff[15-n] := b[n];
    n := n + 1
  }
}

| sets all bits in the display buffer to 0 |
proc clearDisplay() is
  var n;
{
  n := 0;
  while n < 16 do
  {
    framebuff[15-n] := 0;
    n := n + 1
  }
}

proc multiply() is delay()
proc divide() is delay()

proc isOdd() is delay()
proc isEven() is delay()
proc mod() is delay()
proc genRand() is delay()
proc genRandUpTo()  is delay()

in
