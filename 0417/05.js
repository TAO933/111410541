function multiplier(factor) {
  // 回傳一個接收 n 的箭頭函數
  return (n) => n * factor;
}

const double = multiplier(2); // 此時 double 變成了一個 (n) => n * 2 的函數
console.log(double(10));    // 預期輸出: 20

const triple = multiplier(3); // 也可以輕易建立三倍器
console.log(triple(10));    // 輸出: 30
