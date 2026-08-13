const Reports = {
    orders: [],
    chartInstance: null,

    init: function() {
        this.orders = Storage.get('orders') || [];
        this.generate();
    },

    generate: function() {
        const period = document.getElementById('report-period').value;
        const now = new Date();
        
        let filteredOrders = this.orders.filter(o => o.status !== 'CANCELLED');
        
        // Mock filtering (in reality we use Date logic)
        // For prototype, we'll just process all or mock a subset if 'today'
        if (period === 'today') {
            const todayStr = now.toISOString().split('T')[0];
            filteredOrders = filteredOrders.filter(o => o.timestamp.startsWith(todayStr));
        }

        let totalRevenue = 0;
        let totalItems = 0;
        let productSales = {}; // { 'id': {name, qty} }

        filteredOrders.forEach(o => {
            totalRevenue += o.summary.total;
            o.items.forEach(item => {
                totalItems += item.quantity;
                if (!productSales[item.id]) {
                    productSales[item.id] = { name: item.name, qty: 0 };
                }
                productSales[item.id].qty += item.quantity;
            });
        });

        // Profit assumption 30%
        const profit = totalRevenue * 0.3;

        document.getElementById('rep-revenue').innerText = App.formatCurrency(totalRevenue);
        document.getElementById('rep-profit').innerText = App.formatCurrency(profit);
        document.getElementById('rep-orders').innerText = filteredOrders.length;
        document.getElementById('rep-items').innerText = totalItems;

        this.renderTopProducts(productSales);
        this.renderChart();
    },

    renderTopProducts: function(productSales) {
        const sorted = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5); // top 5
        const tbody = document.getElementById('rep-top-products');
        
        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding: 1rem; color: var(--text-muted);">Không có dữ liệu</td></tr>`;
            return;
        }

        let html = '';
        sorted.forEach(p => {
            html += `
                <tr>
                    <td style="font-weight: 500;">${p.name}</td>
                    <td style="text-align: right; color: var(--primary-color); font-weight: bold;">${p.qty}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderChart: function() {
        // Mock Chart Data for prototype
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ngày 1', 'Ngày 2', 'Ngày 3', 'Ngày 4', 'Ngày 5', 'Ngày 6', 'Hôm nay'],
                datasets: [{
                    label: 'Doanh thu',
                    data: [5000000, 7500000, 4000000, 9000000, 12000000, 8500000, 15000000],
                    borderColor: '#007BFF',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
};
