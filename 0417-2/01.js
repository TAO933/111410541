const post = {
  id: 1,
  title: "Hello World",
  content: "Markdown content"
};

// 1. 點符號 (Dot notation) - 最常用且直觀
console.log(post.title);

// 2. 中括號 (Bracket notation) - 括號內必須是字串
console.log(post["title"]);
