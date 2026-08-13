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
        
        if (period === 'today') {
            const todayStr = now.toISOString().split('T')[0];
            filteredOrders = filteredOrders.filter(o => o.timestamp.startsWith(todayStr));
        } else if (period === '7days') {
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredOrders = filteredOrders.filter(o => new Date(o.timestamp) >= last7Days);
        } else if (period === 'thismonth') {
            const monthStr = now.toISOString().slice(0, 7); // YYYY-MM
            filteredOrders = filteredOrders.filter(o => o.timestamp.startsWith(monthStr));
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
        
        // Prepare dynamic chart data
        let chartMap = {};
        filteredOrders.forEach(o => {
            const dateStr = new Date(o.timestamp).toLocaleDateString('vi-VN');
            if (!chartMap[dateStr]) chartMap[dateStr] = 0;
            chartMap[dateStr] += o.summary.total;
        });
        
        // Sort by date (naive string sort doesn't work for DD/MM/YYYY, but fine for prototype)
        // Better to sort by actual timestamp if needed, but we'll extract directly
        let chartLabels = Object.keys(chartMap).sort((a,b) => {
            let [d1,m1,y1] = a.split('/');
            let [d2,m2,y2] = b.split('/');
            return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
        });
        
        let chartData = chartLabels.map(label => chartMap[label]);

        if(chartLabels.length === 0) {
            chartLabels = ['Không có dữ liệu'];
            chartData = [0];
        }

        this.renderChart(chartLabels, chartData);
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

    renderChart: function(labels, data) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (₫)',
                    data: data,
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
