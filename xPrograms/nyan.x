val framebuff = #7FF0;

proc main() is
  var a;
  var b;
{

  a := [ #b0001100000011000
       , #b0010010000100100
       , #b1110001001000100
       , #b0010000110000100
       , #b0100000000000010
       , #b0100010000010010
       , #b0100110000110010
       , #b0100000010000010
       , #b0100000000000010
       , #b0100010000100010
       , #b0010011111100100
       , #b0001000000001000
       , #b0000111111110000
       , #b1111001001001000
       , #b0001000101000100
       , #b0000111100111100
       ];

  displayBitmap(a);
  while true do
  {
    framebuff[2] := #b1111010010010000;
    framebuff[1] := #b0010001010001000;
    framebuff[0] := #b0001110001110000;
    delay();
    framebuff[2] := #b1111001001001000;
    framebuff[1] := #b0001000101000100;
    framebuff[0] := #b0000111100111100;
    delay()
  }
}

proc displayBitmap(s) is
{
  copyImage(s);
  delay()
}


proc copyImage(s) is
  var n;
{
  n := 0;
  while n < 16 do
  {
    framebuff[15-n] := s[n];
    n := n + 1
  }
}

proc delay() is
  var n;
{ n := 0;
  while n < 10 do n := n + 1
}
