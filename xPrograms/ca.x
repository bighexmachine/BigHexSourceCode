val framebuff = #7FF0;
var mul_x;

proc main() is
  var i;
  var s1;
  var s2;
  var rules;
  var b;
  var t;
  var loop;
  var rl;
  var loop;
  {rl:=90;
  rules:=[0 , 1 , 0 , 1 , 1 , 0 , 1 , 0];
  s1 := [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  s2 := [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  t := [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  getrule(rules, rl);
  while true do
  {
     updaterule(rules);
     loop:=1;
     empty2(s1);
     empty(t);
     merge(s1,t,15);
     while loop<15 do
     {
        CA(s1,s2, rules);
        merge(s2,t,15-loop);
        draw (t);
        updaterule(rules);
        CA(s2,s1, rules);
        merge(s1,t,14-loop);
        loop:=loop+2;
        draw (t);
        updaterule(rules)
     };
     CA(s1,s2, rules);
     merge(s2,t,15-loop);
     draw (t)
   }
}

proc updaterule(x) is
var loop;
var ex;
{
   ex:=0;
   loop:=0;
   while (loop<30) and (ex=0) do {
    readrule(x);
    ex:=drawrule(x);
    loop:=loop+1
   }
}
func invert(a)is
var ret;
{ if(a=0)
  then {ret:=1}
  else ret:=0;
  return ret
}
func readrule(x) is
var num0;
var ret;
{
  0?num0;
  ret:=num0;
  if(num0>=8)
  then {x[0]:=invert(x[0]); num0:=num0-8}
  else skip; 
  if(num0>=4)
  then {x[1]:=invert(x[1]); num0:=num0-4}
  else skip;
  if(num0>=2)
  then {x[2]:=invert(x[2]); num0:=num0-2}
  else skip; 
  if(num0>=1)
  then {x[3]:=invert(x[3]); num0:=num0-1}
  else skip;
  1?num0;
  if (ret=0) then
  {ret:=num0}
  else skip;
  if(num0>=8)
  then {x[4]:=invert(x[4]); num0:=num0-8}
  else skip; 
  if(num0>=4)
  then {x[5]:=invert(x[5]); num0:=num0-4}
  else skip;
  if(num0>=2)
  then {x[6]:=invert(x[6]); num0:=num0-2}
  else skip; 
  if(num0>=1)
  then {x[7]:=invert(x[7]); num0:=num0-1}
  else skip;
  return ret
}
proc drawrule(x) is
  var bcode1;
  var bcode2;
{
  bcode1:=0;
  bcode2:=0;
  if(x[0]=1)
  then {bcode1:=bcode1+8}
  else skip;
  if(x[1]=1)
  then {bcode1:=bcode1+4}
  else skip;
  if(x[2]=1)
  then {bcode1:=bcode1+2}
  else skip;
  if(x[3]=1)
  then {bcode1:=bcode1+1}
  else skip;
  if(x[4]=1)
  then {bcode2:=bcode2+8}
  else skip;
  if(x[5]=1)
  then {bcode2:=bcode2+4}
  else skip;
  if(x[6]=1)
  then {bcode2:=bcode2+2}
  else skip;
  if(x[7]=1)
  then {bcode2:=bcode2+1}
  else skip;
  0!bcode1; 
  1!bcode2
}
proc getrule(x, rule) is
 var bcode1;
 var bcode2;
{
  bcode1:=0;
  if(rule>=128)
  then {x[0]:=1; rule:=rule-128; bcode1:=bcode1+8}
  else x[0]:=0;
  if(rule>=64)
  then {x[1]:=1; rule:=rule-64; bcode1:=bcode1+4}
  else x[1]:=0;
  if(rule>=32)
  then {x[2]:=1; rule:=rule-32; bcode1:=bcode1+2}
  else x[2]:=0;
  if(rule>=16)
  then {x[3]:=1; rule:=rule-16; bcode1:=bcode1+1}
  else x[3]:=0;
  if(rule>=8)
  then {x[4]:=1; rule:=rule-8; bcode2:=bcode2+8}
  else x[4]:=0;
  if(rule>=4)
  then {x[5]:=1; rule:=rule-4; bcode2:=bcode2+4}
  else x[5]:=0;
  if(rule>=2)
  then {x[6]:=1; rule:=rule-2; bcode2:=bcode2+2}
  else x[6]:=0;
  if(rule>=1)
  then {x[7]:=1; bcode2:=bcode2+1}
  else x[7]:=0;
  1!bcode1; 
  0!bcode2
}
proc addone(x) is
{
  if(x[0]=0)
  then {x[0]:=1}
  else x[0]:=0;
  if(x[1]=0)
  then {x[1]:=1}
  else x[1]:=0;
  if(x[2]=0)
  then {x[2]:=1}
  else x[2]:=0;
  if(x[3]=0)
  then {x[3]:=1}
  else x[3]:=0;
  if(x[4]=0)
  then {x[4]:=1}
  else x[4]:=0;
  if(x[5]=0)
  then {x[5]:=1}
  else x[5]:=0;
  if(x[6]=0)
  then {x[6]:=1}
  else x[6]:=0;
  if(x[7]=0)
  then {x[7]:=1}
  else x[7]:=0
}

func lsu(x, y) is
  if (x < 0) = (y < 0)
  then 
    return x < y
  else
    return y < 0

func mul_step(b, y) is
  var r;
{ if (b < 0) or (~lsu(b, mul_x))
  then
    r := 0
  else
    r := mul_step(b + b, y + y);
  if ~lsu(mul_x, b)
  then
  { mul_x := mul_x - b;
    r := r + y
  }
  else
    skip;
  return r
}  

func mul(n, m) is
{ mul_x := m;
  return mul_step(1, n)
}
proc CA(a, b, rul) is
   var n;
   {
   n:=1;
   while n<17 do
   {

     if ((a[n-1]>0) and (a[n]>0) and (a[n+1]>0))
     then
     {
       b[n]:=rul[0]
     }else
       skip;
     if ((a[n-1]>0) and (a[n]>0) and (a[n+1]<1))
     then
     {
       b[n]:=rul[1]
     }else
       skip;
     if ((a[n-1]>0) and (a[n]<1) and (a[n+1]>0))
     then
     {
       b[n]:=rul[2]
     }else
       skip;
     if ((a[n-1]>0) and (a[n]<1) and (a[n+1]<1))
     then
     {
       b[n]:=rul[3]
     }else
       skip;
     if ((a[n-1]<1) and (a[n]>0) and (a[n+1]>0))
     then
     {
       b[n]:=rul[4]
     }else
       skip;
     if ((a[n-1]<1) and (a[n]>0) and (a[n+1]<1))
     then
     {
       b[n]:=rul[5]
     }else
       skip;
     if ((a[n-1]<1) and (a[n]<1) and (a[n+1]>0))
     then
     {
       b[n]:=rul[6]
     }else
       skip;
     if ((a[n-1]<1) and (a[n]<1) and (a[n+1]<1))
     then
     {
       b[n]:=rul[7]
     }else
       skip;
     n:=n+1
   }
}

proc merge(s, q, i) is
  var n;
  var p;
  {n:=1;
   p:=1;
   q[i]:=0;
  while n<17 do
  { 
   if (s[n]>0)
   then
     q[i]:=q[i]+p
   else
      skip;
   p:=mul(p,2);
   n:=n+1
  }
  }

proc draw(s) is
  var n;
  var p;
{ n := 0; p:=1;
  while n < 16 do
  { framebuff[n] := s[n];
    n := n + 1
  }
}

proc empty(s) is
  var n;
{ n:=0;
 while n < 16 do
 {
  s[n] := 0;
  n := n + 1
 }
}
proc empty2(s) is
  var n;
{ n:=0;
 while n < 18 do
 {
  s[n] := 0;
  n := n + 1
  
 };
 s[8]:=1
}
proc delay() is
  var n;
{ n := 0;
  while n < 100 do n := n + 1
}