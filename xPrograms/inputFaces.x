



val framebuff = #7FF0;

proc main() is
  var i;
  var s;
{ s := [ #b0000001111000000
       , #b0000111111110000
       , #b0001111001111000
       , #b0011100110011100
       , #b0111011111101110
       , #b0110111111110110
       , #b1111111111111111
       , #b1111111111111111
       , #b1111111111111111
       , #b1111111111111111
       , #b0111001111001110
       , #b0111001111001110
       , #b0011111111111100
       , #b0001111111111000
       , #b0000111111110000
       , #b0000001111000000
       ];


  smile(s);
  while true do
  {
    i:=0;
    0?i;
    if i=1 then
    {
      0!1;
      delay();
      winkRight()
    } else if i=2 then
    {
      0!2;
      delay();
      frown()
    } else if i=4 then
    {
      0!4;
      delay();
      winkLeft()
    } else if i=8 then
    {
      0!8;
      delay();
      grin()
    } else skip;
    0!1;
    delay();
    0!2;
    delay();
    0!4;
    delay();
    0!8;
    delay()
  }
}

proc winkRight() is
{
  framebuff[11] := #b0111001111111110;
  delay();
  framebuff[10] := #b0111001111111110;
  delay();
  framebuff[10] := #b0111001111001110;
  delay();
  framebuff[11] := #b0111001111001110;
  delay()
}

proc winkLeft() is
{
  framebuff[11] := #b0111111111001110;
  delay();
  framebuff[10] := #b0111111111001110;
  delay();
  framebuff[10] := #b0111001111001110;
  delay();
  framebuff[11] := #b0111001111001110;
  delay()
}

proc grin() is
{
  framebuff[1] := #b0000111001110000;
  framebuff[2] := #b0001110000111000;
  framebuff[3] := #b0011100000011100;
  delay();delay();delay();delay();
  framebuff[1] := #b0000111111110000;
  framebuff[2] := #b0001111001111000;
  framebuff[3] := #b0011100000011100
}

proc frown() is
{
 framebuff[2] := #b0001111111111000;
 framebuff[3] := #b0011001111001100;
 framebuff[4] := #b0111100110011110;
 framebuff[5] := #b0111110000111110;
 delay();delay();delay();delay();
 framebuff[2] := #b0001111001111000;
 framebuff[3] := #b0011100110011100;
 framebuff[4] := #b0111011111101110;
 framebuff[5] := #b0110111111110110
}

proc smile(s) is
  var n;
{ n := 0;
  while n < 16 do
  { framebuff[n] := s[n];
    n := n + 1
  }
}

proc rotate() is
  var n;
  var w;
{ n := 0;
  while n < 16 do
  { w := framebuff[n];
    if w < 0
    then
      framebuff[n] := w + w + 1
    else
      framebuff[n] := w + w;
    n := n + 1
  }
}

proc delay() is
  var n;
{ n := 0;
  while n < 40 do n := n + 1
}

