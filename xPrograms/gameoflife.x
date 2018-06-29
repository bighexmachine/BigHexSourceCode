val framebuff = #7FF0;

proc main() is
  var n;
  var state;
{
  state := [ #b0000100000000000
       , #b0000000000000000
       , #b0011100000011100
       , #b0011000000001100
       , #b0011000000001100
       , #b0011000000001100
       , #b0011000000001100
       , #b0011000000001100
       , #b0011000110001100
       , #b0011000110001100
       , #b0011000110001100
       , #b0011000110001100
       , #b0011111111111100
       , #b0001111111111000
       , #b0000000000000000
       , #b0000000000000000
       ];

  while true do
  {
    draw(state);
    update(state)
  }
}

proc update(state) is
  var row;
  var col;
  var curval;
  var newval;
{
  row := 0;

  while row < 16 do
  {
    curval := framebuff[row];
    newval := 0;

    col := 0;
    while col < 16 do
    {
      newval := newval + newval;

      if(curval >= 0)
      then
        newval := newval + 1
      else
        skip;

      col := col + 1;
      curval := curval + curval
    };

    state[row] := newval;
    row := row + 1
  }
}

proc draw(state) is
  var n;
{
  n := 0;
  while n < 16 do
  {
    framebuff[n] := state[n];
    n := n + 1
  }
}
