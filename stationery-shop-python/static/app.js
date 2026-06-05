document.addEventListener('DOMContentLoaded', () => {
    // Current state variables
    let currentProduct = null;
    let comments = [];

    // DOM Elements
    const exploreBtn = document.getElementById('explore-btn');
    const loadingEl = document.getElementById('loading');
    const productsContainer = document.getElementById('products-container');
    
    // Modal DOM Elements
    const modalOverlay = document.getElementById('order-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalProductImage = document.getElementById('modal-product-image');
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalProductDesc = document.getElementById('modal-product-desc');
    
    // Checkout Form Elements
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSuccess = document.getElementById('checkout-success');
    const customerNameInput = document.getElementById('customer-name');
    const orderQuantityInput = document.getElementById('order-quantity');
    const totalPriceSummary = document.getElementById('total-price-summary');
    
    // Comment Form Elements
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentFormTitle = document.getElementById('comment-form-title');
    const commentAuthorInput = document.getElementById('comment-author');
    const commentContentInput = document.getElementById('comment-content');
    const parentCommentIdInput = document.getElementById('parent-comment-id');

    // 1. Scroll to products list when clicking explore
    exploreBtn.addEventListener('click', () => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // 2. Fetch and render products
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            
            // Group products by series
            const grouped = data.reduce((acc, product) => {
                const series = product.series || '未分類系列';
                if (!acc[series]) acc[series] = [];
                acc[series].push(product);
                return acc;
            }, {});
            
            renderProducts(grouped);
        } catch (error) {
            console.error('Error fetching products:', error);
            loadingEl.innerHTML = `<h3 class="hero-title" style="font-size: 1.5rem; color: #ef4444;">載入失敗，請確認伺服器是否正常執行。</h3>`;
        } finally {
            loadingEl.style.display = 'none';
        }
    };

    const renderProducts = (groupedProducts) => {
        productsContainer.innerHTML = '';
        
        Object.entries(groupedProducts).forEach(([seriesName, list]) => {
            // Create Series Container
            const seriesDiv = document.createElement('div');
            seriesDiv.className = 'series-container';
            
            // Create Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'series-header';
            headerDiv.innerHTML = `
                <h2>${seriesName}</h2>
                <div class="series-line"></div>
            `;
            seriesDiv.appendChild(headerDiv);
            
            // Create Grid
            const gridDiv = document.createElement('div');
            gridDiv.className = 'products-grid';
            
            // Populate Grid with Product Cards
            list.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card glass-panel';
                card.innerHTML = `
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-footer">
                            <span class="product-price">NT$ ${product.price}</span>
                            <button class="btn btn-primary buy-btn">查看 / 購買</button>
                        </div>
                    </div>
                `;
                
                // Add click listener to button
                card.querySelector('.buy-btn').addEventListener('click', () => {
                    openProductModal(product);
                });
                
                gridDiv.appendChild(card);
            });
            
            seriesDiv.appendChild(gridDiv);
            productsContainer.appendChild(seriesDiv);
        });
    };

    // 3. Open Modal and load details
    const openProductModal = (product) => {
        currentProduct = product;
        
        // Set details
        modalProductImage.src = product.image;
        modalProductImage.alt = product.name;
        modalProductName.textContent = product.name;
        modalProductPrice.textContent = `NT$ ${product.price}`;
        modalProductDesc.textContent = product.description;
        
        // Reset checkout form
        checkoutForm.style.display = 'block';
        checkoutSuccess.style.display = 'none';
        customerNameInput.value = '';
        orderQuantityInput.value = '1';
        totalPriceSummary.textContent = `NT$ ${product.price}`;
        
        // Reset comment form
        resetCommentReplyState();
        commentAuthorInput.value = '';
        commentContentInput.value = '';
        
        // Load Comments
        fetchComments(product.name);
        
        // Show modal overlay
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    // Close Modal
    const closeProductModal = () => {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
        currentProduct = null;
    };

    modalCloseBtn.addEventListener('click', closeProductModal);
    
    // Close modal when clicking outside content area
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeProductModal();
        }
    });

    // 4. Quantity Change calculation
    orderQuantityInput.addEventListener('input', () => {
        if (currentProduct) {
            const qty = Math.max(1, parseInt(orderQuantityInput.value) || 1);
            orderQuantityInput.value = qty;
            totalPriceSummary.textContent = `NT$ ${currentProduct.price * qty}`;
        }
    });

    // 5. Checkout Submit Handler
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentProduct) return;
        
        const customerName = customerNameInput.value.trim();
        const quantity = parseInt(orderQuantityInput.value) || 1;
        
        if (!customerName) return alert('請填寫姓名');
        
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: currentProduct.id,
                    quantity: quantity,
                    customer_name: customerName
                })
            });
            const data = await res.json();
            if (data.success) {
                checkoutForm.style.display = 'none';
                checkoutSuccess.style.display = 'block';
            } else {
                alert('結帳失敗：' + (data.error || '未知錯誤'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('送出訂單時發生錯誤');
        }
    });

    // 6. Comments Handlers
    const fetchComments = async (productName) => {
        commentsList.innerHTML = '<p>載入評論中...</p>';
        try {
            const res = await fetch(`/api/comments?product_name=${encodeURIComponent(productName)}`);
            comments = await res.json();
            renderComments();
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = '<p style="color: #ef4444;">評論載入失敗</p>';
        }
    };

    const renderComments = () => {
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #94a3b8;">目前尚無評論，成為第一個留言的人吧！</p>';
            return;
        }
        
        // Thread matching
        const topLevel = comments.filter(c => !c.parent_id);
        const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);
        
        topLevel.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            
            // Format datetime
            const localDate = new Date(c.created_at).toLocaleString();
            
            item.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${c.author_name}</span>
                    <span class="comment-date">${localDate}</span>
                </div>
                <p class="comment-content-text">${c.content}</p>
                <button class="comment-reply-btn" data-id="${c.id}">回覆</button>
                <div class="replies-container" id="replies-to-${c.id}"></div>
            `;
            
            // Append reply button action
            item.querySelector('.comment-reply-btn').addEventListener('click', () => {
                setupCommentReply(c.id, c.author_name);
            });
            
            // Append child replies
            const repliesContainer = item.querySelector(`#replies-to-${c.id}`);
            const childReplies = getReplies(c.id);
            
            childReplies.forEach(r => {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'reply-item';
                const replyDate = new Date(r.created_at).toLocaleString();
                
                replyDiv.innerHTML = `
                    <div class="comment-header">
                        <span class="reply-author">${r.author_name} (回覆)</span>
                        <span class="reply-date">${replyDate}</span>
                    </div>
                    <p class="comment-content-text">${r.content}</p>
                `;
                repliesContainer.appendChild(replyDiv);
            });
            
            commentsList.appendChild(item);
        });
    };

    // Setup Reply Mode
    const setupCommentReply = (parentId, authorName) => {
        parentCommentIdInput.value = parentId;
        commentFormTitle.innerHTML = `回覆評論 #${parentId} 專區 <button type="button" class="cancel-reply-btn" id="cancel-reply-btn">(取消回覆)</button>`;
        
        document.getElementById('cancel-reply-btn').addEventListener('click', resetCommentReplyState);
        commentContentInput.placeholder = `回覆 @${authorName}...`;
        commentContentInput.focus();
        
        // Scroll to form smoothly
        commentForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const resetCommentReplyState = () => {
        parentCommentIdInput.value = '';
        commentFormTitle.textContent = '新增評論';
        commentContentInput.placeholder = '您的留言...';
    };

    // Submit Comment
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentProduct) return;
        
        const author = commentAuthorInput.value.trim();
        const content = commentContentInput.value.trim();
        const parentId = parentCommentIdInput.value ? parseInt(parentCommentIdInput.value) : null;
        
        if (!author || !content) return alert('請填寫姓名與留言內容');
        
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: currentProduct.name,
                    author_name: author,
                    content: content,
                    parent_id: parentId
                })
            });
            const data = await res.json();
            if (data.success) {
                // Reset form fields
                commentContentInput.value = '';
                resetCommentReplyState();
                // Reload comments
                fetchComments(currentProduct.name);
            } else {
                alert('留言送出失敗');
            }
        } catch (error) {
            console.error('Comment error:', error);
            alert('送出留言時發生錯誤');
        }
    });

    // Run initial fetch
    fetchProducts();
});
