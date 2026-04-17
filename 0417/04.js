function cleanData(arr) {
  arr.pop();      // 移除最後一個元素
  arr.unshift("Start"); // 在最前面加上 "Start"
}

let myData = [1, 2, 3];
cleanData(myData);

console.log(myData); // 輸出: ["Start", 1, 2]
