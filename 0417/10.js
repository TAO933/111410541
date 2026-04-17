// 定義 calculateTotal 函數
function calculateTotal(cart, discountFunc) {
  let sum = 0;
  
  // 1. 先將 cart 內所有數字相加
  for (let price of cart) {
    sum += price;
  }
  
  // 也可以用更高級的寫法：const sum = cart.reduce((acc, curr) => acc + curr, 0);

  // 2. 將總和傳入 discountFunc 處理後回傳
  return discountFunc(sum);
}

// 測試：傳入 [100, 200, 300] 並透過匿名函數扣除 50 元
const myCart = [100, 200, 300];

const finalPrice = calculateTotal(myCart, function(total) {
  return total - 50;
});

console.log(finalPrice); // (100+200+300) - 50 = 550
