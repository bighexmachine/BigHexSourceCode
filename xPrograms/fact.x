func main() is
  return factorial(5)

func factorial(n) is
  if n = 0
  then
    return 1
  else
    return mul(n, factorial(n-1))
