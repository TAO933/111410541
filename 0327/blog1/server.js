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
      author TEXT DEFAULT '使用者',
      is_public INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      username TEXT DEFAULT '使用者',
      bio TEXT DEFAULT '這是我的個人簡介',
      avatar_color TEXT DEFAULT '#1877f2'
    )
  `);
  
  const profileCheck = db.exec('SELECT COUNT(*) as count FROM profile')[0];
  if (!profileCheck || profileCheck.values[0][0] === 0) {
    db.run('INSERT INTO profile (id, username, bio, avatar_color) VALUES (1, ?, ?, ?)', 
      ['使用者', '這是我的個人簡介', '#1877f2']);
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
  
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return minutes + '分鐘前';
  if (hours < 24) return hours + '小時前';
  if (days < 7) return days + '天前';
  return date.toLocaleDateString('zh-TW');
}

function renderPosts(posts, type) {
  if (posts.length === 0) {
    return '<div class="empty-state"><div class="empty-icon">📝</div><p>' + (type === 'personal' ? '還沒有個人貼文' : '還沒有動態消息') + '</p><p style="font-size: 13px; margin-top: 8px; opacity: 0.7;">開始分享你的第一篇貼文吧！</p></div>';
  }
  
  return posts.map(post => {
    const initial = escapeHtml(post.author || 'U').charAt(0).toUpperCase();
    const deleteBtn = type === 'personal' ? '<button class="delete-btn" onclick="deletePost(' + post.id + ')"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' : '';
    return '<div class="post" data-id="' + post.id + '"><div class="post-header"><div class="post-avatar">' + initial + '</div><div class="post-meta"><div class="post-author">' + escapeHtml(post.author) + '</div><div class="post-time">' + formatDate(post.created_at) + ' · <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M14 8c0-2.21-1.79-4-4-4S6 5.79 6 8s1.79 4 4 4 4-1.79 4-4zm3 2v2h6v-2h-6zM2 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2H2v2zm10-7h4V9h2v2h4v2h-4v2h-2v-2h-4v-2z"/></svg></div></div>' + deleteBtn + '<button class="more-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button></div><div class="post-content">' + escapeHtml(post.content) + '</div><div class="post-actions"><div class="action-divider"></div><button class="action-btn" onclick="toggleLike(' + post.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg><span>讚</span></button><button class="action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>回應</span></button><button class="action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>分享</span></button></div></div>';
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
  const profileUsername = profile ? escapeHtml(profile[1]) : '使用者';
  const profileBio = profile ? escapeHtml(profile[2]) : '這是我的個人簡介';
  
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facebook</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --fb-blue: #1877f2;
      --fb-blue-hover: #166fe5;
      --bg-primary: #f0f2f5;
      --bg-white: #ffffff;
      --text-primary: #050505;
      --text-secondary: #65676b;
      --border-color: #ced0d4;
      --divider: #dadde1;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    
    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: var(--bg-white);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 16px;
    }
    
    .fb-logo {
      width: 40px;
      height: 40px;
    }
    
    .search-box {
      flex: 1;
      max-width: 400px;
      background: var(--bg-primary);
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .search-box svg {
      width: 20px;
      height: 20px;
      color: var(--text-secondary);
    }
    
    .search-box input {
      background: transparent;
      border: none;
      font-size: 15px;
      width: 100%;
      outline: none;
    }
    
    .top-nav {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }
    
    .top-nav-btn {
      width: 110px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: background 0.2s;
    }
    
    .top-nav-btn:hover {
      background: var(--bg-primary);
    }
    
    .top-nav-btn.active {
      border-bottom: 3px solid var(--fb-blue);
    }
    
    .top-nav-btn svg {
      width: 28px;
      height: 28px;
      color: var(--text-secondary);
    }
    
    .top-nav-btn.active svg {
      color: var(--fb-blue);
    }
    
    .top-nav-btn .badge {
      position: absolute;
      top: 2px;
      right: 12px;
      background: #e41e3f;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }
    
    .top-user {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
    }
    
    .top-icons {
      display: flex;
      gap: 8px;
    }
    
    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: background 0.2s;
    }
    
    .icon-btn:hover {
      background: #d8dadf;
    }
    
    .icon-btn svg {
      width: 20px;
      height: 20px;
      color: var(--text-primary);
    }
    
    .main-container {
      display: flex;
      max-width: 1100px;
      margin: 76px auto 20px;
      gap: 20px;
      padding: 0 16px;
    }
    
    .left-sidebar {
      width: 320px;
      flex-shrink: 0;
    }
    
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
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 32px;
    }
    
    .profile-info {
      padding: 8px 16px 16px;
    }
    
    .profile-name {
      font-size: 18px;
      font-weight: 700;
      margin-top: 8px;
    }
    
    .profile-bio {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .menu-item:hover {
      background: rgba(0,0,0,0.05);
    }
    
    .menu-item.active {
      background: rgba(24,119,242,0.1);
    }
    
    .menu-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .menu-icon.blue { background: #e7f3ff; }
    .menu-icon.red { background: #ffebe9; }
    .menu-icon.green { background: #e8f5e9; }
    .menu-icon.orange { background: #fff3e0; }
    .menu-icon.purple { background: #f3e5f5; }
    .menu-icon.teal { background: #e0f2f1; }
    
    .menu-item span {
      font-weight: 500;
      font-size: 15px;
    }
    
    .menu-divider {
      height: 1px;
      background: var(--divider);
      margin: 8px 16px;
    }
    
    .shortcuts-title {
      font-size: 16px;
      font-weight: 600;
      padding: 16px 16px 8px;
      color: var(--text-secondary);
    }
    
    .content-area {
      flex: 1;
      max-width: 500px;
    }
    
    .create-post {
      background: var(--bg-white);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .create-post-header {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .create-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }
    
    .create-post input {
      flex: 1;
      background: var(--bg-primary);
      border: none;
      border-radius: 20px;
      padding: 12px 16px;
      font-size: 15px;
      outline: none;
    }
    
    .create-post input:focus {
      outline: 2px solid var(--fb-blue);
    }
    
    .create-post-actions {
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider);
    }
    
    .create-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .create-action:hover {
      background: var(--bg-primary);
    }
    
    .create-action svg {
      width: 24px;
      height: 24px;
    }
    
    .create-action.red svg { color: #f3425f; }
    .create-action.green svg { color: #42b72a; }
    .create-action.orange svg { color: #f3425f; }
    
    .tabs {
      background: var(--bg-white);
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .tabs-header {
      display: flex;
      padding: 8px;
      gap: 4px;
    }
    
    .tab-btn {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .tab-btn.active {
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    
    .tab-btn svg {
      width: 20px;
      height: 20px;
    }
    
    .posts-container {
      min-height: 200px;
    }
    
    .post {
      background: var(--bg-white);
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .post-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 10px;
    }
    
    .post-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }
    
    .post-meta {
      flex: 1;
    }
    
    .post-author {
      font-weight: 600;
      font-size: 15px;
    }
    
    .post-time {
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .more-btn {
      background: transparent;
      border: none;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      color: var(--text-secondary);
      transition: background 0.2s;
    }
    
    .more-btn:hover {
      background: var(--bg-primary);
    }
    
    .delete-btn {
      background: transparent;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: background 0.2s;
    }
    
    .delete-btn:hover {
      background: #ffebe9;
      color: #e41e3f;
    }
    
    .post-content {
      padding: 4px 16px 12px;
      font-size: 15px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .post-actions {
      padding: 4px 8px;
    }
    
    .action-divider {
      height: 1px;
      background: var(--divider);
      margin: 0 8px 8px;
    }
    
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 24px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: background 0.2s;
      width: 33%;
      justify-content: center;
    }
    
    .action-btn:hover {
      background: var(--bg-primary);
    }
    
    .action-btn svg {
      width: 18px;
      height: 18px;
    }
    
    .action-btn.liked {
      color: var(--fb-blue);
    }
    
    .empty-state {
      background: var(--bg-white);
      border-radius: 8px;
      padding: 60px 20px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .right-sidebar {
      width: 312px;
      flex-shrink: 0;
    }
    
    .sidebar-card {
      background: var(--bg-white);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .contact-item:hover {
      background: var(--bg-primary);
    }
    
    .contact-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f09333, #f5576c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      position: relative;
    }
    
    .contact-avatar.online::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: #42b72a;
      border: 2px solid white;
      border-radius: 50%;
    }
    
    .contact-name {
      font-size: 14px;
      font-weight: 500;
    }
    
    .story-section {
      background: var(--bg-white);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .story-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .story-title {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .story-grid {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    
    .story-item {
      min-width: 110px;
      height: 180px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    
    .story-item:first-child {
      background: var(--bg-primary);
      border: 2px dashed var(--border-color);
    }
    
    .story-avatar {
      position: absolute;
      bottom: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--fb-blue);
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }
    
    .story-name {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      color: white;
      font-size: 13px;
      font-weight: 600;
    }
    
    .story-item:first-child .story-name {
      color: var(--text-primary);
      left: 8px;
      bottom: 8px;
    }

    @media (max-width: 1000px) {
      .right-sidebar { display: none; }
    }
    
    @media (max-width: 768px) {
      .left-sidebar { display: none; }
      .top-nav { display: none; }
      .search-box { display: none; }
      .content-area { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <svg class="fb-logo" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    <div class="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="搜尋 Facebook">
    </div>
    <div class="top-nav">
      <button class="top-nav-btn active" title="首頁">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button class="top-nav-btn" title="朋友">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="badge">5</span>
      </button>
      <button class="top-nav-btn" title="訊息">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="badge">3</span>
      </button>
      <button class="top-nav-btn" title="通知">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="badge">9</span>
      </button>
    </div>
    <div class="top-icons">
      <button class="icon-btn" title="功能表">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
      </button>
      <button class="icon-btn" title="Messenger">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.34 5.26 3.47 6.91L4.09 21l3.68-1.75A9.96 9.96 0 0 0 12 22c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/></svg>
      </button>
      <button class="icon-btn" title="通知">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
      </button>
      <div class="top-user" title="使用者">${profileUsername.charAt(0).toUpperCase()}</div>
    </div>
  </div>
  
  <div class="main-container">
    <aside class="left-sidebar">
      <div class="profile-card">
        <div class="profile-banner"></div>
        <div class="profile-avatar">${profileUsername.charAt(0).toUpperCase()}</div>
        <div class="profile-info">
          <div class="profile-name">${profileUsername}</div>
          <div class="profile-bio">${profileBio}</div>
        </div>
      </div>
      
      <div class="menu-item active">
        <div class="menu-icon blue">📢</div>
        <span>動態消息</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon blue">👥</div>
        <span>朋友</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon red">👥</div>
        <span>社團</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon green">📦</div>
        <span>Marketplace</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon purple">🎬</div>
        <span>影片</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon teal">📁</div>
        <span>儲存的</span>
      </div>
      
      <div class="menu-divider"></div>
      <div class="shortcuts-title">你的捷徑</div>
      
      <div class="menu-item">
        <div class="menu-icon orange">🎮</div>
        <span>遊戲</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon purple">🌟</div>
        <span>Facebook Dating</span>
      </div>
      <div class="menu-item">
        <div class="menu-icon blue">📊</div>
        <span>情感狀態</span>
      </div>
    </aside>
    
    <main class="content-area">
      <div class="create-post">
        <div class="create-post-header">
          <div class="create-avatar">${profileUsername.charAt(0).toUpperCase()}</div>
          <input type="text" id="postContent" placeholder="${profileUsername}，你在想什麼？">
        </div>
        <div class="create-post-actions">
          <button class="create-action red">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>直播影片</span>
          </button>
          <button class="create-action green" onclick="document.getElementById('postContent').focus()">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
            <span>相片/影片</span>
          </button>
          <button class="create-action orange" onclick="document.getElementById('postContent').focus()">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
            <span>心情/活動</span>
          </button>
        </div>
      </div>
      
      <div class="tabs">
        <div class="tabs-header">
          <button class="tab-btn active" data-tab="personal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>個人貼文</span>
          </button>
          <button class="tab-btn" data-tab="public">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>公開動態</span>
          </button>
        </div>
      </div>
      
      <div class="posts-container" id="postsContainer">
        ${renderPosts(myPostsList, 'personal')}
      </div>
    </main>
    
    <aside class="right-sidebar">
      <div class="story-section">
        <div class="story-header">
          <div class="story-title">限時動態</div>
          <span style="font-size: 14px; color: var(--text-secondary);">建立故事</span>
        </div>
        <div class="story-grid">
          <div class="story-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; color: #65676b;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <div class="story-name">新增</div>
          </div>
          <div class="story-item">
            <div class="story-avatar">小</div>
            <div class="story-name">小明</div>
          </div>
          <div class="story-item">
            <div class="story-avatar">阿</div>
            <div class="story-name">阿強</div>
          </div>
          <div class="story-item">
            <div class="story-avatar">美</div>
            <div class="story-name">小美</div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-card">
        <div class="sidebar-title">聯絡人</div>
        <div class="contact-item">
          <div class="contact-avatar online">小</div>
          <div class="contact-name">小明</div>
        </div>
        <div class="contact-item">
          <div class="contact-avatar online">阿</div>
          <div class="contact-name">阿強</div>
        </div>
        <div class="contact-item">
          <div class="contact-avatar">美</div>
          <div class="contact-name">小美</div>
        </div>
        <div class="contact-item">
          <div class="contact-avatar online">大</div>
          <div class="contact-name">大雄</div>
        </div>
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
      
      if (minutes < 1) return '剛剛';
      if (minutes < 60) return minutes + '分鐘前';
      if (hours < 24) return hours + '小時前';
      if (days < 7) return days + '天前';
      return date.toLocaleDateString('zh-TW');
    }
    
    function renderPosts(posts, type) {
      if (posts.length === 0) {
        return '<div class="empty-state"><div class="empty-icon">📝</div><p>' + (type === 'personal' ? '還沒有個人貼文' : '還沒有動態消息') + '</p><p style="font-size: 13px; margin-top: 8px; opacity: 0.7;">開始分享你的第一篇貼文吧！</p></div>';
      }
      
      return posts.map(post => {
        const initial = escapeHtml(post.author || 'U').charAt(0).toUpperCase();
        const deleteBtn = type === 'personal' ? '<button class="delete-btn" onclick="deletePost(' + post.id + ')"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' : '';
        const moreBtn = '<button class="more-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>';
        return '<div class="post" data-id="' + post.id + '"><div class="post-header"><div class="post-avatar">' + initial + '</div><div class="post-meta"><div class="post-author">' + escapeHtml(post.author) + '</div><div class="post-time">' + formatDate(post.created_at) + ' · <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M14 8c0-2.21-1.79-4-4-4S6 5.79 6 8s1.79 4 4 4 4-1.79 4-4zm3 2v2h6v-2h-6zM2 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2H2v2zm10-7h4V9h2v2h4v2h-4v2h-2v-2h-4v-2z"/></svg></div></div>' + deleteBtn + moreBtn + '</div><div class="post-content">' + escapeHtml(post.content) + '</div><div class="post-actions"><div class="action-divider"></div><button class="action-btn' + (likedPosts.has(post.id) ? ' liked' : '') + '" onclick="toggleLike(' + post.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg><span>讚</span></button><button class="action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>回應</span></button><button class="action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>分享</span></button></div></div>';
      }).join('');
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        const posts = currentTab === 'personal' ? myPosts : publicPosts;
        document.getElementById('postsContainer').innerHTML = renderPosts(posts, currentTab);
      });
    });
    
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
        const btn = post.querySelector('.action-btn:first-child');
        btn.classList.toggle('liked');
      }
    }
  </script>
</body>
</html>`;
}

const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(renderPage());
});

app.post('/api/posts', (req, res) => {
  const db = getDb();
  const { content, author = '使用者', is_public = 0 } = req.body;
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
    console.log('Facebook 風格網誌已啟動: http://localhost:' + PORT);
  });
}

start();

