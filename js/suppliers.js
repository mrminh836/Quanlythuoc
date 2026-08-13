const SupplierManager = {
    suppliers: [],
    currentPage: 1,
    itemsPerPage: 10,
    filteredSuppliers: [],

    init: function() {
        this.suppliers = Storage.get('suppliers') || [];
        this.filteredSuppliers = [...this.suppliers];
        this.renderList();
    },

    renderList: function() {
        const tbody = document.getElementById('supplier-list');
        
        const totalItems = this.filteredSuppliers.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        if(this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const paginatedItems = this.filteredSuppliers.slice(startIdx, endIdx);

        // Inject pagination wrapper if needed
        let paginationWrapper = document.getElementById('supplier-pagination');
        if (!paginationWrapper) {
            const tableContainer = document.querySelector('.table-container');
            paginationWrapper = document.createElement('div');
            paginationWrapper.id = 'supplier-pagination';
            paginationWrapper.style.cssText = 'padding: var(--spacing-md); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;';
            paginationWrapper.innerHTML = `
                <span class="text-muted" style="font-size: 0.875rem;" id="s-pagination-info">Hiển thị 0 NCC</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="s-btn-prev"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" id="s-btn-next"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            `;
            tableContainer.parentNode.insertBefore(paginationWrapper, tableContainer.nextSibling);
            
            document.getElementById('s-btn-prev').addEventListener('click', () => { if(this.currentPage > 1) { this.currentPage--; this.renderList(); } });
            document.getElementById('s-btn-next').addEventListener('click', () => { if(this.currentPage < totalPages) { this.currentPage++; this.renderList(); } });
        }

        document.getElementById('s-pagination-info').innerText = `Hiển thị ${paginatedItems.length > 0 ? startIdx + 1 : 0}-${Math.min(endIdx, totalItems)} / ${totalItems} NCC`;
        document.getElementById('s-btn-prev').disabled = this.currentPage === 1;
        document.getElementById('s-btn-next').disabled = this.currentPage === totalPages;

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">Không có nhà cung cấp</td></tr>`;
            return;
        }

        let html = '';
        paginatedItems.forEach(s => {
            html += `
                <tr>
                    <td style="font-weight: 500;">${s.id}</td>
                    <td style="font-weight: 600;">${s.name}</td>
                    <td>${s.phone}</td>
                    <td>${s.address || '-'}</td>
                    <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="SupplierManager.editSupplier('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; color: var(--danger-color);" onclick="SupplierManager.deleteSupplier('${s.id}')"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    openModal: function() {
        document.getElementById('supplier-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = 'Thêm Nhà Cung Cấp';
        document.getElementById('supplier-modal').classList.add('active');
    },

    closeModal: function() {
        document.getElementById('supplier-modal').classList.remove('active');
    },

    editSupplier: function(id) {
        const s = this.suppliers.find(x => x.id === id);
        if (!s) return;
        document.getElementById('edit-id').value = s.id;
        document.getElementById('s-name').value = s.name;
        document.getElementById('s-phone').value = s.phone;
        document.getElementById('s-address').value = s.address || '';
        document.getElementById('modal-title').innerText = 'Sửa Nhà Cung Cấp';
        document.getElementById('supplier-modal').classList.add('active');
    },

    saveSupplier: function() {
        const name = document.getElementById('s-name').value.trim();
        const phone = document.getElementById('s-phone').value.trim();
        const address = document.getElementById('s-address').value.trim();
        const editId = document.getElementById('edit-id').value;

        if (!name) return App.showToast('Tên không được bỏ trống!', 'error');
        if (!phone.match(/^[0-9]{8,15}$/)) return App.showToast('Số điện thoại không hợp lệ!', 'error');

        if (editId) {
            const index = this.suppliers.findIndex(x => x.id === editId);
            if (index !== -1) {
                this.suppliers[index] = { ...this.suppliers[index], name, phone, address };
                App.showToast('Cập nhật thành công!', 'success');
            }
        } else {
            const newId = 'NCC' + Date.now().toString().slice(-4);
            this.suppliers.unshift({ id: newId, name, phone, address });
            App.showToast('Thêm NCC thành công!', 'success');
        }

        Storage.set('suppliers', this.suppliers);
        this.renderList();
        this.closeModal();
    },

    deleteSupplier: function(id) {
        App.showConfirm('Chắc chắn xóa NCC này?', () => {
            this.suppliers = this.suppliers.filter(x => x.id !== id);
            Storage.set('suppliers', this.suppliers);
            this.filteredSuppliers = [...this.suppliers];
            this.renderList();
            App.showToast('Đã xóa', 'success');
        });
    }
};
