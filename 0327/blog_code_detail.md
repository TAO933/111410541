# Blog 系統程式碼詳細解說

## 目錄

1. [專案架構](#專案架構)
2. [database.js - 資料庫模組](#databasejs---資料庫模組)
3. [server.js - 伺服器主程式](#serverjs---伺服器主程式)
4. [HTML 頁面結構](#html-頁面結構)
5. [CSS 樣式設計](#css-樣式設計)
6. [JavaScript 前端邏輯](#javascript-前端邏輯)
7. [API 設計](#api-設計)

---

## 專案架構

```
blog/
├── package.json        # 專案設定與依賴
├── database.js         # SQLite 資料庫模組
├── server.js           # Express 伺服器 + HTML/CSS/JS
├── blog.db             # SQLite 資料庫檔案（自動生成）
└── public/            # 靜態檔案目錄
```

### 套件依賴

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sql.js": "^1.10.3"
  }
}
```

| 套件 | 用途 |
|------|------|
| express | 網頁伺服器框架 |
| sql.js | 純 JavaScript 實現的 SQLite（無需編譯） |

---

## database.js - 資料庫模組

### 完整程式碼

```javascript
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blog.db');
let db;

async function initDb() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS posts (...)`);
  db.run(`CREATE TABLE IF NOT EXISTS profile (...)`);
  
  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

module.exports = { initDb, getDb, saveDb };
```

### 程式碼解析

#### 1. 引入模組

```javascript
const initSqlJs = require('sql.js');  // SQLite JS 實現
const fs = require('fs');             // 檔案系統操作
const path = require('path');          // 路徑處理
```

**為什麼用 sql.js？**
- better-sqlite3 需要編譯，環境需有 Python/C++ 工具
- sql.js 是純 JavaScript，無需編譯
- 缺點：效能較慢，但對小型專案影響不大

#### 2. 資料庫初始化

```javascript
async function initDb() {
  const SQL = await initSqlJs();  // 初始化 SQL.js
  
  if (fs.existsSync(DB_PATH)) {
    // 資料庫已存在，讀取既有檔案
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    // 建立新資料庫
    db = new SQL.Database();
  }
  // ...
}
```

**流程說明：**
1. 呼叫 `initSqlJs()` 非同步初始化
2. 檢查資料庫檔案是否存在
3. 存在則讀取，不存在則建立新的

#### 3. 建立資料表

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT NOT NULL,
    author TEXT DEFAULT '使用者',
    is_public INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**欄位說明：**

| 欄位 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| id | INTEGER | 自動 | 主鍵，自動遞增 |
| title | TEXT | - | 標題（目前未使用） |
| content | TEXT | - | 文章內容，NOT NULL 表示必填 |
| author | TEXT | '使用者' | 作者名稱 |
| is_public | INTEGER | 0 | 0=個人文章，1=公開文章 |
| likes | INTEGER | 0 | 按讚數 |
| comments | TEXT | '[]' | 留言（JSON 格式） |
| created_at | DATETIME | CURRENT_TIMESTAMP | 建立時間 |

#### 4. 儲存資料庫

```javascript
function saveDb() {
  if (db) {
    const data = db.export();              // 匯出二進制資料
    const buffer = Buffer.from(data);       // 轉為 Node Buffer
    fs.writeFileSync(DB_PATH, buffer);      // 寫入檔案
  }
}
```

**為什麼要手動儲存？**
- sql.js 預設在記憶體中運行
- 需要手動呼叫 `saveDb()` 將資料寫入硬碟
- 建議：每次修改資料後都儲存

---

## server.js - 伺服器主程式

### 完整結構

```javascript
// 1. 引入模組
const express = require('express');
const path = require('path');
const { initDb, getDb, saveDb } = require('./database');

// 2. Express 設定
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. 路由
app.get('/', (req, res) => { ... });      // 首頁
app.post('/api/posts', (req, res) => { ... });  // 新增文章
app.delete('/api/posts/:id', (req, res) => { ... });  // 刪除文章

// 4. 啟動伺服器
async function start() {
  await initDb();
  app.listen(PORT, () => { ... });
}
start();
```

### 程式碼解析

#### 1. Express 中介軟體

```javascript
app.use(express.json());           // 解析 JSON 請求體
app.use(express.urlencoded({ extended: true }));  // 解析 URL-encoded 資料
app.use(express.static(...));       // 靜態檔案目錄
```

**為什麼需要這些？**

| 中介軟體 | 用途 |
|----------|------|
| express.json() | 讓 req.body 可以取得 JSON 格式的資料 |
| express.urlencoded() | 解析表單提交的資料 |
| express.static() | 讓 public 資料夾中的檔案可被存取 |

#### 2. 首頁路由

```javascript
app.get('/', (req, res) => {
  const db = getDb();
  
  // 查詢資料
  const myPosts = db.exec('SELECT * FROM posts WHERE is_public = 0 ...');
  const publicPosts = db.exec('SELECT * FROM posts WHERE is_public = 1 ...');
  
  // 轉換格式
  const myPostsList = resultToArray(myPosts);
  
  // 回傳 HTML
  res.send(renderPage());
});
```

**查詢結果轉換：**

```javascript
const resultToArray = (result) => {
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;           // 取得欄位名稱
  return result[0].values.map(row => {      // 逐列處理
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
};
```

**sql.js 查詢結果格式：**

```javascript
// db.exec() 返回格式
[
  {
    columns: ['id', 'title', 'content'],  // 欄位名稱
    values: [                               // 資料列
      [1, '標題1', '內容1'],
      [2, '標題2', '內容2']
    ]
  }
]
```

#### 3. 新增文章 API

```javascript
app.post('/api/posts', (req, res) => {
  const db = getDb();
  
  // 從請求體取得資料
  const { content, author = '使用者', is_public = 0 } = req.body;
  
  // 執行 SQL
  db.run(
    'INSERT INTO posts (content, author, is_public) VALUES (?, ?, ?)',
    [content, author, is_public]
  );
  
  // 儲存到檔案
  saveDb();
  
  // 回傳 JSON
  res.json({ success: true });
});
```

**參數化查詢的好處：**
- 防止 SQL 注入攻擊
- 自動處理特殊字元轉義

#### 4. 刪除文章 API

```javascript
app.delete('/api/posts/:id', (req, res) => {
  const db = getDb();
  
  // 從 URL 取得 ID
  const id = req.params.id;
  
  // 執行刪除
  db.run('DELETE FROM posts WHERE id = ?', [id]);
  saveDb();
  
  res.json({ success: true });
});
```

**路由參數 `:id`：**
- URL 中的 `:id` 是動態參數
- 透過 `req.params.id` 取得

---

## HTML 頁面結構

### 頁面架構

```html
<body>
  <!-- 頂部導航列 -->
  <div class="top-bar">
    <div class="fb-logo">...</div>
    <div class="search-box">...</div>
    <div class="top-nav">...</div>
    <div class="top-icons">...</div>
  </div>
  
  <!-- 主體容器 -->
  <div class="main-container">
    
    <!-- 左側功能表 -->
    <aside class="left-sidebar">
      <div class="profile-card">...</div>
      <nav class="menu-list">...</nav>
    </aside>
    
    <!-- 中間內容區 -->
    <main class="content-area">
      <div class="create-post">...</div>
      <div class="tabs">...</div>
      <div class="posts-container">...</div>
    </main>
    
    <!-- 右側工具列 -->
    <aside class="right-sidebar">
      <div class="story-section">...</div>
      <div class="contact-list">...</div>
    </aside>
    
  </div>
  
  <!-- JavaScript -->
  <script>...</script>
</body>
```

### 三欄佈局 CSS

```css
.main-container {
  display: flex;           /* 彈性盒模型 */
  max-width: 1100px;      /* 最大寬度 */
  margin: 76px auto 20px; /* 置中 + 頂部留白（給導航列） */
  gap: 20px;              /* 欄位間距 */
  padding: 0 16px;        /* 左右內距 */
}

.left-sidebar { width: 320px; }   /* 左側欄固定寬度 */
.content-area  { flex: 1; }       /* 中間欄自適應 */
.right-sidebar { width: 312px; } /* 右側欄固定寬度 */
```

---

## CSS 樣式設計

### 樣式變數

```css
:root {
  --fb-blue: #1877f2;          /* Facebook 藍色 */
  --bg-primary: #f0f2f5;      /* 背景灰 */
  --bg-white: #ffffff;         /* 白色卡片 */
  --text-primary: #050505;     /* 主文字 */
  --text-secondary: #65676b;    /* 次要文字 */
  --border-color: #ced0d4;     /* 邊框線 */
  --divider: #dadde1;          /* 分隔線 */
}
```

**使用變數的好處：**
- 統一管理顏色
- 主題切換方便
- 程式碼更易維護

### 元件樣式

#### 1. 頂部導航列

```css
.top-bar {
  position: fixed;      /* 固定定位 */
  top: 0;               /* 頂部 0 */
  left: 0; right: 0;   /* 左右 0 = 滿寬 */
  height: 60px;         /* 高度 60px */
  background: var(--bg-white);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);  /* 陰影效果 */
  z-index: 1000;        /* 層級（確保在最上層） */
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}
```

#### 2. 個人資料卡

#### 2. 個人資料卡

```css
.profile-card {
  background: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.profile-banner {
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 4px solid white;
  margin: -44px 16px 0;
}
```

#### 3. 貼文卡片

```css
.post {
  background: var(--bg-white);
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.post-content {
  padding: 4px 16px 12px;
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
```

### 響應式設計

```css
@media (max-width: 1000px) {
  .right-sidebar { display: none; }
}

@media (max-width: 768px) {
  .left-sidebar { display: none; }
  .top-nav { display: none; }
  .search-box { display: none; }
}
```

---

## JavaScript 前端邏輯

### 全域變數

```javascript
let currentTab = 'personal';
let currentVisibility = 0;
let likedPosts = new Set();

const myPosts = ...;
const publicPosts = ...;
```

### HTML 跳脫函數

```javascript
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
```

### 時間格式化

```javascript
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '剛剛';
  if (minutes < 60) return minutes + '分鐘前';
  if (hours < 24) return hours + '小時前';
  if (days < 7) return days + '天前';
  return date.toLocaleDateString('zh-TW');
}
```

### 發布文章

```javascript
document.getElementById('postContent').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const content = e.target.value.trim();
    if (!content) return;

    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        author: '使用者',
        is_public: 1
      })
    });

    e.target.value = '';
    location.reload();
  }
});
```

### 按讚功能

```javascript
function toggleLike(id) {
  if (likedPosts.has(id)) {
    likedPosts.delete(id);
  } else {
    likedPosts.add(id);
  }
  const post = document.querySelector('.post[data-id="' + id + '"]');
  if (post) {
    const btn = post.querySelector('.action-btn:first-child');
    btn.classList.toggle('liked');
  }
}
```

---

## API 設計

### 端點總覽

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | / | 取得首頁 |
| POST | /api/posts | 發布新文章 |
| DELETE | /api/posts/:id | 刪除文章 |

### POST /api/posts

**請求：**
```bash
POST /api/posts
Content-Type: application/json

{
  "content": "這是我的第一篇文章！",
  "author": "使用者",
  "is_public": 1
}
```

**回應：**
```json
{ "success": true }
```

### DELETE /api/posts/:id

**請求：** DELETE /api/posts/5

**回應：** { "success": true }

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | HTML5, CSS3, Vanilla JavaScript |
| 後端 | Node.js, Express.js |
| 資料庫 | SQLite (sql.js) |

## 學習重點

1. Express 路由處理（GET、POST、DELETE）
2. sql.js 操作（初始化、SQL 執行、檔案讀寫）
3. 前端互動（fetch API、DOM 操作）
4. CSS 佈局（Flexbox、響應式設計）

---

*整理日期：2026年3月27日*
