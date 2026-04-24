import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function GET(request) {
    try {
        initDb();
        const { searchParams } = new URL(request.url);
        const productName = searchParams.get('product_name');

        if (!productName) {
            return NextResponse.json({ error: 'Product Name is required' }, { status: 400 });
        }

        const comments = db.prepare('SELECT * FROM comments WHERE product_name = ? ORDER BY created_at ASC').all(productName);
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        initDb();
        const body = await request.json();
        const { product_name, author_name, content, parent_id } = body;

        if (!product_name || !author_name || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO comments (product_name, author_name, content, parent_id) VALUES (?, ?, ?, ?)');
        const result = stmt.run(product_name, author_name, content, parent_id || null);

        return NextResponse.json({ success: true, commentId: result.lastInsertRowid });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
