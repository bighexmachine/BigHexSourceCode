val framebuff = #7FF0;
array images[3];

proc main() is
 var b;
 var winner;
 var x;
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

    images[2] := [ #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            , #b0000000000000000
            ];

   x:=0;
   while x<16 do {framebuff[x]:=0;x:=x+1};
   while true do
   {
    b:=getRandomNumberUpto(8);
    delay(500);
    0!b;
    1!b;
    winner:=getfirstResponce(b);
    x:=0;
    while x<4 do
    {
     delay(100);
     winner!15;
     copyImage(images[winner]);
     delay(100);
     copyImage(images[2]);
     winner!0;
     x:=x+1
    }
   }
 }

func getfirstResponce(val button) is
 var i;
 var x;
 var pressed;
 var winner;
 {
   pressed:=0;
   while pressed=0 do
   {
     x:=0;
     while x<2 do
     {
       x?i;
       i:=getbit(i, button);
       if i then {pressed:=1; winner:=x} else skip;
       x:=x+1
     }
   };
   return winner
 }

 proc copyImage(array s) is
   var n;
 { n := 0;
   while n < 16 do
   { framebuff[15-n] := s[n];
     n := n + 1
   }
 }

func getbit(val bitPattern, val index) is
 var i;
 var x;
 var res;
 {
   res:=false;
   x:=bitPattern;
   if (x-8)<0 then if index=8 then skip else skip else if index=8 then {res:=true;x:=x-8} else skip;
   if (x-4)<0 then if index=4 then res:=false else skip else if index=4 then {res:=true;x:=x-4} else res:=false;
   if (x-2)<0 then if index=2 then res:=false else skip else if index=2 then {res:=true;x:=x-2} else res:=false;
   if (x-1)<0 then if index=1 then res:=false else skip else if index=1 then res:=true else res:=false;
   return res
 }

func getRandomNumberUpto(val max) is
 var i;
 var rand;
 var pressed;
 var x;
 {
   rand:=1;
   pressed:=0;
   x:=0;
   while pressed=0 do
   {
     0?i;
     if i=0 then skip else pressed:=1;
     1?i;
     if i=0 then skip else pressed:=1;
     rand:=rand+rand;
     if max<rand then rand:=1 else skip;
     0!rand;
     1!rand;
     delay(10)
   };
   0!0;
   1!0;
   return rand
 }


proc delay(val x) is
  var n;
{ n := 0;
  while n < x do n := n + 1
}

