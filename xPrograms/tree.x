val framebuff = #7FF0;

proc main() is
   var init;
   {
     init :=  [  #b0111111111111110
               , #b0000000110000000
               , #b0011111111111100
               , #b0000000110000000
               , #b0000111111110000
               , #b0000011111100000
               , #b0000001111000000
               , #b0001111111111000
               , #b0000011111100000
               , #b0000111111110000
               , #b0001111111111000
               , #b0111111111111110
               , #b0000001111000000
               , #b0011111111111100
               , #b0000000110000000
               , #b0000000110000000
               ];

      while 1 do
      {
        copyImage(init, framebuff);
        bubbleSort();
        delay(10000)
      }
   }

proc bubbleSort() is
  var i;
  var tmp;
  var swapped;
  {
    swapped := true;
    while swapped=true do
     {
       swapped := false;
       i := 2;
       while i < 15 do
       {
         | if this pair is out of order |
         if framebuff[i+1] > framebuff[i] then
         {
           |swap them and remember something changed|
           tmp := framebuff[i+1];
           framebuff[i+1] := framebuff[i];
           framebuff[i] := tmp;
           swapped := true;
           delay(1000)
         } else skip;
         i := i+1
       }
     }
  }

proc copyImage(s, dest) is
   var n;
   {
     n := 0;
     while n < 16 do
     {
       dest[15-n] := s[n];
       n := n + 1
     }
   }

proc delay(t) is
 var n;
 {
   n := 0;
   while n < t do n := n + 1
 }

