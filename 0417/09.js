const parts = ["Task", "Completed"];

// setTimeout(callback, 毫秒)
setTimeout(() => {
  // 使用 join 將陣列組合成字串，中間加空格
  const message = parts.join(" ");
  console.log(message);
}, 2000);
