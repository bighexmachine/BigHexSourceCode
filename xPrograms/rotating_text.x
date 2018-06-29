


val fbuff = #FFF0;

array nextLetter[16];

val numLetters = 8;
array letters[8];

proc main() is
  {
    letters := "HIDAVIDA";
    clearDisplay();
    while true do
    {
      rotateThroughWord();
      wink()
    }
  }

proc wink() is
{
  fbuff[11] := #b0111001111111110;
  delay();
  fbuff[10] := #b0111001111111110;
  delay();
  fbuff[10] := #b0111001111001110;
  delay();
  fbuff[11] := #b0111001111001110;
  delay()
}


proc rotateThroughWord() is
  var letterCounter;
  {
    letterCounter:=0;
    while letterCounter < numLetters do
    {
      swapInNextLetter(letterCounter);
      letterCounter := letterCounter + 1
    }
  }

proc swapInNextLetter(nextLetterIndex) is
  var columnCounter;
  var rowCounter;
  {
    getBitmapForChar('H', nextLetter);
    columnCounter := 0;
    while columnCounter < 16 do
    {
      rowCounter := 0;
      while rowCounter < 16 do
      {
        fbuff[rowCounter] := fbuff[rowCounter] + fbuff[rowCounter];
        if nextLetter[rowCounter] < 0 then fbuff[rowCounter] := fbuff[rowCounter] + 1 else skip;
        nextLetter[rowCounter] := nextLetter[rowCounter] + nextLetter[rowCounter];
        rowCounter := rowCounter + 1
      };
      columnCounter := columnCounter + 1
    }
  }
