// 1. 建立一個名為 params 的空物件
const params = {};

// 2. 動態新增一個鍵 (Key) 為 "id"，值 (Value) 為 99 的屬性
// 方式 A：點符號
params.id = 99;

// 方式 B：中括號 (當 Key 是變數時特別有用)
// params["id"] = 99;

// 3. 印出這個物件
console.log(params); // 輸出: { id: 99 }
