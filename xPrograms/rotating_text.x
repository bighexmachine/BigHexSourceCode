array nextLetter[16];

val numLetters = 19;
array letters[19];

proc main() is
{
  letters := ['I', ' ', 'a', 'm', ' ', 'a', ' ', '1', '6', 'b', 'i', 't', ' ', 'C', 'P', 'U', '!', ' ', ' '];
  clearDisplay();
  initAlphabet();
  while true do
  {
    rotateThroughWord()
  }
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
  var letter;
{
  copyBitmapForChar(letters[nextLetterIndex], nextLetter);

  columnCounter := 15;
  while columnCounter >= 0 do
  {
    rowCounter := 15;
    while rowCounter >= 0 do
      var iRowCounter;
    {
      iRowCounter := 15 - rowCounter;

      framebuff[rowCounter] := framebuff[rowCounter] + framebuff[rowCounter];
      if nextLetter[iRowCounter] < 0 then framebuff[rowCounter] := framebuff[rowCounter] + 1 else skip;
      nextLetter[iRowCounter] := nextLetter[iRowCounter] + nextLetter[iRowCounter];
      rowCounter := rowCounter - 1
    };
    columnCounter := columnCounter - 1
  }
}
