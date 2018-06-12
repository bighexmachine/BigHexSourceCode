val framebuff = #7FF0;

proc main() is
  var n;
{
  clear();

  while true do
  {
    framebuff[0] := framebuff[0] + 1
  }
}

proc clear() is
  var n;
{
  n := 0;
  while n < 16 do
  {
    framebuff[n] := 0;
    n := n + 1
  }
}

proc delay() is
  var n;
{ n := 0;
  while n < 50 do n := n + 1
}
