import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function GET() {
    try {
        initDb();
        const products = db.prepare('SELECT * FROM products').all();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
