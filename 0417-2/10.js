// 1. 定義 checkAdmin 函數
function checkAdmin(role, callback) {
  if (role !== "admin") {
    // 發生錯誤：第一個參數傳入錯誤訊息
    return callback("Access Denied");
  }
  
  // 成功：第一個參數傳入 null，第二個參數傳入成功資料
  callback(null, "Welcome");
}

// 2. 測試：非 admin 狀況
checkAdmin("guest", (err, msg) => {
  if (err) {
    console.log("驗證失敗：" + err); // 輸出: 驗證失敗：Access Denied
  } else {
    console.log(msg);
  }
});

// 3. 測試：admin 狀況
checkAdmin("admin", (err, msg) => {
  if (err) {
    console.log(err);
  } else {
    console.log("驗證成功：" + msg); // 輸出: 驗證成功：Welcome
  }
});
