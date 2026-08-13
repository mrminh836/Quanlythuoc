/**
 * Module Quản lý Sản Phẩm
 */
const ProductManager = {
    products: [],
    currentPage: 1,
    itemsPerPage: 10,
    filteredProducts: [],

    init: function() {
        this.products = Storage.get('products') || [];
        this.filteredProducts = [...this.products];
        this.renderList();
        this.bindEvents();
    },

    bindEvents: function() {
        document.getElementById('search-product').addEventListener('input', () => { this.currentPage = 1; this.renderList(); });
        document.getElementById('filter-category').addEventListener('change', () => { this.currentPage = 1; this.renderList(); });
    },

    renderList: function() {
        const tbody = document.getElementById('product-list');
        const searchTerm = document.getElementById('search-product').value.toLowerCase();
        const category = document.getElementById('filter-category').value;

        this.filteredProducts = this.products;

        if (searchTerm) {
            this.filteredProducts = this.filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.id.toLowerCase().includes(searchTerm) ||
                (p.activeIngredient && p.activeIngredient.toLowerCase().includes(searchTerm))
            );
        }

        if (category) {
            this.filteredProducts = this.filteredProducts.filter(p => p.category === category);
        }

        const totalItems = this.filteredProducts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        if(this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const paginatedItems = this.filteredProducts.slice(startIdx, endIdx);

        document.getElementById('pagination-info').innerText = `Hiển thị ${paginatedItems.length > 0 ? startIdx + 1 : 0}-${Math.min(endIdx, totalItems)} / ${totalItems} sản phẩm`;

        const prevBtn = document.querySelector('#pagination-info').nextElementSibling.children[0];
        const nextBtn = document.querySelector('#pagination-info').nextElementSibling.children[1];
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        
        prevBtn.onclick = () => { if(this.currentPage > 1) { this.currentPage--; this.renderList(); } };
        nextBtn.onclick = () => { if(this.currentPage < totalPages) { this.currentPage++; this.renderList(); } };

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">Không tìm thấy sản phẩm nào!</td></tr>`;
            return;
        }

        let html = '';
        paginatedItems.forEach(p => {
            const isOutOfStock = p.stock <= 0;
            const stockClass = isOutOfStock ? 'badge-danger' : (p.stock <= p.minStock ? 'badge-warning' : 'badge-success');
            const statusClass = p.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
            const statusText = p.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán';

            html += `
                <tr>
                    <td style="font-weight: 500;">${p.id}</td>
                    <td>
                        <div style="font-weight: 600;">${p.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted)">${p.activeIngredient || ''}</div>
                    </td>
                    <td>${p.category}</td>
                    <td>${p.unit}</td>
                    <td style="font-weight: 600; color: var(--primary-color);">${App.formatCurrency(p.price)}</td>
                    <td><span class="badge ${stockClass}">${p.stock}</span></td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td style="text-align: right;">
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="ProductManager.editProduct('${p.id}')" title="Sửa">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; color: var(--danger-color);" onclick="ProductManager.deleteProduct('${p.id}')" title="Xóa">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    openModal: function() {
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('p-id').disabled = false;
        document.getElementById('modal-title').innerText = 'Thêm sản phẩm mới';
        document.getElementById('product-modal').classList.add('active');
    },

    closeModal: function() {
        document.getElementById('product-modal').classList.remove('active');
    },

    editProduct: function(id) {
        const p = this.products.find(x => x.id === id);
        if (!p) return;

        document.getElementById('edit-id').value = p.id;
        document.getElementById('p-id').value = p.id;
        document.getElementById('p-id').disabled = true; // Không cho sửa mã gốc
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-ingredient').value = p.activeIngredient || '';
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-unit').value = p.unit;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-minstock').value = p.minStock || 0;
        document.getElementById('p-image').value = p.imageUrl || '';

        document.getElementById('modal-title').innerText = 'Cập nhật sản phẩm';
        document.getElementById('product-modal').classList.add('active');
    },

    saveProduct: function() {
        const id = document.getElementById('p-id').value.trim();
        const name = document.getElementById('p-name').value.trim();
        const ingredient = document.getElementById('p-ingredient').value.trim();
        const category = document.getElementById('p-category').value;
        const unit = document.getElementById('p-unit').value;
        const price = parseInt(document.getElementById('p-price').value);
        const stock = parseInt(document.getElementById('p-stock').value);
        const minStock = parseInt(document.getElementById('p-minstock').value);
        const imageUrl = document.getElementById('p-image').value.trim();
        
        const editId = document.getElementById('edit-id').value;

        // Validation
        if (!id || !name) {
            App.showToast('Mã và Tên sản phẩm không được bỏ trống!', 'error');
            return;
        }
        if (isNaN(price) || price < 0) {
            App.showToast('Giá bán phải là số dương hợp lệ!', 'error');
            return;
        }
        if (isNaN(stock) || stock < 0 || isNaN(minStock) || minStock < 0) {
            App.showToast('Tồn kho không được là số âm!', 'error');
            return;
        }

        // Logic lưu
        if (editId) {
            // Cập nhật
            const index = this.products.findIndex(x => x.id === editId);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], name, activeIngredient: ingredient, category, unit, price, stock, minStock, imageUrl };
                App.showToast('Cập nhật sản phẩm thành công!', 'success');
            }
        } else {
            // Thêm mới
            if (this.products.some(x => x.id === id)) {
                App.showToast('Mã sản phẩm đã tồn tại!', 'error');
                return;
            }
            this.products.unshift({
                id, name, activeIngredient: ingredient, category, unit, price, stock, minStock, imageUrl, status: 'ACTIVE', expiryDate: '2025-12-31'
            });
            App.showToast('Thêm sản phẩm thành công!', 'success');
        }

        Storage.set('products', this.products);
        this.renderList();
        this.closeModal();
    },

    deleteProduct: function(id) {
        if (Auth.getCurrentUser().role !== 'ADMIN') {
            App.showToast('Chỉ Quản trị viên mới có quyền xóa sản phẩm!', 'error');
            return;
        }
        App.showConfirm(`Bạn có chắc chắn muốn xóa sản phẩm ${id} không? Thao tác này không thể hoàn tác.`, () => {
            const index = this.products.findIndex(x => x.id === id);
            if (index !== -1) {
                this.products.splice(index, 1);
                Storage.set('products', this.products);
                this.renderList();
                App.showToast('Đã xóa sản phẩm!', 'success');
            }
        });
    }
};
