## 習題 6 



## 摘要

JavaScript 進階函數與陣列操作的實作挑戰題

---

### 練習 1 — Callback 基礎實作
**程式碼：**
```javascript
// 定義 mathTool 函數
// 它接受兩個數字與一個名為 action 的 callback 函數
function mathTool(num1, num2, action) {
  return action(num1, num2);
}

// 實作與呼叫
// 1. 傳入相加的匿名函數
const addResult = mathTool(10, 5, function(a, b) {
  return a + b;
});

// 2. 傳入相減的匿名函數 (這裡示範使用 ES6 箭頭函數寫法，更精簡)
const subtractResult = mathTool(10, 5, (a, b) => a - b);

// 輸出結果
console.log(addResult);      // 15
console.log(subtractResult); // 5


```
**測試結果：**
>15
> 
>5

---

### 練習 2 — 匿名函數與立即執行 (IIFE)
**程式碼：**
```javascript

(function() {
  const count = 100;
  console.log("Count is: " + count);
})();


```
**測試結果：**
> Count is: 100
---

### 練習 3 — 箭頭函數與陣列轉換
**程式碼：**
```javascript
const prices = [100, 200, 300, 400];

// 使用 map 結合單行箭頭函數
const discountedPrices = prices.map(price => price * 0.8);

console.log(discountedPrices); // [80, 160, 240, 320]
```
**測試結果：**
> [80, 160, 240, 320]


---

### 練習 4 — 陣列參數的「破壞性修改」
**程式碼：**
```javascript
function cleanData(arr) {
  arr.pop();      // 移除最後一個元素
  arr.unshift("Start"); // 在最前面加上 "Start"
}

let myData = [1, 2, 3];
cleanData(myData);

console.log(myData); // 輸出: ["Start", 1, 2]
```
**測試結果：**
> ["Start", 1, 2]

---

### 練習 5 — 函數回傳函數 (Higher-Order Function)
**程式碼：**
```javascript
function multiplier(factor) {
  // 回傳一個接收 n 的箭頭函數
  return (n) => n * factor;
}

const double = multiplier(2); // 此時 double 變成了一個 (n) => n * 2 的函數
console.log(double(10));    // 預期輸出: 20

const triple = multiplier(3); // 也可以輕易建立三倍器
console.log(triple(10));    // 輸出: 30
```
**測試結果：**
> 20 
>
>30

---

### 練習 6 — Callback 篩選器
**程式碼：**
```javascript
function myFilter(arr, callback) {
  const result = []; // 建立新陣列，不破壞原陣列
  
  for (let i = 0; i < arr.length; i++) {
    // 執行 callback 並傳入當前元素，若回傳值為真 (true)
    if (callback(arr[i])) {
      result.push(arr[i]); // 放入新陣列
    }
  }
  
  return result;
}

// 測試：篩選出大於 7 的數字
const numbers = [1, 5, 8, 12];
const filtered = myFilter(numbers, (num) => num > 7);

console.log(filtered); // 輸出: [8, 12]
```
**測試結果：**
> [8, 12]

---

### 練習 7 — 箭頭函數處理物件
**程式碼：**
```javascript
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 }
];

const firstAdult = users.find(user => user.age >= 18);
console.log(firstAdult); // 輸出: { name: "Alice", age: 25 } 
```
**測試結果：**
> { name: "Alice", age: 25 }
---

### 練習 8 — 參數傳址陷阱：重新賦值 vs 修改
**程式碼：**
```javascript
let listA = [1, 2];
let listB = [3, 4];

function process(a, b) {
  a.push(99);
  b = [100];
}
process(listA, listB);
```
**測試結果：**
> listA：[1, 2, 99]
>
>listB：[3, 4]

---
**為什麼？**
a.push(99)：a 指向的是與 listA 同一個記憶體位址（Heap）。push 是修改 (Mutate) 原本的記憶體內容，所以外部的 listA 會受影響。

b = [100]：這是一個重新賦值 (Re-assignment)。這動作讓區域變數 b 指向了一個新的記憶體位址，它與外部 listB 的連結從此斷開了。因此，外部的 listB 依然指向原本的 [3, 4]。

---

### 練習 9 — 延遲執行的 Callback）
**程式碼：**
```javascript
const parts = ["Task", "Completed"];

// setTimeout(callback, 毫秒)
setTimeout(() => {
  // 使用 join 將陣列組合成字串，中間加空格
  const message = parts.join(" ");
  console.log(message);
}, 2000);
```
**測試結果：**
> Task Completed

---

### 練習 10 — 綜合應用：計算總價
**程式碼：**
```javascript
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
```
**測試結果：**
> 550
---
