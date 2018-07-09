
array msg[21];
val msg_len = 21;

proc main() is
  var letter_idx;
{
  msg := ['W', 'E', 'L', 'C', 'O', 'M', 'E', 'T', 'O', 'C', 'S', '@', 'B', 'R', 'I', 'S', 'T', 'O', 'L', '!', '#'];

  initUpperCase();
  initSymbols();
  letter_idx := 0;

  while true do
  {
    displayBitmap(getBitmapForChar(msg[letter_idx]));
    delay();

    letter_idx := letter_idx + 1;
    if letter_idx > msg_len then
      letter_idx := 0
    else
      skip
  }
}
