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
