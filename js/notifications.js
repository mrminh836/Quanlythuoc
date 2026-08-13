const Notifications = {
    alerts: [],

    init: function() {
        this.generateAlerts();
        this.renderBadge();
        this.renderList();
    },

    generateAlerts: function() {
        this.alerts = [];
        const products = Storage.get('products') || [];
        const today = new Date();

        products.forEach(p => {
            // Check out of stock
            if (p.stock === 0) {
                this.alerts.push({
                    type: 'danger',
                    icon: 'fa-triangle-exclamation',
                    title: 'Hết hàng',
                    message: `Sản phẩm ${p.name} đã hết hàng trong kho.`,
                    link: 'inventory.html'
                });
            } else if (p.stock <= p.minStock) {
                this.alerts.push({
                    type: 'warning',
                    icon: 'fa-box-open',
                    title: 'Sắp hết hàng',
                    message: `${p.name} chỉ còn ${p.stock} sản phẩm.`,
                    link: 'inventory.html'
                });
            }

            // Check expiry
            const expDate = new Date(p.expiryDate);
            const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                this.alerts.push({
                    type: 'danger',
                    icon: 'fa-skull-crossbones',
                    title: 'Thuốc hết hạn',
                    message: `${p.name} đã hết hạn sử dụng!`,
                    link: 'inventory.html'
                });
            } else if (diffDays <= 30) {
                this.alerts.push({
                    type: 'warning',
                    icon: 'fa-calendar-xmark',
                    title: 'Sắp hết hạn',
                    message: `${p.name} sẽ hết hạn sau ${diffDays} ngày.`,
                    link: 'inventory.html'
                });
            }
        });
    },

    renderBadge: function() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.alerts.length > 0) {
                badge.style.display = 'block';
                badge.innerText = this.alerts.length;
            } else {
                badge.style.display = 'none';
            }
        }
    },

    renderList: function() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        if (this.alerts.length === 0) {
            list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">Không có thông báo mới</div>`;
            return;
        }

        let html = '';
        this.alerts.forEach(a => {
            const colorVar = a.type === 'danger' ? 'var(--danger-color)' : 'var(--warning-color)';
            html += `
                <div style="padding: 12px 15px; border-bottom: 1px solid var(--border-color); display: flex; gap: 10px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'" onclick="window.location.href='${a.link}'">
                    <div style="color: ${colorVar}; font-size: 1.25rem;"><i class="fa-solid ${a.icon}"></i></div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.875rem;">${a.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${a.message}</div>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    },

    clearAll: function() {
        this.alerts = [];
        this.renderBadge();
        this.renderList();
    }
};
