proc main() is
  var letter_idx;
{
  initAlphabet();
  letter_idx := 0;

  while true do
  {
    displayBitmap(alphabet[letter_idx]);
    delay();

    letter_idx := letter_idx + 1;
    if letter_idx > 66 then
      letter_idx := 0
    else
      skip
  }
}
