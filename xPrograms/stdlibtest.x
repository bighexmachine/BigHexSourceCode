| This program calls every standard library function to ensure they all compile |
| It does not check they do the correct operation! |

array arr[16];

proc main() is
{
  delay();
  longdelay();

  verylongdelay();

  displayBitmap(arr);

  clearDisplay();

  mul(2, 3);

  div(12, 7);
  rem(12, 7);

  lsh(2, 1);
  rsh(4, 1);

  abs(-4);

  isOdd(7);
  isEven(7);

  mod(100, 3);

  sRand(112);
  genRand(10);

  initAlphabet();
  getBitmapForChar('A');
  copyBitmapForChar('A',arr)
}
