function countdown(start) {
  let n = start;
  while (n > 0) {
    console.log(n);
    n--;
  }
  console.log("發射！");
}
countdown(5); // 5 4 3 2 1 發射！
