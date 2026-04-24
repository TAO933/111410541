'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import OrderModal from '@/components/OrderModal';

export default function Home() {
    const [productsGrouped, setProductsGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                
                // Group by series
                const grouped = data.reduce((acc, product) => {
                    const series = product.series || '未分類系列';
                    if (!acc[series]) acc[series] = [];
                    acc[series].push(product);
                    return acc;
                }, {});
                
                setProductsGrouped(grouped);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <main>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">文具町 Stationery</h1>
                    <p className="hero-subtitle">為您帶來高質感的書寫與辦公器物，點亮每一天。</p>
                    <button className="btn btn-primary" onClick={() => {
                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        探索系列
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <section id="products-section" className="container" style={{ paddingBottom: '100px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h3 className="hero-title" style={{ fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>
                            載入中...
                        </h3>
                    </div>
                ) : (
                    Object.entries(productsGrouped).map(([seriesName, groupProducts]) => (
                        <div key={seriesName} style={{ marginBottom: '80px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{seriesName}</h2>
                                <div style={{ height: '4px', width: '60px', background: 'var(--primary-color)', margin: '15px auto', borderRadius: '2px' }}></div>
                            </div>
                            
                            <div className="products-grid">
                                {groupProducts.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        onClick={setSelectedProduct} 
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Order Modal */}
            {selectedProduct && (
                <OrderModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </main>
    );
}
