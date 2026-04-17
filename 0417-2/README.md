## 習題 7 



## 摘要

JavaScript 進階函數與陣列操作的實作挑戰題

---

### 練習 1 — 物件屬性存取 (Object Property Access)
**程式碼：**
```javascript
const post = {
  id: 1,
  title: "Hello World",
  content: "Markdown content"
};

// 1. 點符號 (Dot notation) - 最常用且直觀
console.log(post.title);

// 2. 中括號 (Bracket notation) - 括號內必須是字串
console.log(post["title"]);


```
**測試結果：**
>Hello World
>
>Hello World

---

### 練習 2 — 物件解構賦值 (Object Destructuring)
**程式碼：**
```javascript
const req = { 
  body: { 
    title: "JS教學", 
    content: "內容在此", 
    author: "Gemini" 
  } 
};

// 用一行程式碼從 req.body 中取出 title 和 content
const { title, content } = req.body;

// 驗證結果
console.log(title);   // "JS教學"
console.log(content); // "內容在此"

```
**測試結果：**
> JS教學
>
>內容在此
---

### 練習 3 — 陣列的遍歷與字串拼接 (Array forEach & Template Literals)
**程式碼：**
```javascript
const posts = [
  { id: 1, t: "A" },
  { id: 2, t: "B" }
];

let html = "";

// 使用 forEach 遍歷並拼接
posts.forEach(post => {
  // 使用反引號與 ${} 嵌入變數
  html += `<div>${post.t}</div>`;
});

console.log(html); // 輸出: "<div>A</div><div>B</div>"
```
**測試結果：**
> <div>A</div><div>B</div>


---

### 練習 4 — 字典與動態參數 (URL Params / Dictionary)
**程式碼：**
```javascript
// 1. 建立一個名為 params 的空物件
const params = {};

// 2. 動態新增一個鍵 (Key) 為 "id"，值 (Value) 為 99 的屬性
// 方式 A：點符號
params.id = 99;

// 方式 B：中括號 (當 Key 是變數時特別有用)
// params["id"] = 99;

// 3. 印出這個物件
console.log(params); // 輸出: { id: 99 }
```
**測試結果：**
> { id: 99 }

---

### 練習 5 — Callback 函數傳參 (Passing Data via Callbacks)
**程式碼：**
```javascript
// 1. 定義 fetchData 函數
function fetchData(id, callback) {
  // 模擬資料抓取
  const fakeData = {
    id: id,
    status: "success"
  };

  // 依照 Node.js 慣例：
  // 第一個參數傳入 null (代表沒有錯誤)
  // 第二個參數傳入剛才建立的 fakeData 物件
  callback(null, fakeData);
}

// 2. 執行 fetchData 並處理回傳結果
fetchData(101, (err, data) => {
  if (err) {
    console.log("發生錯誤：" + err);
  } else {
    console.log("成功取得資料：", data);
    // 預期輸出：成功取得資料： { id: 101, status: 'success' }
  }
});
```
**測試結果：**
> { id: 101, status: 'success' }

---

### 練習 6 — JSON 處理 (Parsing JSON)
**程式碼：**
```javascript
const jsonStr = '{"title": "Post 1", "tags": ["js", "node"]}';

// 1. 將 JSON 字串轉換成 JavaScript 物件
const obj = JSON.parse(jsonStr);

// 2. 存取 tags 陣列中的第二個元素 (索引值為 1)
console.log(obj.tags[1]); // 輸出: "node"
```
**測試結果：**
> node

---

### 練習 7 — 模擬資料庫查詢 (Simulating DB Queries)
**程式碼：**
```javascript
// 1. 實作模擬資料庫查詢的函數
function fakeGet(sql, params, callback) {
  // 這裡模擬從資料庫抓到的那一列資料 (Row)
  const fakeRow = {
    id: 1,
    title: "掌握 JavaScript 函數",
    content: "這是一篇關於 Callback 的文章..."
  };

  // 執行回呼函數
  // 第一個參數傳入 null 代表沒有錯誤
  // 第二個參數傳入模擬的資料物件 fakeRow
  callback(null, fakeRow);
}

// 2. 測試呼叫
const query = "SELECT * FROM posts WHERE id = ?";
const inputParams = [1];

fakeGet(query, inputParams, (err, row) => {
  if (err) {
    console.error("查詢失敗");
  } else {
    // 練習：請在這裡印出文章的 title
    // 因為資料存放在 row 物件中，我們用點符號存取屬性
    console.log("抓到的文章標題是：", row.title);
  }
});
```
**測試結果：**
> 抓到的文章標題是:掌握 JavaScript 函數
---

### 練習 8 — 樣板字串中的邏輯運算 (Template Literals with Logic)
```javascript
let user = "Guest";

// 使用三元運算子： 條件 ? 成立執行 : 不成立執行
const html = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;

console.log(html); // 輸出: <h1>Welcome, Guest</h1>

// 測試：如果 user 為空 (null 或 "")
user = null;
const htmlEmpty = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;
console.log(htmlEmpty); // 輸出: <h1>Welcome, Stranger</h1>
```
**測試結果：**
> <h1>Welcome, Stranger</h1>

---


### 練習 9 — 陣列物件的排序與切片 (Sort & Substring)
**程式碼：**
```javascript
const contents = [
  "Very long content here",
  "Another Very long content here",
  "3rd Very long content here"
];

// 處理陣列中的每一個字串 (使用 map)
const summaries = contents.map(str => {
  // 取出前 10 個字元 (索引 0 到 10) 並加上 ...
  return str.substring(0, 10) + "...";
});

console.log(summaries); 
// 輸出: ["Very long ...", "Another Ve...", "3rd Very l..."]
```
**測試結果：**
> ["Very long ...", "Another Ve...", "3rd Very l..."]

---

### 練習 10 — 錯誤優先回呼模式 (Error-First Callback Pattern)
**程式碼：**
```javascript
// 定義 calculateTotal 函數
// 1. 定義 checkAdmin 函數
function checkAdmin(role, callback) {
  if (role !== "admin") {
    // 發生錯誤：第一個參數傳入錯誤訊息
    return callback("Access Denied");
  }
  
  // 成功：第一個參數傳入 null，第二個參數傳入成功資料
  callback(null, "Welcome");
}

// 2. 測試：非 admin 狀況
checkAdmin("guest", (err, msg) => {
  if (err) {
    console.log("驗證失敗：" + err); // 輸出: 驗證失敗：Access Denied
  } else {
    console.log(msg);
  }
});

// 3. 測試：admin 狀況
checkAdmin("admin", (err, msg) => {
  if (err) {
    console.log(err);
  } else {
    console.log("驗證成功：" + msg); // 輸出: 驗證成功：Welcome
  }
});
```
**測試結果：**
> 驗證失敗：Access Denied
>
>驗證成功：Welcome
---
