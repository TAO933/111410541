function myFilter(arr, callback) {
  const result = []; // 建立新陣列，不破壞原陣列
  
  for (let i = 0; i < arr.length; i++) {
    // 執行 callback 並傳入當前元素，若回傳值為真 (true)
    if (callback(arr[i])) {
      result.push(arr[i]); // 放入新陣列
    }
  }
  
  return result;
}

// 測試：篩選出大於 7 的數字
const numbers = [1, 5, 8, 12];
const filtered = myFilter(numbers, (num) => num > 7);

console.log(filtered); // 輸出: [8, 12]
