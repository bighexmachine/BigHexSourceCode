module (times) is

var mul_x;

func mul_step(b, y) is
  var r;
{ if b < mul_x
  then
    r := mul_step(b + b, y + y)
  else
    r := 0;
  if b <= mul_x
  then
  { mul_x := mul_x - b;
    r := r + y
  }
  else
    skip;
  return r
}

func times(n, m) is
  var y;
{ if n < m
  then
  { mul_x := n;
    y := m
  }
  else
  { mul_x := m;
    y := n
  };
  return mul_step(1, y)
}

in

func main() is
  return factorial(5)

func factorial(n) is
  if n = 0
  then
    return 1
  else
    return times(n, factorial(n-1))
