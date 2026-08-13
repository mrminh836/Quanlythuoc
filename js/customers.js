const CustomerManager = {
    customers: [],
    currentPage: 1,
    itemsPerPage: 10,
    filteredCustomers: [],

    init: function() {
        this.customers = Storage.get('customers') || [];
        this.filteredCustomers = [...this.customers];
        this.renderList();
        document.getElementById('search-customer').addEventListener('input', () => { this.currentPage = 1; this.renderList(); });
    },

    renderList: function() {
        const tbody = document.getElementById('customer-list');
        const searchTerm = document.getElementById('search-customer').value.toLowerCase();
        
        this.filteredCustomers = this.customers;
        if (searchTerm) {
            this.filteredCustomers = this.filteredCustomers.filter(c => 
                c.name.toLowerCase().includes(searchTerm) || 
                c.phone.includes(searchTerm)
            );
        }

        const totalItems = this.filteredCustomers.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        if(this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const paginatedItems = this.filteredCustomers.slice(startIdx, endIdx);

        // Render pagination controls (assuming we inject them or they exist, I will inject a minimal bar if needed, but for now just basic text if container doesn't exist, I should ensure container exists in HTML or inject it here)
        // Check if pagination wrapper exists, if not, append it after table-container
        let paginationWrapper = document.getElementById('customer-pagination');
        if (!paginationWrapper) {
            const tableContainer = document.querySelector('.table-container');
            paginationWrapper = document.createElement('div');
            paginationWrapper.id = 'customer-pagination';
            paginationWrapper.style.cssText = 'padding: var(--spacing-md); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;';
            paginationWrapper.innerHTML = `
                <span class="text-muted" style="font-size: 0.875rem;" id="c-pagination-info">Hiển thị 0 khách hàng</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="c-btn-prev"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="c-btn-next"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            `;
            tableContainer.parentNode.insertBefore(paginationWrapper, tableContainer.nextSibling);
            
            document.getElementById('c-btn-prev').addEventListener('click', () => { if(this.currentPage > 1) { this.currentPage--; this.renderList(); } });
            document.getElementById('c-btn-next').addEventListener('click', () => { if(this.currentPage < totalPages) { this.currentPage++; this.renderList(); } });
        }

        document.getElementById('c-pagination-info').innerText = `Hiển thị ${paginatedItems.length > 0 ? startIdx + 1 : 0}-${Math.min(endIdx, totalItems)} / ${totalItems} khách hàng`;
        document.getElementById('c-btn-prev').disabled = this.currentPage === 1;
        document.getElementById('c-btn-next').disabled = this.currentPage === totalPages;

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">Không tìm thấy khách hàng</td></tr>`;
            return;
        }

        let html = '';
        paginatedItems.forEach(c => {
            let tierClass = 'badge-primary'; // Thường
            if (c.tier === 'Silver') tierClass = 'badge-secondary'; // mock color
            if (c.tier === 'Gold') tierClass = 'badge-warning';
            if (c.tier === 'VIP') tierClass = 'badge-danger';

            html += `
                <tr>
                    <td style="font-weight: 500;">${c.id}</td>
                    <td style="font-weight: 600;">${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.email || '-'}</td>
                    <td>${c.points}</td>
                    <td><span class="badge ${tierClass}">${c.tier}</span></td>
                    <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="CustomerManager.editCustomer('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; color: var(--danger-color);" onclick="CustomerManager.deleteCustomer('${c.id}')"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    openModal: function() {
        document.getElementById('customer-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = 'Thêm khách hàng';
        document.getElementById('customer-modal').classList.add('active');
    },

    closeModal: function() {
        document.getElementById('customer-modal').classList.remove('active');
    },

    editCustomer: function(id) {
        const c = this.customers.find(x => x.id === id);
        if (!c) return;

        document.getElementById('edit-id').value = c.id;
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-phone').value = c.phone;
        document.getElementById('c-email').value = c.email || '';
        document.getElementById('c-points').value = c.points;
        document.getElementById('c-tier').value = c.tier;

        document.getElementById('modal-title').innerText = 'Sửa thông tin khách hàng';
        document.getElementById('customer-modal').classList.add('active');
    },

    saveCustomer: function() {
        const name = document.getElementById('c-name').value.trim();
        const phone = document.getElementById('c-phone').value.trim();
        const email = document.getElementById('c-email').value.trim();
        const points = parseInt(document.getElementById('c-points').value) || 0;
        const tier = document.getElementById('c-tier').value;
        const editId = document.getElementById('edit-id').value;

        // Validation
        if (!name) return App.showToast('Tên không được bỏ trống!', 'error');
        if (!phone.match(/^[0-9]{10,11}$/)) return App.showToast('Số điện thoại không hợp lệ (10-11 số)!', 'error');
        if (email && !email.includes('@')) return App.showToast('Email không hợp lệ!', 'error');

        if (editId) {
            const index = this.customers.findIndex(x => x.id === editId);
            if (index !== -1) {
                this.customers[index] = { ...this.customers[index], name, phone, email, points, tier };
                App.showToast('Cập nhật thành công!', 'success');
            }
        } else {
            const newId = 'KH' + Date.now().toString().slice(-4);
            this.customers.unshift({ id: newId, name, phone, email, points, tier });
            App.showToast('Thêm khách hàng thành công!', 'success');
        }

        Storage.set('customers', this.customers);
        this.renderList();
        this.closeModal();
    },

    deleteCustomer: function(id) {
        App.showConfirm('Bạn có chắc chắn muốn xóa khách hàng này?', () => {
            this.customers = this.customers.filter(x => x.id !== id);
            Storage.set('customers', this.customers);
            this.renderList();
            App.showToast('Đã xóa khách hàng', 'success');
        });
    }
};
