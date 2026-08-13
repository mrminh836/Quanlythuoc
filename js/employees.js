const EmployeeManager = {
    employees: [],

    init: function() {
        this.employees = Storage.get('users') || [];
        this.renderList();
    },

    renderList: function() {
        const tbody = document.getElementById('employee-list');
        if (this.employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">Không có nhân viên</td></tr>`;
            return;
        }

        let html = '';
        this.employees.forEach(e => {
            let roleClass = 'badge-success'; // Cashier
            if (e.role === 'PHARMACIST') roleClass = 'badge-primary';
            if (e.role === 'ADMIN') roleClass = 'badge-danger';
            
            const currentUser = Auth.getCurrentUser();
            const isSelf = currentUser && currentUser.id === e.id;
            
            // Mask password slightly for UI realism
            const maskedPass = e.password.length > 0 ? '***' : '';

            html += `
                <tr>
                    <td style="font-weight: 500;">NV${e.id.toString().padStart(3, '0')}</td>
                    <td style="font-weight: 600;">
                        ${e.name}
                        ${isSelf ? '<span class="badge" style="background:var(--bg-main); color:var(--text-secondary); margin-left: 4px;">(Bạn)</span>' : ''}
                    </td>
                    <td>${e.email}</td>
                    <td>${maskedPass}</td>
                    <td><span class="badge ${roleClass}">${e.role}</span></td>
                    <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="EmployeeManager.editEmployee('${e.id}')" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; color: var(--danger-color);" onclick="EmployeeManager.deleteEmployee('${e.id}')" ${isSelf ? 'disabled' : ''} title="Xóa"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    openModal: function() {
        document.getElementById('employee-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = 'Thêm Nhân Viên';
        document.getElementById('employee-modal').classList.add('active');
    },

    closeModal: function() {
        document.getElementById('employee-modal').classList.remove('active');
    },

    editEmployee: function(id) {
        const e = this.employees.find(x => x.id.toString() === id.toString());
        if (!e) return;
        document.getElementById('edit-id').value = e.id;
        document.getElementById('e-name').value = e.name;
        document.getElementById('e-email').value = e.email;
        document.getElementById('e-password').value = e.password;
        document.getElementById('e-role').value = e.role;
        document.getElementById('modal-title').innerText = 'Sửa Nhân Viên';
        document.getElementById('employee-modal').classList.add('active');
    },

    saveEmployee: function() {
        const name = document.getElementById('e-name').value.trim();
        const email = document.getElementById('e-email').value.trim();
        const password = document.getElementById('e-password').value.trim();
        const role = document.getElementById('e-role').value;
        const editId = document.getElementById('edit-id').value;

        if (!name || !email || !password) return App.showToast('Vui lòng điền đủ thông tin!', 'error');
        if (!email.includes('@')) return App.showToast('Email không hợp lệ!', 'error');

        // Check duplicate email
        const duplicate = this.employees.find(x => x.email === email && x.id.toString() !== editId);
        if (duplicate) return App.showToast('Email này đã được sử dụng!', 'error');

        if (editId) {
            const index = this.employees.findIndex(x => x.id.toString() === editId);
            if (index !== -1) {
                this.employees[index] = { ...this.employees[index], name, email, password, role };
                App.showToast('Cập nhật nhân viên thành công!', 'success');
                
                // Nếu tự sửa chính mình thì update session
                const currentUser = Auth.getCurrentUser();
                if(currentUser && currentUser.id.toString() === editId) {
                    Storage.set('currentUser', { id: editId, name, email, role });
                    // Nếu sửa role thành Cashier thì phải reload lại page vì Cashier ko được ở màn này
                    if (role !== 'ADMIN') window.location.href = 'dashboard.html';
                }
            }
        } else {
            const newId = Date.now();
            this.employees.push({ id: newId, name, email, password, role });
            App.showToast('Thêm nhân viên thành công!', 'success');
        }

        Storage.set('users', this.employees);
        this.renderList();
        this.closeModal();
    },

    deleteEmployee: function(id) {
        const currentUser = Auth.getCurrentUser();
        if(currentUser && currentUser.id.toString() === id.toString()) {
            return App.showToast('Bạn không thể tự xóa chính mình!', 'error');
        }

        if(confirm('Chắc chắn xóa tài khoản nhân viên này?')) {
            this.employees = this.employees.filter(x => x.id.toString() !== id.toString());
            Storage.set('users', this.employees);
            this.renderList();
            App.showToast('Đã xóa nhân viên', 'success');
        }
    }
};
