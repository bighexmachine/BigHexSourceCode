val framebuff = #7FF0;

proc main() is
  var i;
  var s;
{ s := [ #b0000001111000000
       , #b0000111111110000
       , #b0001111111111000
       , #b0011111111111100
       , #b0111001111001110
       , #b0111001111001110
       , #b1111111111111111
       , #b1111111111111111
       , #b1111111111111111
       , #b1111111111111111
       , #b0110111111110110
       , #b0111011111101110
       , #b0011100110011100
       , #b0001111001111000
       , #b0000111111110000
       , #b0000001111000000
       ];
  displayBitmap(s);
  while true do
  {
    i:=0;
    while i<16 do
    {
      delay();
      rotate();
      i:=i+1
    };
    wink()
  }
}

proc wink() is
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
