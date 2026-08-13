/**
 * Common App Utilities
 */

const App = {
    // Hiển thị thông báo (Toast)
    showToast: function(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-circle-xmark';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon" style="font-size: 1.5rem;"></i>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);
        
        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Format tiền tệ
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },

    // Toggle Sidebar trên Mobile
    initSidebar: function() {
        const toggleBtn = document.getElementById('toggle-sidebar');
        const sidebar = document.getElementById('app-sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle('mobile-open');
                } else {
                    sidebar.classList.toggle('collapsed');
                }
            });
        }
    },

    // Lấy thông tin User đang đăng nhập
    getCurrentUser: function() {
        return Storage.get('currentUser');
    },

    // Kiểm tra đã đăng nhập chưa
    requireAuth: function() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = '../pages/login.html';
        }
        return user;
    },

    // Đăng xuất
    logout: function() {
        Storage.remove('currentUser');
        window.location.href = '../pages/login.html';
    },

    // Quản lý Modal
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // Setup close events if not already done
            if (!modal.dataset.eventsBound) {
                const closeBtns = modal.querySelectorAll('.btn-close, .modal-close');
                closeBtns.forEach(btn => btn.addEventListener('click', () => this.hideModal(modalId)));
                
                // Click outside
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.hideModal(modalId);
                });
                modal.dataset.eventsBound = 'true';
            }
        }
    },

    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Global Confirm Box
    showConfirm: function(message, onConfirm, onCancel = null) {
        let confirmBox = document.getElementById('global-confirm');
        if (!confirmBox) {
            const html = `
                <div id="global-confirm" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
                    <div style="background:var(--bg-surface, #fff); padding:2rem; border-radius:8px; width:400px; max-width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                        <h3 style="margin-top:0; margin-bottom:1rem; color:var(--text-primary, #111); font-size:1.25rem;">Xác nhận thao tác</h3>
                        <p id="global-confirm-msg" style="margin-bottom:2rem; color:var(--text-secondary, #444); line-height:1.5;"></p>
                        <div style="display:flex; justify-content:flex-end; gap:1rem;">
                            <button id="global-confirm-cancel" style="padding:8px 16px; background:var(--bg-hover, #eee); border:1px solid #ccc; border-radius:4px; cursor:pointer;">Hủy</button>
                            <button id="global-confirm-ok" style="padding:8px 16px; background:var(--danger-color, #ef4444); color:white; border:none; border-radius:4px; cursor:pointer;">Xác nhận</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            confirmBox = document.getElementById('global-confirm');
        }

        document.getElementById('global-confirm-msg').innerText = message;
        confirmBox.style.display = 'flex';

        const btnOk = document.getElementById('global-confirm-ok');
        const btnCancel = document.getElementById('global-confirm-cancel');

        // Remove old event listeners
        const newBtnOk = btnOk.cloneNode(true);
        const newBtnCancel = btnCancel.cloneNode(true);
        btnOk.parentNode.replaceChild(newBtnOk, btnOk);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

        newBtnOk.addEventListener('click', () => {
            confirmBox.style.display = 'none';
            if (typeof onConfirm === 'function') onConfirm();
        });

        newBtnCancel.addEventListener('click', () => {
            confirmBox.style.display = 'none';
            if (typeof onCancel === 'function') onCancel();
        });
        
        // Click outside
        const outsideHandler = (e) => {
            if (e.target === confirmBox) {
                confirmBox.style.display = 'none';
                if (typeof onCancel === 'function') onCancel();
                confirmBox.removeEventListener('click', outsideHandler);
            }
        };
        confirmBox.addEventListener('click', outsideHandler);
    },

    // Loading overlay
    showLoading: function() {
        let loading = document.getElementById('global-loading');
        if (!loading) {
            const html = `
                <div id="global-loading" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:10000; justify-content:center; align-items:center;">
                    <div style="width:40px; height:40px; border:4px solid var(--primary-light, #bae6fd); border-top:4px solid var(--primary-color, #0ea5e9); border-radius:50%; animation:spin 1s linear infinite;"></div>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            loading = document.getElementById('global-loading');
        }
        loading.style.display = 'flex';
    },

    hideLoading: function() {
        const loading = document.getElementById('global-loading');
        if (loading) loading.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.initSidebar();
    
    // Global ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal, #global-confirm').forEach(el => {
                if (window.getComputedStyle(el).display !== 'none') {
                    el.style.display = 'none';
                }
            });
        }
    });
});
