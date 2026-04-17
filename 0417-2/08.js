let user = "Guest";

// 使用三元運算子： 條件 ? 成立執行 : 不成立執行
const html = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;

console.log(html); // 輸出: <h1>Welcome, Guest</h1>

// 測試：如果 user 為空 (null 或 "")
user = null;
const htmlEmpty = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;
console.log(htmlEmpty); // 輸出: <h1>Welcome, Stranger</h1>
