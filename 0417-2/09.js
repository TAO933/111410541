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
