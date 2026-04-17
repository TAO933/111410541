// 1. 定義 fetchData 函數
function fetchData(id, callback) {
  // 模擬資料抓取
  const fakeData = {
    id: id,
    status: "success"
  };

  // 依照 Node.js 慣例：
  // 第一個參數傳入 null (代表沒有錯誤)
  // 第二個參數傳入剛才建立的 fakeData 物件
  callback(null, fakeData);
}

// 2. 執行 fetchData 並處理回傳結果
fetchData(101, (err, data) => {
  if (err) {
    console.log("發生錯誤：" + err);
  } else {
    console.log("成功取得資料：", data);
    // 預期輸出：成功取得資料： { id: 101, status: 'success' }
  }
});
