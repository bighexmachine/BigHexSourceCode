array images[2];

proc main() is
 |positions of player bars|
 var posA;
 var posB;
 |position of ball|
 var x;
 var y;
 |direction of ball|
 var xs;
 var ys;
 |loop and value vars|
 var i;
 var v;
 var j;
 var m;
 |0:no-one, 1:player 1, 2:player 2|
 var winner;
  {

  images[0] := [ #b0000000000000000
        , #b0000000110000000
        , #b0000001110000000
        , #b0000011110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000000110000000
        , #b0000011111100000
        , #b0000011111100000
        , #b0000000000000000
        ];

  images[1] := [ #b0000000000000000
       , #b0000001111000000
       , #b0011111111111000
       , #b0111000000111100
       , #b0000000001111000
       , #b0000000011110000
       , #b0000000111100000
       , #b0000001111000000
       , #b0000011110000000
       , #b0000111100000000
       , #b0001111000000000
       , #b0011110000000000
       , #b0111100000000000
       , #b0111111111111110
       , #b0111111111111110
       , #b0000000000000000
       ];

    sRand(93);
    while true do
    {

      winner := 0;
      posA := 7;
      posB := 7;
      x := 8;
      y := 3;
      xs := genRand(2);
      if xs=0 then xs:= #FFFF else skip;
      ys := genRand(5)-2;

      clearDisplay();
      i:=posA;
      v:=posA+4;
      while i<v do {framebuff[i]:=framebuff[i]+#8000;i:=i+1};
      i:=posB;
      m:=posB+4;
      while i<m do {framebuff[i]:=framebuff[i]+#0001; i:=i+1};
      framebuff[y]:=framebuff[y]+lsh(1,x);

      while winner=0 do
      {
        |move ball|
        framebuff[y]:=framebuff[y]-lsh(1,x);
        x:=x+xs;
        y:=y+ys;
        if x=15 then
        {
          if ((y-posA)<0) or ((posA+4)<y) then winner:=2 else xs:=0-xs
        }
        else skip;
        if x=0 then
        {
          if ((y-posB)<0) or ((posB+4)<y) then winner:=1 else xs:=0-xs
        }
        else skip;
        if (y=15) or (y=14) or (y=0) or (y=1) then ys:=0-ys else skip;
        framebuff[y]:=framebuff[y]+lsh(1,x);

        |move bars|
        j:=0;
        while j < 50 do
        {
          0?v;
          if v=0 then skip else
          {
            |remove old position|
            i:=posA;

            m:=posA+4;
            while i<m do {framebuff[i]:=framebuff[i]-#8000; i:=i+1};

            |get new position|
            if (v=2) and (posA<12) then posA:=posA-1 else skip;
            if (v=8) and (0<posA) then posA:=posA+1 else skip;
            i:=posA;
            m:=posA+4;
            while i<m do {framebuff[i]:=framebuff[i]+#8000; i:=i+1}
          };

          1?v;
          if v=0 then skip else
          {
            |remove old position|
            i:=posB;
            m:=posB+4;
            while i<m do {framebuff[i]:=framebuff[i]-#0001; i:=i+1};

            |get new position|
            if (v=2) and (posA<12) then posB:=posB-1 else skip;
            if (v=8) and (0<posA) then posB:=posB+1 else skip;
            i:=posB;
            m:=posB+4;
            while i<m do {framebuff[i]:=framebuff[i]+#0001; i:=i+1}
          };
          j:=j+1
        }
      };
      i:=0;
      while i<4 do
      {
        displayBitmap(images[winner-1]);
        longdelay();
        clearDisplay();
        longdelay();
        i:=i+1
      }
    }
  }

proc rotateFrameBuff() is
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
