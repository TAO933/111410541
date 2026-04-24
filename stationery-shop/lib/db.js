import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite DB (creates file if not exists)
const dbPath = path.resolve(process.cwd(), 'stationery.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
export const initDb = () => {
    // Create products table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image TEXT NOT NULL,
            series TEXT NOT NULL
        )
    `).run();

    // Create orders table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            customer_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Create comments table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            author_name TEXT NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES comments (id)
        )
    `).run();

    // Seed mock products if empty
    const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
    if (count.count === 0) {
        const seedProducts = [
            // Series 1: 書寫與修正系列
            { name: '三菱UNI-BALL ONE F 兔子便利商店聯名筆', price: 71, description: '日系可愛聯名，精準流暢出水。', image: 'https://www.9x9.tw/public/files/product/thumb/N51525-56241S.jpg', series: '書寫與修正系列' },
            { name: 'PILOT 按鍵魔擦筆0.5-Waai', price: 56, description: '特製獨家墨水，摩擦即消失的魔法書寫體驗。', image: 'https://www.9x9.tw/public/files/product/thumb/N44233-29215S.jpg', series: '書寫與修正系列' },
            { name: 'PILOT螢光魔擦筆-Waai 獨家墨水', price: 34, description: '不傷紙面，畫錯也能輕鬆消除的螢光筆。', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Markers.jpg/500px-Markers.jpg', series: '書寫與修正系列' },
            { name: 'SDI iPUSH輕鬆按修正帶替換帶', price: 19, description: '按鈕出帶，一秒替換，經濟環保之選。', image: 'https://www.9x9.tw/public/files/product/thumb/N72816-36258S.jpg', series: '書寫與修正系列' },
            { name: 'SDI iPUSH輕鬆按修正帶 CT系列', price: 29, description: '流暢貼合紙面，不易斷裂的全新配方。', image: 'https://www.9x9.tw/public/files/product/thumb/N52871-06177S.jpg', series: '書寫與修正系列' },
            { name: 'PILOT 超級果汁筆(0.4) LJP-20S4', price: 39, description: '極細果汁系出水，色彩鮮豔不暈染。', image: 'https://www.9x9.tw/public/files/product/thumb/N00137-62984S.jpg', series: '書寫與修正系列' },
            { name: '雄獅No.600酒精性奇異筆', price: 10, description: '經典奇異筆，速乾防水，各材質適用。', image: 'https://www.9x9.tw/public/files/product/thumb/N06635-54478S.jpg', series: '書寫與修正系列' },
            { name: 'OB 自動中性筆0.5 OB-200A', price: 9, description: '高CP值之選，適合學生與大量書寫需求。', image: 'https://www.9x9.tw/public/files/product/thumb/N62242-01465S.jpg', series: '書寫與修正系列' },
            { name: 'MENIU DP05 水滴筆0.5', price: 20, description: '獨特水滴外型，握持舒適降低疲勞。', image: 'https://www.9x9.tw/public/files/product/thumb/N79844-75127S.jpg', series: '書寫與修正系列' },
            { name: 'PLUS 智慧型滾輪修正帶', price: 29, description: '微型滾輪設計，順滑貼合不浮起。', image: 'https://www.9x9.tw/public/files/product/thumb/N64255-39689S.jpg', series: '書寫與修正系列' },

            // Series 2: 收納與整理系列
            { name: 'LIHIT多用途收納袋 追星裝備', price: 370, description: '專為手帳與偶像周邊量身打造的最佳收納。', image: 'https://www.9x9.tw/public/files/product/thumb/N63529-00634S.jpg', series: '收納與整理系列' },
            { name: 'LIHIT伸縮筆筒可愛爆棚', price: 501, description: '可站立桌面，展開即是容量超大筆筒。', image: 'https://www.9x9.tw/public/files/product/thumb/N56454-32248S.jpg', series: '收納與整理系列' },
            { name: '(KING JIM) ALL IN CLIPBOARD', price: 330, description: '商務必備，隱藏式口袋板夾二折款。', image: 'https://www.9x9.tw/public/files/product/thumb/N86595-13002S.jpg', series: '收納與整理系列' },
            { name: '自強 美式三孔夾 520 圓型3孔', price: 228, description: '台灣極簡耐用三孔活頁夾。', image: 'https://www.9x9.tw/public/files/product/thumb/N92370-02669S.jpg', series: '收納與整理系列' },
            { name: 'A4-EZ防滑資料袋(100入)', price: 94, description: '大量文件收納，防滑靜電極透明材質。', image: 'https://www.9x9.tw/public/files/product/thumb/N85412-38356S.jpg', series: '收納與整理系列' },
            { name: 'DATABANK L型多功能A4文件夾(12入)', price: 120, description: '多色分類，辦公室最常見的收納好幫手。', image: 'https://www.9x9.tw/public/files/product/thumb/N16026-90381S.jpg', series: '收納與整理系列' },
            { name: '自強 西式2孔A4檔案夾 46S', price: 175, description: '大容量資料收置，堅固五金與外殼。', image: 'https://www.9x9.tw/public/files/product/thumb/N15915-57590S.jpg', series: '收納與整理系列' },
            { name: '台灣聯合 開放式圓孔雜誌箱', price: 55, description: '雜誌與大件文檔的直立絕佳整理箱。', image: 'https://www.9x9.tw/public/files/product/thumb/N54281-94901S.jpg', series: '收納與整理系列' },
            { name: '史努比 100K透明大網格袋', price: 45, description: '防水大升級，旅遊或文具隨身攜帶都適用。', image: 'https://www.9x9.tw/public/files/product/thumb/N95383-04932S.jpg', series: '收納與整理系列' },
            { name: 'KOKUYO GB_2x2收納活頁夾', price: 120, description: '日系高質感活頁，翻頁平整收納優雅。', image: 'https://www.9x9.tw/public/files/product/thumb/N33454-44407S.jpg', series: '收納與整理系列' },

            // Series 3: 膠貼與辦公系列
            { name: '3M 強力防水防水膠帶', price: 99, description: '特殊膠材，強力防水防護居家物品。', image: 'https://www.9x9.tw/public/files/product/thumb/N03503-84963S.jpg', series: '膠貼與辦公系列' },
            { name: 'KOKUYO 好黏貼便利貼限定壽司款', price: 119, description: '童趣壽司盲盒造型，便利貼界的新奇體驗。', image: 'https://www.9x9.tw/public/files/product/thumb/N02888-96505S.jpg', series: '膠貼與辦公系列' },
            { name: 'TOMBOW PiT 辦公用強力口紅膠', price: 25, description: '速乾高黏性，塗抹順暢不留結塊。', image: 'https://www.9x9.tw/public/files/product/thumb/N10830-39118S.jpg', series: '膠貼與辦公系列' },
            { name: '四維鹿頭牌 優韌膠帶18mmX40Y', price: 95, description: '韌性大升級，包裝與黏貼的品質保證。', image: 'https://www.9x9.tw/public/files/product/thumb/N50979-82425S.jpg', series: '膠貼與辦公系列' },
            { name: '四維鹿頭牌 雙面膠帶', price: 9, description: '好剪好黏，超強黏力雙面皆可用。', image: 'https://www.9x9.tw/public/files/product/thumb/N49415-53035S.jpg', series: '膠貼與辦公系列' },
            { name: '疊疊便利貼', price: 39, description: '獨特漸層堆疊色系，標記文件必備。', image: 'https://www.9x9.tw/public/files/product/thumb/N93913-16369S.jpg', series: '膠貼與辦公系列' },
            { name: 'PINK&VEN 16K固頁筆記本', price: 65, description: '精緻燙金外皮，極佳滑順書寫紙張。', image: 'https://www.9x9.tw/public/files/product/thumb/N57433-20196S.jpg', series: '膠貼與辦公系列' },
            { name: 'DOUBLE A 影印紙 A4 - 80g/70g', price: 65, description: '不易卡紙的最高品質保證影印紙張。', image: 'https://www.9x9.tw/public/files/product/thumb/N12872-03856S.jpg', series: '膠貼與辦公系列' },
            { name: 'Excell雙軌桌上型膠台 ET-227', price: 150, description: '重型穩固台座，雙軌剪裁效率倍增。', image: 'https://www.9x9.tw/public/files/product/thumb/N14675-93039S.jpg', series: '膠貼與辦公系列' },
            { name: '貓咪造型 桌上除塵清潔器', price: 199, description: '橡皮擦屑救星，可愛造型兼顧桌面整潔。', image: 'https://www.9x9.tw/public/files/product/thumb/N00547-45970S.jpg', series: '膠貼與辦公系列' },
        ];

        const insert = db.prepare('INSERT INTO products (name, price, description, image, series) VALUES (?, ?, ?, ?, ?)');
        
        try {
            db.transaction(() => {
                for (const p of seedProducts) {
                    insert.run(p.name, p.price, p.description, p.image, p.series);
                }
            })();
            console.log('Seed products inserted successfully.');
        } catch (error) {
            console.error('Error seeding products:', error);
        }
    }
};

export default db;
