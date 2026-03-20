const cart = [
  { name: "蘋果", price: 30, qty: 3 },
  { name: "牛奶", price: 65, qty: 2 },
  { name: "麵包", price: 45, qty: 1 }
];

function calcTotal(cart) {
  let total = 0;
  for (let item of cart) {
    total += item.price * item.qty;
  }
  return `購物車總價：$${total}`;
}
console.log(calcTotal(cart)); // 購物車總價：$265
