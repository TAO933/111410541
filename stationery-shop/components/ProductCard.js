import React from 'react';

export default function ProductCard({ product, onClick }) {
    return (
        <div className="product-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', overflow: 'hidden' }}>
                <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        NT$ {product.price}
                    </span>
                    <button className="btn btn-primary" onClick={() => onClick(product)}>
                        查看 / 購買
                    </button>
                </div>
            </div>
        </div>
    );
}
