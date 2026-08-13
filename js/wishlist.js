const Wishlist = {
    items: [],

    init: function() {
        this.items = Storage.get('shop_wishlist') || [];
        this.renderBadge();
    },

    save: function() {
        Storage.set('shop_wishlist', this.items);
        this.renderBadge();
    },

    renderBadge: function() {
        document.querySelectorAll('#wishlist-count').forEach(el => {
            el.innerText = this.items.length;
            el.style.display = this.items.length > 0 ? 'inline-block' : 'none';
        });
    },

    toggle: function(id, btnElement) {
        if(btnElement) btnElement.classList.toggle('active');
        
        const idx = this.items.indexOf(id);
        if (idx !== -1) {
            this.items.splice(idx, 1);
            App.showToast('Đã bỏ yêu thích!', 'success');
        } else {
            this.items.push(id);
            App.showToast('Đã thêm vào danh sách yêu thích!', 'success');
        }
        this.save();
    },

    remove: function(id) {
        this.items = this.items.filter(x => x !== id);
        this.save();
        if(window.location.pathname.includes('wishlist.html')) {
            this.renderPage();
        }
    },

    renderPage: function() {
        const container = document.getElementById('wishlist-grid');
        if(!container) return;

        const allProducts = Storage.get('products') || [];
        const wlProducts = allProducts.filter(p => this.items.includes(p.id));

        if(wlProducts.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 3rem; color: var(--shop-text-muted);">
                <i class="fa-solid fa-heart-crack" style="font-size:3rem; margin-bottom:1rem; color:#ccc;"></i>
                <p>Danh sách yêu thích đang trống.</p>
                <a href="shop.html" style="color:var(--shop-primary); text-decoration:none; font-weight:bold;">Khám phá sản phẩm</a>
            </div>`;
            return;
        }

        let html = '';
        wlProducts.forEach(p => {
            const fallbackImg = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECh%C6%B0a%20c%C3%B3%20%E1%BA%A3nh%3C%2Ftext%3E%3C%2Fsvg%3E';
            const imgSrc = p.image || p.imageUrl || fallbackImg;
            html += `
                <div style="display:flex; gap:1.5rem; padding:1.5rem; border:1px solid var(--shop-border); border-radius:var(--shop-radius); position:relative;">
                    <button onclick="Wishlist.remove('${p.id}')" style="position:absolute; top:10px; right:10px; background:none; border:none; color:#9ca3af; cursor:pointer;"><i class="fa-solid fa-xmark fa-lg"></i></button>
                    <img src="${imgSrc}" style="width:120px; height:120px; object-fit:cover; border-radius:var(--shop-radius); cursor:pointer;" onclick="location.href='shop-detail.html?id=${p.id}'">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:1.1rem; margin-bottom:0.5rem; cursor:pointer;" onclick="location.href='shop-detail.html?id=${p.id}'">${p.name}</div>
                        <div style="color:var(--shop-primary); font-size:1.25rem; font-weight:bold;">${App.formatCurrency(p.price)}</div>
                        <div style="margin-top:0.5rem; font-size:0.875rem; color:var(--shop-text-muted);">Tình trạng: ${p.stock > 0 ? 'Còn hàng' : '<span style="color:#ef4444">Hết hàng</span>'}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.5rem; width:150px;">
                        <button class="btn-add-cart" ${p.stock === 0 ? 'disabled' : ''} onclick="Cart.add('${p.id}')">Thêm vào giỏ</button>
                        <button style="padding:10px; background:var(--shop-bg); border:1px solid var(--shop-border); color:var(--shop-text-muted); border-radius:4px; cursor:pointer;" onclick="Wishlist.remove('${p.id}')">Xóa</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Wishlist.init();
});
