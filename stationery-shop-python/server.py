import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static', static_url_path='')
DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stationery.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image TEXT NOT NULL,
            series TEXT NOT NULL
        )
    ''')
    
    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            customer_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create comments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            author_name TEXT NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES comments (id)
        )
    ''')
    
    # Check if products table is empty
    cursor.execute('SELECT COUNT(*) FROM products')
    count = cursor.fetchone()[0]
    
    if count == 0:
        seed_products = [
            # Series 1: 書寫與修正系列
            ('三菱UNI-BALL ONE F 兔子便利商店聯名筆', 71, '日系可愛聯名，精準流暢出水。', 'https://www.9x9.tw/public/files/product/thumb/N51525-56241S.jpg', '書寫與修正系列'),
            ('PILOT 按鍵魔擦筆0.5-Waai', 56, '特製獨家墨水，摩擦即消失的魔法書寫體驗。', 'https://www.9x9.tw/public/files/product/thumb/N44233-29215S.jpg', '書寫與修正系列'),
            ('PILOT螢光魔擦筆-Waai 獨家墨水', 34, '不傷紙面，畫錯也能輕鬆消除的螢光筆。', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Markers.jpg/500px-Markers.jpg', '書寫與修正系列'),
            ('SDI iPUSH輕鬆按修正帶替換帶', 19, '按鈕出帶，一秒替換，經濟環保之選。', 'https://www.9x9.tw/public/files/product/thumb/N72816-36258S.jpg', '書寫與修正系列'),
            ('SDI iPUSH輕鬆按修正帶 CT系列', 29, '流暢貼合紙面，不易斷裂的全新配方。', 'https://www.9x9.tw/public/files/product/thumb/N52871-06177S.jpg', '書寫與修正系列'),
            ('PILOT 超級果汁筆(0.4) LJP-20S4', 39, '極細果汁系出水，色彩鮮豔不暈染。', 'https://www.9x9.tw/public/files/product/thumb/N00137-62984S.jpg', '書寫與修正系列'),
            ('雄獅No.600酒精性奇異筆', 10, '經典奇異筆，速乾防水，各材質適用。', 'https://www.9x9.tw/public/files/product/thumb/N06635-54478S.jpg', '書寫與修正系列'),
            ('OB 自動中性筆0.5 OB-200A', 9, '高CP值之選，適合學生與大量書寫需求。', 'https://www.9x9.tw/public/files/product/thumb/N62242-01465S.jpg', '書寫與修正系列'),
            ('MENIU DP05 水滴筆0.5', 20, '獨特水滴外型，握持舒適降低疲勞。', 'https://www.9x9.tw/public/files/product/thumb/N79844-75127S.jpg', '書寫與修正系列'),
            ('PLUS 智慧型滾輪修正帶', 29, '微型滾輪設計，順滑貼合不浮起。', 'https://www.9x9.tw/public/files/product/thumb/N64255-39689S.jpg', '書寫與修正系列'),

            # Series 2: 收納與整理系列
            ('LIHIT多用途收納袋 追星裝備', 370, '專為手帳與偶像周邊量身打造的最佳收納。', 'https://www.9x9.tw/public/files/product/thumb/N63529-00634S.jpg', '收納與整理系列'),
            ('LIHIT伸縮筆筒可愛爆棚', 501, '可站立桌面，展開即是容量超大筆筒。', 'https://www.9x9.tw/public/files/product/thumb/N56454-32248S.jpg', '收納與整理系列'),
            ('(KING JIM) ALL IN CLIPBOARD', 330, '商務必備，隱藏式口袋板夾二折款。', 'https://www.9x9.tw/public/files/product/thumb/N86595-13002S.jpg', '收納與整理系列'),
            ('自強 美式三孔夾 520 圓型3孔', 228, '台灣極簡耐用三孔活頁夾。', 'https://www.9x9.tw/public/files/product/thumb/N92370-02669S.jpg', '收納與整理系列'),
            ('A4-EZ防滑資料袋(100入)', 94, '大量文件收納，防滑靜電極透明材質。', 'https://www.9x9.tw/public/files/product/thumb/N85412-38356S.jpg', '收納與整理系列'),
            ('DATABANK L型多功能A4文件夾(12入)', 120, '多色分類，辦公室最常見的收納好幫手。', 'https://www.9x9.tw/public/files/product/thumb/N16026-90381S.jpg', '收納與整理系列'),
            ('自強 西式2孔A4檔案夾 46S', 175, '大容量資料收置，堅固五金與外殼。', 'https://www.9x9.tw/public/files/product/thumb/N15915-57590S.jpg', '收納與整理系列'),
            ('台灣聯合 開放式圓孔雜誌箱', 55, '雜誌與大件文檔的直立絕佳整理箱。', 'https://www.9x9.tw/public/files/product/thumb/N54281-94901S.jpg', '收納與整理系列'),
            ('史努比 100K透明大網格袋', 45, '防水大升級，旅遊或文具隨身攜帶都適用。', 'https://www.9x9.tw/public/files/product/thumb/N95383-04932S.jpg', '收納與整理系列'),
            ('KOKUYO GB_2x2收納活頁夾', 120, '日系高質感活頁，翻頁平整收納優雅。', 'https://www.9x9.tw/public/files/product/thumb/N33454-44407S.jpg', '收納與整理系列'),

            # Series 3: 膠貼與辦公系列
            ('3M 強力防水防水膠帶', 99, '特殊膠材，強力防水防護居家物品。', 'https://www.9x9.tw/public/files/product/thumb/N03503-84963S.jpg', '膠貼與辦公系列'),
            ('KOKUYO 好黏貼便利貼限定壽司款', 119, '童趣壽司盲盒造型，便利貼界的新奇體驗。', 'https://www.9x9.tw/public/files/product/thumb/N02888-96505S.jpg', '膠貼與辦公系列'),
            ('TOMBOW PiT 辦公用強力口紅膠', 25, '速乾高黏性，塗抹順暢不留結塊。', 'https://www.9x9.tw/public/files/product/thumb/N10830-39118S.jpg', '膠貼與辦公系列'),
            ('四維鹿頭牌 優韌膠帶18mmX40Y', 95, '韌性大升級，包裝與黏貼的品質保證。', 'https://www.9x9.tw/public/files/product/thumb/N50979-82425S.jpg', '膠貼與辦公系列'),
            ('四維鹿頭牌 雙面膠帶', 9, '好剪好黏，超強黏力雙面皆可用。', 'https://www.9x9.tw/public/files/product/thumb/N49415-53035S.jpg', '膠貼與辦公系列'),
            ('疊疊便利貼', 39, '獨特漸層堆疊色系，標記文件必備。', 'https://www.9x9.tw/public/files/product/thumb/N93913-16369S.jpg', '膠貼與辦公系列'),
            ('PINK&VEN 16K固頁筆記本', 65, '精緻燙金外皮，極佳滑順書寫紙張。', 'https://www.9x9.tw/public/files/product/thumb/N57433-20196S.jpg', '膠貼與辦公系列'),
            ('DOUBLE A 影印紙 A4 - 80g/70g', 65, '不易卡紙的最高品質保證影印紙張。', 'https://www.9x9.tw/public/files/product/thumb/N12872-03856S.jpg', '膠貼與辦公系列'),
            ('Excell雙軌桌上型膠台 ET-227', 150, '重型穩固台座，雙軌剪裁效率倍增。', 'https://www.9x9.tw/public/files/product/thumb/N14675-93039S.jpg', '膠貼與辦公系列'),
            ('貓咪造型 桌上除塵清潔器', 199, '橡皮擦屑救星，可愛造型兼顧桌面整潔。', 'https://www.9x9.tw/public/files/product/thumb/N00547-45970S.jpg', '膠貼與辦公系列')
        ]
        
        cursor.executemany(
            'INSERT INTO products (name, price, description, image, series) VALUES (?, ?, ?, ?, ?)',
            seed_products
        )
        conn.commit()
        print("Database initialized with 30 seeded products.")
        
    conn.close()

# Initialize on import/start
init_db()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM products')
        rows = cursor.fetchall()
        products = [dict(row) for row in rows]
        conn.close()
        return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def place_order():
    try:
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        customer_name = data.get('customer_name')
        
        if not product_id or not quantity or not customer_name:
            return jsonify({'error': 'Missing required fields'}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        
        # Get product info
        cursor.execute('SELECT name, price FROM products WHERE id = ?', (product_id,))
        product = cursor.fetchone()
        if not product:
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
            
        total_price = product['price'] * int(quantity)
        
        cursor.execute(
            'INSERT INTO orders (product_name, quantity, total_price, customer_name) VALUES (?, ?, ?, ?)',
            (product['name'], quantity, total_price, customer_name)
        )
        order_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'orderId': order_id, 'total_price': total_price})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments', methods=['GET'])
def get_comments():
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({'error': 'Product Name is required'}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM comments WHERE product_name = ? ORDER BY created_at ASC',
            (product_name,)
        )
        rows = cursor.fetchall()
        comments = [dict(row) for row in rows]
        conn.close()
        return jsonify(comments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments', methods=['POST'])
def add_comment():
    try:
        data = request.json
        product_name = data.get('product_name')
        author_name = data.get('author_name')
        content = data.get('content')
        parent_id = data.get('parent_id')
        
        if not product_name or not author_name or not content:
            return jsonify({'error': 'Missing required fields'}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO comments (product_name, author_name, content, parent_id) VALUES (?, ?, ?, ?)',
            (product_name, author_name, content, parent_id if parent_id else None)
        )
        comment_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'commentId': comment_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
