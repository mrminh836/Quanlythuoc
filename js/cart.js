/**
 * Cart Manager for B2C Shop
 * Render as an Offcanvas Drawer globally if included in HTML
 */
const Cart = {
    items: [], // Array of { id, quantity, price, name, image, maxStock }

    init: function() {
        this.items = Storage.get('shop_cart') || [];
        this.renderBadge();
        this.buildDrawerUI();
        this.highlightActiveMenu();
    },

    save: function() {
        Storage.set('shop_cart', this.items);
        this.renderBadge();
        this.renderDrawerContent();
    },

    renderBadge: function() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('#cart-count').forEach(el => {
            el.innerText = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    },

    highlightActiveMenu: function() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'shop.html';
        
        document.querySelectorAll('.shop-action-btn').forEach(btn => {
            const href = btn.getAttribute('href');
            if (href && href === page) {
                btn.classList.add('active');
                // Remove hardcoded inline styles if any
                btn.style.color = '';
                const icon = btn.querySelector('i');
                if (icon) icon.style.color = '';
                const span = btn.querySelector('span');
                if (span) span.style.color = '';
            } else if (href) {
                btn.classList.remove('active');
                // Optional: remove hardcoded inline styles from inactive ones too
                btn.style.color = '';
                const icon = btn.querySelector('i');
                if (icon) icon.style.color = '';
                const span = btn.querySelector('span');
                if (span) span.style.color = '';
            }
        });
    },

    add: function(id, qty = 1, event = null) {
        const products = Storage.get('products') || [];
        const p = products.find(x => x.id === id);
        if(!p || p.stock === 0) {
            App.showToast('Sản phẩm đã hết hàng!', 'error');
            return;
        }

        const existing = this.items.find(x => x.id === id);
        if (existing) {
            if (existing.quantity + qty > p.stock) {
                App.showToast('Vượt quá số lượng tồn kho!', 'warning');
                existing.quantity = p.stock;
            } else {
                existing.quantity += qty;
            }
        } else {
            this.items.push({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                maxStock: p.stock,
                quantity: qty
            });
        }
        
        this.save();
        App.showToast('Đã thêm vào giỏ hàng!', 'success');
        
        // Hoạt ảnh bay vào giỏ hàng
        if (event) {
            this.flyToCart(event);
        }
    },

    buyNow: function(id, qty = 1) {
        const products = Storage.get('products') || [];
        const p = products.find(x => x.id === id);
        if(!p || p.stock === 0) {
            App.showToast('Sản phẩm đã hết hàng!', 'error');
            return;
        }

        const buyNowItem = [{
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            maxStock: p.stock,
            quantity: Math.min(qty, p.stock)
        }];
        
        Storage.set('buy_now_item', buyNowItem);
        location.href = 'checkout.html?mode=buynow';
    },

    flyToCart: function(event) {
        const btn = event.target.closest('button');
        if (!btn) return;
        
        const card = btn.closest('.product-card') || btn.closest('.product-card-mini');
        let img = null;
        if (card) {
            img = card.querySelector('img');
        } else {
            // For detail page
            const container = btn.closest('.shop-container') || document.body;
            img = container.querySelector('#main-img') || container.querySelector('img'); 
        }
        
        if (!img) return;

        // Tìm icon giỏ hàng trên header
        const cartIcon = document.querySelector('.fa-cart-shopping');
        if (!cartIcon) return;

        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const flyingImg = img.cloneNode();
        flyingImg.style.position = 'fixed';
        flyingImg.style.left = imgRect.left + 'px';
        flyingImg.style.top = imgRect.top + 'px';
        flyingImg.style.width = imgRect.width + 'px';
        flyingImg.style.height = imgRect.height + 'px';
        flyingImg.style.opacity = '1';
        flyingImg.style.zIndex = '9999';
        flyingImg.style.transition = 'all 1s cubic-bezier(0.25, 0.1, 0.25, 1)'; // smooth ease
        flyingImg.style.borderRadius = '50%';
        flyingImg.style.objectFit = 'cover';
        flyingImg.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

        document.body.appendChild(flyingImg);

        // Force a reflow to ensure the initial styles are applied before transitioning
        void flyingImg.offsetWidth;

        // Kích hoạt animation
        flyingImg.style.left = (cartRect.left + cartRect.width / 2 - 10) + 'px';
        flyingImg.style.top = (cartRect.top + cartRect.height / 2 - 10) + 'px';
        flyingImg.style.width = '20px';
        flyingImg.style.height = '20px';
        flyingImg.style.opacity = '0.3';

        // Xóa phần tử và tạo hiệu ứng nhún cho badge
        setTimeout(() => {
            flyingImg.remove();
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                badge.style.transform = 'scale(1.8)';
                setTimeout(() => badge.style.transform = 'scale(1)', 300);
            }
        }, 1000);
    },

    remove: function(id) {
        this.items = this.items.filter(x => x.id !== id);
        this.save();
    },

    updateQty: function(id, delta) {
        const item = this.items.find(x => x.id === id);
        if(!item) return;
        
        item.quantity += delta;
        if(item.quantity <= 0) {
            this.remove(id);
        } else if(item.quantity > item.maxStock) {
            item.quantity = item.maxStock;
            App.showToast('Vượt số lượng tồn kho', 'warning');
        }
        this.save();
    },

    buildDrawerUI: function() {
        // Inject drawer HTML into body
        if(document.getElementById('cart-drawer')) return;

        const html = `
            <div id="cart-drawer-overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:2000;" onclick="Cart.closeDrawer()"></div>
            <div id="cart-drawer" style="transform: translateX(100%); transition: transform 0.3s; position:fixed; top:0; right:0; bottom:0; width: 400px; max-width: 90vw; background:var(--shop-surface); box-shadow:-2px 0 10px rgba(0,0,0,0.1); z-index:2001; display:flex; flex-direction:column;">
                <div style="padding: 1rem; border-bottom: 1px solid var(--shop-border); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:var(--shop-text);">Giỏ hàng</h3>
                    <button onclick="Cart.closeDrawer()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--shop-text-muted);">&times;</button>
                </div>
                <div id="cart-drawer-body" style="flex:1; overflow-y:auto; padding: 1rem;">
                    <!-- Cart Items -->
                </div>
                <div style="padding: 1.5rem; border-top: 1px solid var(--shop-border); background:var(--shop-bg);">
                    <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; margin-bottom:1rem; color:var(--shop-primary);">
                        <span>Tạm tính:</span>
                        <span id="cart-drawer-total">0 ₫</span>
                    </div>
                    <button onclick="window.location.href='checkout.html'" style="width:100%; padding:15px; background:var(--shop-accent); color:white; border:none; border-radius:var(--shop-radius); font-size:1.1rem; font-weight:bold; cursor:pointer;">
                        Tiến hành thanh toán
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.renderDrawerContent();
    },

    toggleDrawer: function(e) {
        if(e) e.preventDefault();
        const drawer = document.getElementById('cart-drawer');
        if(drawer.style.transform === 'translateX(0%)') {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    },

    openDrawer: function() {
        document.getElementById('cart-drawer-overlay').style.display = 'block';
        document.getElementById('cart-drawer').style.transform = 'translateX(0%)';
        this.renderDrawerContent();
    },

    closeDrawer: function() {
        document.getElementById('cart-drawer-overlay').style.display = 'none';
        document.getElementById('cart-drawer').style.transform = 'translateX(100%)';
    },

    renderDrawerContent: function() {
        const body = document.getElementById('cart-drawer-body');
        const totalEl = document.getElementById('cart-drawer-total');
        if(!body) return;

        if(this.items.length === 0) {
            body.innerHTML = `<div style="text-align:center; padding: 3rem 0; color:var(--shop-text-muted);">
                <i class="fa-solid fa-cart-arrow-down" style="font-size:3rem; margin-bottom:1rem;"></i>
                <p>Giỏ hàng đang trống.</p>
                <button onclick="Cart.closeDrawer(); window.location.href='shop.html'" style="margin-top:1rem; padding:10px 20px; border-radius:20px; border:1px solid var(--shop-primary); color:var(--shop-primary); background:white; cursor:pointer;">Tiếp tục mua sắm</button>
            </div>`;
            totalEl.innerText = '0 ₫';
            return;
        }

        let html = '';
        let total = 0;
        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div style="display:flex; gap:1rem; margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid var(--shop-border);">
                    <img src="${item.image}" style="width:80px; height:80px; object-fit:cover; border-radius:4px; border:1px solid var(--shop-border);">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:0.9rem; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.name}</div>
                        <div style="color:var(--shop-primary); font-weight:bold; margin-bottom:8px;">${App.formatCurrency(item.price)}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; border:1px solid var(--shop-border); border-radius:4px;">
                                <button onclick="Cart.updateQty('${item.id}', -1)" style="background:none; border:none; padding:4px 10px; cursor:pointer;">-</button>
                                <span style="font-size:0.9rem; width:30px; text-align:center;">${item.quantity}</span>
                                <button onclick="Cart.updateQty('${item.id}', 1)" style="background:none; border:none; padding:4px 10px; cursor:pointer;">+</button>
                            </div>
                            <button onclick="Cart.remove('${item.id}')" style="background:none; border:none; color:var(--shop-text-muted); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        body.innerHTML = html;
        totalEl.innerText = App.formatCurrency(total);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
