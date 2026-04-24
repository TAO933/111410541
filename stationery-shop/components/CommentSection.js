'use client';
import React, { useState, useEffect } from 'react';

export default function CommentSection({ productName }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [replyTo, setReplyTo] = useState(null); // Parent comment ID
    
    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?product_name=${encodeURIComponent(productName)}`);
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [productName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authorName || !newComment) return alert('請填寫姓名與留言內容');

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: productName,
                    author_name: authorName,
                    content: newComment,
                    parent_id: replyTo
                })
            });
            if (res.ok) {
                setNewComment('');
                setReplyTo(null);
                fetchComments(); // Refresh list
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    // Organize comments into parent/child
    const topLevelComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

    return (
        <div style={{ marginTop: '30px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>顧客評論區</h4>
            
            <div style={{ marginBottom: '24px' }}>
                {loading ? <p>載入中...</p> : topLevelComments.length === 0 ? <p style={{ color: '#94a3b8' }}>目前尚無評論，成為第一個留言的人吧！</p> : (
                    topLevelComments.map(c => (
                        <div key={c.id} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{c.author_name}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: '8px 0' }}>{c.content}</p>
                            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setReplyTo(c.id)}>
                                回覆
                            </button>

                            {/* Replies */}
                            {getReplies(c.id).length > 0 && (
                                <div style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                    {getReplies(c.id).map(reply => (
                                        <div key={reply.id} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{reply.author_name} (回覆)</strong>
                                            </div>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ marginBottom: '12px' }}>
                    {replyTo ? `回覆評論 #${replyTo} ` : '新增評論'}
                    {replyTo && <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', marginLeft: '10px' }}>(取消回覆)</button>}
                </h5>
                <div style={{ marginBottom: '12px' }}>
                    <input type="text" placeholder="您的姓名" value={authorName} onChange={e => setAuthorName(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <textarea rows="3" placeholder="您的留言..." value={newComment} onChange={e => setNewComment(e.target.value)} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>送出留言</button>
            </form>
        </div>
    );
}
