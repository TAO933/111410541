## 習題 4 

AI 問答 -- https://claude.ai/chat/30d46a16-edd1-4da0-8492-71c44c76ab07



## 摘要

為了讓你更清楚程式運作的邏輯，我將每一題的**完整測試程式碼**與 **Console（控制台）輸出的預期結果**整理如下：

---

### 練習 1 — 判斷奇偶數（if）
**程式碼：**
```javascript
function checkOddEven(num) {
  if (num % 2 === 0) {
    console.log(`${num} 是偶數`);
  } else {
    console.log(`${num} 是奇數`);
  }
}
checkOddEven(7);  // 7 是奇數
checkOddEven(12); // 12 是偶數


```
**測試結果：**
> 7 是奇數
>12 是偶數

---

### 練習 2 — 計算 1 到 N 的總和（for）
**程式碼：**
```javascript
function sumToN(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}
console.log(sumToN(10)); // 55
```
**測試結果：**
> 55
---

### 練習 3 — 猜數字倒數計時（while）
**程式碼：**
```javascript
function countdown(start) {
  let n = start;
  while (n > 0) {
    console.log(n);
    n--;
  }
  console.log("發射！");
}
countdown(5); // 5 4 3 2 1 發射！
```
**測試結果：**
> 5
4
3
2
1
發射！

---

### 練習 4 — 陣列過濾偶數（array + for）
**程式碼：**
```javascript
function filterEven(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 2 === 0) {
      result.push(arr[i]);
    }
  }
  return result;
}
console.log(filterEven([1, 2, 3, 4, 5, 6])); // [2, 4, 6]
```
**測試結果：**
> [ 2, 4, 6 ]

---

### 練習 5 — 找出陣列最大值（array + function）
**程式碼：**
```javascript
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}
console.log(findMax([3, 7, 2, 9, 5])); // 9
```
**測試結果：**
> 9

---

### 練習 6 — 物件：計算學生平均分（object + function）
**程式碼：**
```javascript
const student = {
  name: "小明",
  scores: [88, 92, 75, 96, 84]
};

function calcAverage(student) {
  let total = 0;
  for (let score of student.scores) {
    total += score;
  }
  return `${student.name} 的平均分：${(total / student.scores.length).toFixed(1)}`;
}
console.log(calcAverage(student)); // 小明 的平均分：87.0
```
**測試結果：**
> 小明 的平均分：87.0

---

### 練習 7 — JSON 解析與顯示（json + object）
**程式碼：**
```javascript
const jsonStr = '{"name":"台北","weather":"晴天","temp":28}';

function parseWeather(json) {
  const data = JSON.parse(json);
  console.log(`城市：${data.name}`);
  console.log(`天氣：${data.weather}`);
  console.log(`氣溫：${data.temp}°C`);
}
parseWeather(jsonStr);
```
**測試結果：**
> 城市：台北
>天氣：晴天
>氣溫：28°C

---

### 練習 8 — 購物車總價計算（array + object + function）
**程式碼：**
```javascript
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
```
**測試結果：**
> 購物車總價：$265

---

### 練習 9 — while 產生費波那契數列（while + array）
**程式碼：**
```javascript
function fibonacci(count) {
  let seq = [0, 1];
  while (seq.length < count) {
    let len = seq.length;
    seq.push(seq[len - 1] + seq[len - 2]);
  }
  return seq;
}
console.log(fibonacci(8)); // [0, 1, 1, 2, 3, 5, 8, 13]
```
**測試結果：**
> [0, 1, 1, 2, 3, 5, 8, 13]

---

### 練習 10 — 學生成績管理系統（綜合）
**程式碼：**
```javascript
const classData = {
  className: "三年甲班",
  students: [
    { name: "小華", score: 88 },
    { name: "小美", score: 95 },
    { name: "小強", score: 72 },
    { name: "小雯", score: 61 }
  ]
};

function classReport(data) {
  let passed = [];
  let failed = [];

  for (let s of data.students) {
    if (s.score >= 60) {
      passed.push(s.name);
    } else {
      failed.push(s.name);
    }
  }

  console.log(`班級：${data.className}`);
  console.log(`及格：${passed.join("、")}`);
  console.log(`不及格：${failed.length > 0 ? failed.join("、") : "無"}`);
}
classReport(classData);
```
**測試結果：**
> 班級：三年甲班
>及格：小華、小美、小強、小雯
>不及格：無
---
