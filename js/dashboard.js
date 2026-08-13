const Dashboard = {
    orders: [],
    products: [],
    batches: [],
    chart: null,
    currentFilter: '7days',

    init: function() {
        this.orders = Storage.get('orders') || [];
        this.products = Storage.get('products') || [];
        this.batches = Storage.get('batches') || [];
        
        this.bindEvents();
        this.updateData();
    },

    bindEvents: function() {
        const filterSelect = document.getElementById('dashboard-date-filter');
        if(filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.updateData();
            });
        }
    },

    updateData: function() {
        // Filter orders based on date
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        let startDate = new Date();
        startDate.setHours(0,0,0,0);

        if (this.currentFilter === 'today') {
            // startDate is already today
        } else if (this.currentFilter === '7days') {
            startDate.setDate(today.getDate() - 7);
        } else if (this.currentFilter === '30days') {
            startDate.setDate(today.getDate() - 30);
        } else if (this.currentFilter === 'thismonth') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (this.currentFilter === 'all') {
            startDate = new Date(0); // Epoch
        }

        const filteredOrders = this.orders.filter(o => {
            const d = new Date(o.timestamp);
            return d >= startDate && d <= today && o.status === 'COMPLETED'; // Only completed orders for revenue
        });

        // 1. Calculate Stats
        const revenue = filteredOrders.reduce((sum, o) => sum + o.summary.total, 0);
        const totalOrders = this.orders.filter(o => {
            const d = new Date(o.timestamp);
            return d >= startDate && d <= today;
        }).length;
        
        const lowStock = this.products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
        const outOfStock = this.products.filter(p => p.stock === 0).length;
        
        let expiringCount = 0;
        this.batches.forEach(b => {
            if(b.status === 'EXPIRING' || b.status === 'EXPIRED') expiringCount++;
        });

        document.getElementById('revenue-today').innerText = App.formatCurrency(revenue);
        document.getElementById('orders-today').innerText = totalOrders;
        document.getElementById('low-stock-count').innerText = lowStock + outOfStock;
        document.getElementById('expiring-count').innerText = expiringCount;

        // 2. Render Recent Orders Table
        this.renderRecentOrders();

        // 3. Render Chart
        this.renderChart(filteredOrders);
    },

    renderRecentOrders: function() {
        const tbody = document.getElementById('recent-orders');
        if(!tbody) return;

        // Get 5 most recent orders overall
        const recent = [...this.orders].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
        
        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Chưa có đơn hàng nào</td></tr>`;
            return;
        }

        let html = '';
        recent.forEach(o => {
            let statusClass = 'badge-success';
            let statusText = 'Hoàn thành';
            if(o.status === 'CANCELLED') { statusClass = 'badge-danger'; statusText = 'Đã hủy'; }
            if(o.status === 'PENDING') { statusClass = 'badge-warning'; statusText = 'Chờ xác nhận'; }
            if(o.status === 'PROCESSING') { statusClass = 'badge-primary'; statusText = 'Đang xử lý'; }
            if(o.status === 'SHIPPING') { statusClass = 'badge-info'; statusText = 'Đang giao hàng'; }

            html += `
                <tr>
                    <td style="font-weight: 500; color: var(--primary-color)">${o.id}</td>
                    <td>${o.customerName || 'Khách lẻ'}</td>
                    <td>${new Date(o.timestamp).toLocaleString('vi-VN')}</td>
                    <td>${App.formatCurrency(o.summary.total)}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        html += `<tr><td colspan="5" style="text-align: center; cursor: pointer; color: var(--primary-color); font-size: 0.875rem;" onclick="window.location.href='orders.html'">Xem tất cả đơn hàng</td></tr>`;
        tbody.innerHTML = html;
    },

    renderChart: function(filteredOrders) {
        const ctx = document.getElementById('revenueChart');
        if(!ctx) return;

        // Group revenue by date
        const dateMap = {};
        filteredOrders.forEach(o => {
            const dateStr = new Date(o.timestamp).toLocaleDateString('vi-VN');
            dateMap[dateStr] = (dateMap[dateStr] || 0) + o.summary.total;
        });

        const labels = Object.keys(dateMap).sort((a,b) => {
            const [d1,m1,y1] = a.split('/');
            const [d2,m2,y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });
        
        // Limit to max 14 data points for clarity
        const finalLabels = labels.slice(-14);
        const finalData = finalLabels.map(l => dateMap[l]);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: finalLabels.length > 0 ? finalLabels : ['Chưa có dữ liệu'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: finalData.length > 0 ? finalData : [0],
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    borderColor: '#0ea5e9',
                    borderWidth: 2,
                    pointBackgroundColor: '#0ea5e9',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
};
