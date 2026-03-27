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
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT DEFAULT '訪客',
      is_public INTEGER DEFAULT 0,
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
  if (profileCheck && profileCheck.values[0][0] === 0) {
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

module.exports = { initDb, getDb, saveDb };

