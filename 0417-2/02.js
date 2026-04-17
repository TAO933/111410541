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
