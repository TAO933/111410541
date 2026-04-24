import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function POST(request) {
    try {
        initDb();
        const body = await request.json();
        const { product_id, quantity, customer_name } = body;

        if (!product_id || !quantity || !customer_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get product to calculate total price
        const product = db.prepare('SELECT name, price FROM products WHERE id = ?').get(product_id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const total_price = product.price * quantity;

        const stmt = db.prepare('INSERT INTO orders (product_name, quantity, total_price, customer_name) VALUES (?, ?, ?, ?)');
        const result = stmt.run(product.name, quantity, total_price, customer_name);

        return NextResponse.json({ success: true, orderId: result.lastInsertRowid, total_price });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}
