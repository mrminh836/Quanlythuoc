const OrderManager = {
    orders: [],
    customers: [],
    currentPage: 1,
    itemsPerPage: 10,
    filteredOrders: [],

    init: function() {
        this.orders = Storage.get('orders') || [];
        this.customers = Storage.get('customers') || [];
        
        // Sắp xếp đơn hàng mới nhất lên đầu
        this.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.filteredOrders = [...this.orders];
        this.renderList();
        this.bindEvents();
    },

    bindEvents: function() {
        // Assume search inputs might be added to orders.html, but even if not, we setup generic render trigger.
        const searchInput = document.getElementById('search-order');
        if(searchInput) searchInput.addEventListener('input', () => { this.currentPage = 1; this.renderList(); });
    },

    getCustomerName: function(customerId) {
        if (customerId === 'GUEST') return 'Khách lẻ';
        const c = this.customers.find(x => x.id === customerId);
        return c ? c.name : 'Unknown';
    },

    renderList: function() {
        const tbody = document.getElementById('order-list');
        const searchInput = document.getElementById('search-order');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        this.filteredOrders = this.orders;
        if(searchTerm) {
            this.filteredOrders = this.filteredOrders.filter(o => 
                o.id.toLowerCase().includes(searchTerm) || 
                (o.customerName && o.customerName.toLowerCase().includes(searchTerm)) ||
                (o.customerPhone && o.customerPhone.includes(searchTerm))
            );
        }

        const totalItems = this.filteredOrders.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        if(this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const paginatedItems = this.filteredOrders.slice(startIdx, endIdx);

        // Pagination wrapper
        let paginationWrapper = document.getElementById('order-pagination');
        if (!paginationWrapper) {
            const tableContainer = document.querySelector('.table-container');
            paginationWrapper = document.createElement('div');
            paginationWrapper.id = 'order-pagination';
            paginationWrapper.style.cssText = 'padding: var(--spacing-md); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;';
            paginationWrapper.innerHTML = `
                <span class="text-muted" style="font-size: 0.875rem;" id="o-pagination-info">Hiển thị 0 đơn hàng</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="o-btn-prev"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="o-btn-next"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            `;
            tableContainer.parentNode.insertBefore(paginationWrapper, tableContainer.nextSibling);
            
            document.getElementById('o-btn-prev').addEventListener('click', () => { if(this.currentPage > 1) { this.currentPage--; this.renderList(); } });
            document.getElementById('o-btn-next').addEventListener('click', () => { if(this.currentPage < totalPages) { this.currentPage++; this.renderList(); } });
        }

        document.getElementById('o-pagination-info').innerText = `Hiển thị ${paginatedItems.length > 0 ? startIdx + 1 : 0}-${Math.min(endIdx, totalItems)} / ${totalItems} đơn hàng`;
        document.getElementById('o-btn-prev').disabled = this.currentPage === 1;
        document.getElementById('o-btn-next').disabled = this.currentPage === totalPages;

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">Chưa có đơn hàng nào</td></tr>`;
            return;
        }

        let html = '';
        paginatedItems.forEach(o => {
            const date = new Date(o.timestamp).toLocaleString('vi-VN');
            const cName = this.getCustomerName(o.customerId);
            
            let statusClass = 'badge-success';
            let statusText = 'Hoàn thành';
            if(o.status === 'CANCELLED') { statusClass = 'badge-danger'; statusText = 'Đã hủy'; }
            if(o.status === 'PENDING') { statusClass = 'badge-warning'; statusText = 'Chờ xác nhận'; }
            if(o.status === 'PROCESSING') { statusClass = 'badge-primary'; statusText = 'Đang xử lý'; }
            if(o.status === 'SHIPPING') { statusClass = 'badge-info'; statusText = 'Đang giao hàng'; }

            html += `
                <tr class="order-row" onclick="OrderManager.viewOrder('${o.id}')">
                    <td style="font-weight: 600; color: var(--primary-color);">${o.id}</td>
                    <td>${date}</td>
                    <td>${cName}</td>
                    <td>${o.employeeName || 'Admin'}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td style="text-align: right; font-weight: 600;">${App.formatCurrency(o.summary.total)}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    viewOrder: function(id) {
        const order = this.orders.find(o => o.id === id);
        if (!order) return;

        const cName = this.getCustomerName(order.customerId);

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>${item.name}<br><small>${item.quantity} x ${item.price.toLocaleString('vi-VN')}</small></td>
                    <td style="text-align: right;">${(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                </tr>
            `;
        });

        const html = `
            <div style="text-align: left; margin-bottom: 1rem; font-size: 0.875rem;">
                <div><strong>Mã HĐ:</strong> ${order.id}</div>
                <div><strong>Ngày:</strong> ${new Date(order.timestamp).toLocaleString('vi-VN')}</div>
                <div><strong>Thu ngân:</strong> ${order.employeeName}</div>
                <div><strong>Khách hàng:</strong> ${cName}</div>
                <div><strong>Trạng thái:</strong> <span style="color: var(--primary-color); font-weight: bold;">${order.status}</span></div>
            </div>
            
            <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;" id="order-actions-container">
                <!-- Actions injected here -->
            </div>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style="text-align: right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div style="text-align: right; font-size: 0.875rem; margin-top: 1rem;">
                <div>Tạm tính: ${order.summary.subtotal.toLocaleString('vi-VN')} ₫</div>
                <div>VAT (10%): ${order.summary.tax.toLocaleString('vi-VN')} ₫</div>
                <div>Giảm giá: ${order.summary.discount.toLocaleString('vi-VN')} ₫</div>
                <div style="font-size: 1.25rem; font-weight: bold; margin-top: 0.5rem; color: var(--primary-color);">
                    TỔNG: ${order.summary.total.toLocaleString('vi-VN')} ₫
                </div>
            </div>
        `;

        document.getElementById('order-details-content').innerHTML = html;
        this.renderOrderActions(order);
        document.getElementById('order-modal').classList.add('active');
    },

    renderOrderActions: function(order) {
        const container = document.getElementById('order-actions-container');
        if(!container) return;
        
        let actions = '';
        if(order.status === 'PENDING') {
            actions += `<button class="btn btn-primary btn-sm" onclick="OrderManager.updateStatus('${order.id}', 'PROCESSING')">Xác nhận đơn</button>`;
            actions += `<button class="btn btn-outline btn-sm" style="color: var(--danger-color)" onclick="OrderManager.updateStatus('${order.id}', 'CANCELLED')">Hủy đơn</button>`;
        } else if(order.status === 'PROCESSING') {
            actions += `<button class="btn btn-primary btn-sm" onclick="OrderManager.updateStatus('${order.id}', 'SHIPPING')">Giao hàng</button>`;
        } else if(order.status === 'SHIPPING') {
            actions += `<button class="btn btn-primary btn-sm" onclick="OrderManager.updateStatus('${order.id}', 'COMPLETED')">Hoàn thành</button>`;
        } else if(order.status === 'COMPLETED') {
            actions += `<button class="btn btn-outline btn-sm" onclick="OrderManager.printMock('${order.id}')"><i class="fa-solid fa-print"></i> In Hóa đơn</button>`;
            actions += `<button class="btn btn-outline btn-sm" style="color: var(--danger-color)" onclick="OrderManager.updateStatus('${order.id}', 'CANCELLED')">Hoàn tiền (Mock)</button>`;
        } else if(order.status === 'CANCELLED') {
            // no actions
        }
        
        container.innerHTML = actions;
    },

    updateStatus: function(id, newStatus) {
        let msg = `Chuyển trạng thái đơn hàng thành ${newStatus}?`;
        if (newStatus === 'CANCELLED') msg = 'Bạn có chắc chắn muốn hủy đơn hàng này?';
        
        App.showConfirm(msg, () => {
            const index = this.orders.findIndex(o => o.id === id);
            if(index !== -1) {
                this.orders[index].status = newStatus;
                Storage.set('orders', this.orders);
                this.renderList();
                this.viewOrder(id); // re-render modal content
                App.showToast('Cập nhật trạng thái thành công!', 'success');
            }
        });
    },

    printMock: function(id) {
        App.showLoading();
        setTimeout(() => {
            App.hideLoading();
            App.showToast(`Đã in hóa đơn ${id} ra máy in!`, 'info');
        }, 800);
    },

    closeModal: function() {
        document.getElementById('order-modal').classList.remove('active');
    }
};
