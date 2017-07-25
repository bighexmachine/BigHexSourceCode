var mul_x;

func main() is
  return factorial(6)

func lsu(val x, val y) is
  if (x < 0) = (y < 0)
  then
    return x < y
  else
    return y < 0

func mul_step(val b, val y) is
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

func mul(val n, val m) is
{ mul_x := m;
  return mul_step(1, n)
}

func factorial(val n) is
  if n = 0
  then
    return 1
  else
    return mul(n, factorial(n-1))
