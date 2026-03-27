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
  
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      author TEXT DEFAULT '訪客',
      is_public INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      username TEXT DEFAULT '我的帳號',
      bio TEXT DEFAULT '這是我的個人簡介',
      avatar_color TEXT DEFAULT '#0095f6'
    )
  `);
  
  const profileCheck = db.exec('SELECT COUNT(*) as count FROM profile')[0];
  if (!profileCheck || profileCheck.values[0][0] === 0) {
    db.run('INSERT INTO profile (id, username, bio, avatar_color) VALUES (1, ?, ?, ?)', 
      ['我的帳號', '這是我的個人簡介', '#0095f6']);
  }
  
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

function getDb() {
  return db;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return minutes + '分鐘前';
  if (hours < 24) return hours + '小時前';
  if (days < 7) return days + '天前';
  return date.toLocaleDateString('zh-TW');
}

function renderPosts(posts, type) {
  if (posts.length === 0) {
    return '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p>' + (type === 'personal' ? '還沒有個人貼文' : '還沒有公開貼文') + '</p><p style="font-size: 12px; margin-top: 8px;">發表你的第一篇貼文吧！</p></div>';
  }
  
  return posts.map(post => {
    const initial = escapeHtml(post.author || 'U').charAt(0).toUpperCase();
    const deleteBtn = type === 'personal' ? '<button class="delete-btn" onclick="deletePost(' + post.id + ')">刪除</button>' : '';
    return '<div class="post" data-id="' + post.id + '"><div class="post-header"><div class="post-avatar">' + initial + '</div><div class="post-meta"><div class="post-author">' + escapeHtml(post.author) + '</div><div class="post-time">' + formatDate(post.created_at) + '</div></div>' + deleteBtn + '</div><div class="post-content">' + escapeHtml(post.content) + '</div><div class="post-actions"><button class="action-btn" onclick="toggleLike(' + post.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div></div>';
  }).join('');
}

function renderPage() {
  const profileResult = db.exec('SELECT * FROM profile WHERE id = 1');
  const profile = profileResult.length > 0 ? profileResult[0].values[0] : null;
  
  const myPostsResult = db.exec('SELECT * FROM posts WHERE is_public = 0 ORDER BY created_at DESC');
  const publicPostsResult = db.exec('SELECT * FROM posts WHERE is_public = 1 ORDER BY created_at DESC');
  
  const resultToArray = (result) => {
    if (!result || result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
  };
  
  const myPostsList = resultToArray(myPostsResult);
  const publicPostsList = resultToArray(publicPostsResult);
  const myPostsJson = JSON.stringify(myPostsList).replace(/</g, '\\u003c');
  const publicPostsJson = JSON.stringify(publicPostsList).replace(/</g, '\\u003c');
  const profileUsername = profile ? escapeHtml(profile[1]) : '我的帳號';
  const profileBio = profile ? escapeHtml(profile[2]) : '這是我的個人簡介';
  const avatarColor = profile ? profile[3] : '#0095f6';
  
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Threads</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg-primary: #000;
      --bg-secondary: #121212;
      --bg-tertiary: #1e1e1e;
      --text-primary: #fff;
      --text-secondary: #a8a8a8;
      --border-color: #2e2e2e;
      --accent: #0095f6;
      --accent-hover: #0077cc;
      --danger: #ed4956;
      --heart: #f3425f;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    
    .main-container {
      display: flex;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
    }
    
    .left-sidebar {
      width: 280px;
      min-height: 100vh;
      border-right: 1px solid var(--border-color);
      padding: 16px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      padding: 12px 16px;
      margin-bottom: 24px;
      color: var(--text-primary);
    }
    
    .nav-menu {
      list-style: none;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 30px;
      margin-bottom: 4px;
      font-size: 16px;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .nav-item:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    
    .nav-item.active {
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .nav-item svg {
      width: 26px;
      height: 26px;
      flex-shrink: 0;
    }
    
    .nav-item-text {
      display: block;
    }
    
    .sidebar-footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
    
    .auth-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .btn {
      width: 100%;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-align: center;
      text-decoration: none;
    }
    
    .btn-login {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    
    .btn-login:hover {
      background: var(--bg-tertiary);
    }
    
    .btn-register {
      background: var(--accent);
      color: white;
    }
    
    .btn-register:hover {
      background: var(--accent-hover);
    }
    
    .main-content {
      flex: 1;
      max-width: 600px;
      border-right: 1px solid var(--border-color);
      min-height: 100vh;
    }
    
    .header {
      position: sticky;
      top: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(10px);
      z-index: 100;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .header h1 {
      font-size: 20px;
      font-weight: 700;
    }
    
    .profile-section {
      padding: 20px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .profile-header {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    
    .profile-info h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .profile-info .username {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .profile-info .bio {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .profile-stats {
      display: flex;
      gap: 24px;
      margin-top: 16px;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-weight: 700;
      font-size: 16px;
    }
    
    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .create-post {
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      border: 1px solid var(--border-color);
    }
    
    .create-post textarea {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 15px;
      font-family: inherit;
      resize: none;
      min-height: 80px;
      outline: none;
    }
    
    .create-post textarea::placeholder {
      color: var(--text-secondary);
    }
    
    .create-post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }
    
    .visibility-toggle {
      display: flex;
      gap: 8px;
    }
    
    .visibility-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .visibility-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }
    
    .submit-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .submit-btn:hover {
      background: var(--accent-hover);
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
    }
    
    .tab {
      flex: 1;
      padding: 14px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .tab.active {
      color: var(--text-primary);
      border-bottom-color: var(--text-primary);
    }
    
    .tab:hover {
      color: var(--text-primary);
    }
    
    .tab svg {
      width: 20px;
      height: 20px;
    }
    
    .posts-container {
      min-height: 200px;
    }
    
    .post {
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .post:last-child {
      border-bottom: none;
    }
    
    .post-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .post-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }
    
    .post-meta {
      flex: 1;
    }
    
    .post-author {
      font-weight: 600;
      font-size: 14px;
    }
    
    .post-time {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .post-content {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .post-actions {
      display: flex;
      gap: 24px;
    }
    
    .action-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      padding: 8px;
      margin: -8px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .action-btn:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }
    
    .action-btn.liked {
      color: var(--heart);
    }
    
    .action-btn svg {
      width: 22px;
      height: 22px;
    }
    
    .delete-btn {
      color: var(--danger);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .delete-btn:hover {
      background: rgba(237, 73, 86, 0.1);
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    
    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .right-sidebar {
      width: 350px;
      padding: 16px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    
    .search-box {
      background: var(--bg-secondary);
      border-radius: 20px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .search-box input {
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 14px;
      width: 100%;
      outline: none;
    }
    
    .search-box input::placeholder {
      color: var(--text-secondary);
    }
    
    .search-box svg {
      width: 20px;
      height: 20px;
      color: var(--text-secondary);
    }
    
    .auth-card {
      background: var(--bg-secondary);
      border-radius: 16px;
      padding: 20px;
    }
    
    .auth-card h3 {
      font-size: 16px;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }
    
    .auth-card .btn {
      width: 100%;
      padding: 10px;
      font-size: 14px;
    }

    @media (max-width: 1000px) {
      .right-sidebar { display: none; }
    }
    
    @media (max-width: 768px) {
      .left-sidebar { display: none; }
      .main-content { max-width: 100%; border: none; }
    }
  </style>
</head>
<body>
  <div class="main-container">
    <aside class="left-sidebar">
      <div class="logo">Threads</div>
      <nav>
        <ul class="nav-menu">
          <li><a href="/" class="nav-item active">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span class="nav-item-text">首頁</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span class="nav-item-text">搜尋</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="nav-item-text">探索</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="nav-item-text">通知</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span class="nav-item-text">訊息</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="nav-item-text">個人資料</span>
          </a></li>
          <li><a href="#" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span class="nav-item-text">設定</span>
          </a></li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="auth-buttons">
          <a href="#" class="btn btn-login">登入</a>
          <a href="#" class="btn btn-register">註冊</a>
        </div>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="header">
        <h1>首頁</h1>
      </header>
    
    <section class="profile-section">
      <div class="profile-header">
        <div class="avatar">${profileUsername.charAt(0).toUpperCase()}</div>
        <div class="profile-info">
          <h2>${profileUsername}</h2>
          <div class="bio">${profileBio}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat">
          <div class="stat-value">${myPostsList.length}</div>
          <div class="stat-label">個人貼文</div>
        </div>
        <div class="stat">
          <div class="stat-value">${publicPostsList.length}</div>
          <div class="stat-label">公開貼文</div>
        </div>
      </div>
    </section>
    
    <div class="create-post">
      <textarea id="postContent" placeholder="想說什麼？"></textarea>
      <div class="create-post-footer">
        <div class="visibility-toggle">
          <button class="visibility-btn active" data-visibility="0">📝 個人</button>
          <button class="visibility-btn" data-visibility="1">🌍 公開</button>
        </div>
        <button class="submit-btn" id="submitPost">發布</button>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active" data-tab="personal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>個人</span>
      </div>
      <div class="tab" data-tab="public">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span>公開</span>
      </div>
    </div>
    
    <div class="posts-container" id="postsContainer">
      ${renderPosts(myPostsList, 'personal')}
    </div>
  </main>
  
  <aside class="right-sidebar">
    <div class="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="搜尋 Threads">
    </div>
    <div class="auth-card">
      <h3>歡迎來到 Threads</h3>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">加入我們，開始分享你的想法吧！</p>
      <a href="#" class="btn btn-register">註冊</a>
      <a href="#" class="btn btn-login" style="margin-top: 10px;">登入</a>
    </div>
  </aside>
  </div>

  <script>
    let currentTab = 'personal';
    let currentVisibility = 0;
    let likedPosts = new Set();
    
    const myPosts = ${myPostsJson};
    const publicPosts = ${publicPostsJson};
    
    function escapeHtml(text) {
      const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return minutes + '分鐘前';
      if (hours < 24) return hours + '小時前';
      if (days < 7) return days + '天前';
      return date.toLocaleDateString('zh-TW');
    }
    
    function renderPosts(posts, type) {
      if (posts.length === 0) {
        return '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p>' + (type === 'personal' ? '還沒有個人貼文' : '還沒有公開貼文') + '</p><p style="font-size: 12px; margin-top: 8px;">發表你的第一篇貼文吧！</p></div>';
      }
      
      return posts.map(post => {
        const initial = escapeHtml(post.author || 'U').charAt(0).toUpperCase();
        const deleteBtn = type === 'personal' ? '<button class="delete-btn" onclick="deletePost(' + post.id + ')">刪除</button>' : '';
        return '<div class="post" data-id="' + post.id + '"><div class="post-header"><div class="post-avatar">' + initial + '</div><div class="post-meta"><div class="post-author">' + escapeHtml(post.author) + '</div><div class="post-time">' + formatDate(post.created_at) + '</div></div>' + deleteBtn + '</div><div class="post-content">' + escapeHtml(post.content) + '</div><div class="post-actions"><button class="action-btn' + (likedPosts.has(post.id) ? ' liked' : '') + '" onclick="toggleLike(' + post.id + ')"><svg viewBox="0 0 24 24" fill="' + (likedPosts.has(post.id) ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div></div>';
      }).join('');
    }
    
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        const posts = currentTab === 'personal' ? myPosts : publicPosts;
        document.getElementById('postsContainer').innerHTML = renderPosts(posts, currentTab);
      });
    });
    
    document.querySelectorAll('.visibility-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.visibility-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVisibility = parseInt(btn.dataset.visibility);
      });
    });
    
    document.getElementById('submitPost').addEventListener('click', async () => {
      const content = document.getElementById('postContent').value.trim();
      if (!content) return;
      
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          author: '訪客',
          is_public: currentVisibility 
        })
      });
      
      document.getElementById('postContent').value = '';
      location.reload();
    });
    
    async function deletePost(id) {
      if (!confirm('確定要刪除這篇貼文嗎？')) return;
      await fetch('/api/posts/' + id, { method: 'DELETE' });
      location.reload();
    }
    
    function toggleLike(id) {
      if (likedPosts.has(id)) {
        likedPosts.delete(id);
      } else {
        likedPosts.add(id);
      }
      const post = document.querySelector('.post[data-id="' + id + '"]');
      if (post) {
        const btn = post.querySelector('.action-btn');
        btn.classList.toggle('liked');
        const svg = btn.querySelector('svg');
        svg.setAttribute('fill', likedPosts.has(id) ? 'currentColor' : 'none');
      }
    }
  </script>
</body>
</html>`;
}

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(renderPage());
});

app.post('/api/posts', (req, res) => {
  const db = getDb();
  const { content, author = '訪客', is_public = 0 } = req.body;
  db.run('INSERT INTO posts (content, author, is_public) VALUES (?, ?, ?)', [content, author, is_public]);
  saveDb();
  res.json({ success: true });
});

app.delete('/api/posts/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log('Threads 風格網誌已啟動: http://localhost:' + PORT);
  });
}

start();

