// 1. 實作模擬資料庫查詢的函數
function fakeGet(sql, params, callback) {
  // 這裡模擬從資料庫抓到的那一列資料 (Row)
  const fakeRow = {
    id: 1,
    title: "掌握 JavaScript 函數",
    content: "這是一篇關於 Callback 的文章..."
  };

  // 執行回呼函數
  // 第一個參數傳入 null 代表沒有錯誤
  // 第二個參數傳入模擬的資料物件 fakeRow
  callback(null, fakeRow);
}

// 2. 測試呼叫
const query = "SELECT * FROM posts WHERE id = ?";
const inputParams = [1];

fakeGet(query, inputParams, (err, row) => {
  if (err) {
    console.error("查詢失敗");
  } else {
    // 練習：請在這裡印出文章的 title
    // 因為資料存放在 row 物件中，我們用點符號存取屬性
    console.log("抓到的文章標題是：", row.title);
  }
});
