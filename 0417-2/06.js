const jsonStr = '{"title": "Post 1", "tags": ["js", "node"]}';

// 1. 將 JSON 字串轉換成 JavaScript 物件
const obj = JSON.parse(jsonStr);

// 2. 存取 tags 陣列中的第二個元素 (索引值為 1)
console.log(obj.tags[1]); // 輸出: "node"
