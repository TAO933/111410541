'use client';
import React, { useState } from 'react';
import CommentSection from './CommentSection';

export default function OrderModal({ product, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleOrder = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                    customer_name: customerName
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrderSuccess(true);
            } else {
                alert('訂單失敗！');
            }
        } catch (error) {
            alert('發生錯誤');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '800px', maxHeight: '90vh',
                overflowY: 'auto', background: 'var(--bg-color)', position: 'relative'
            }}>
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    &times;
                </button>

                <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: '2 1 300px', padding: '30px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{product.name}</h2>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '20px' }}>NT$ {product.price}</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>{product.description}</p>

                        {!orderSuccess ? (
                            <form onSubmit={handleOrder} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ marginBottom: '16px' }}>訂購商品</h4>
                                <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>姓名</label>
                                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>數量</label>
                                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                    <span>總計: <strong style={{ fontSize: '1.2rem' }}>NT$ {product.price * quantity}</strong></span>
                                    <button type="submit" className="btn btn-primary">確認結帳</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', textAlign: 'center' }}>
                                <h3 style={{ color: '#10b981', marginBottom: '10px' }}>🎉 訂單已成功送出！</h3>
                                <p>感謝您的購買，我們將盡快為您處理。</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    <CommentSection productName={product.name} />
                </div>
            </div>
        </div>
    );
}
