

val framebuff = #7FF0;


func movePlayer(p, vert, horiz) is
    {
    if vert = 1 then {
        p[0] := p[0] + 1
    }
    else
        skip;
        return p

}

proc clearBoard(s) is
var n;
{
    n := 0;
    while n < 16 do 
    { 
        framebuff[n] := s[n];
        n := n + 1
    }
}

proc drawBoard(s, p) is
var x;
{
    s[p[1]] := p[0];
    x := 0;
    while x < 16 do 
    { 
        framebuff[x] := s[x];
        x := x + 1
    }
}

proc run(s, p) is
    
    clearBoard(s);
    drawBoard(s, p)



proc main() is
  var clear;
  var p1Pos;
  var p2;
{ clear := [ #b1111111111111111
           , #b0000000000000000
           , #b1111111111111111
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
    p1Pos := [0000000010000000,7];
    run(clear, p1Pos)

}

nd3cbgu`