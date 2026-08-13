/**
 * Common App Utilities
 */

const App = {
    // Khởi tạo app (Theme, v.v...)
    init: function() {
        this.applyTheme();
        this.applyLanguage();
    },

    // Áp dụng giao diện (Sáng/Tối)
    applyTheme: function() {
        const settings = Storage.get('settings') || {};
        if (settings.theme === 'dark') {
            document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
            document.documentElement.style.backgroundColor = '#121212';
        } else {
            document.documentElement.style.filter = 'none';
            document.documentElement.style.backgroundColor = '';
        }
    },

    // Áp dụng ngôn ngữ
    applyLanguage: function() {
        const settings = Storage.get('settings') || {};
        const lang = settings.language || 'vi';
        if (lang === 'vi') return;

        const dict = {
            "Dashboard": "Dashboard",
            "Bán hàng (POS)": "Point of Sale",
            "Sản phẩm": "Products",
            "Tồn kho & Lô": "Inventory & Batches",
            "Đơn hàng": "Orders",
            "Khách hàng": "Customers",
            "Nhà cung cấp": "Suppliers",
            "Báo cáo": "Reports",
            "Nhân viên": "Staff",
            "Cài đặt": "Settings",
            "Cài đặt hệ thống": "System Settings",
            "Giao diện (Theme)": "Theme",
            "Chuyển đổi giao diện Sáng / Tối (Demo)": "Switch between Light / Dark mode",
            "Ngôn ngữ": "Language",
            "Ngôn ngữ hiển thị chính": "Primary display language",
            "Email Notifications": "Email Notifications",
            "Nhận cảnh báo tồn kho qua email": "Receive inventory alerts via email",
            "Push Notifications": "Push Notifications",
            "Nhận thông báo đơn hàng mới trình duyệt": "Receive new order notifications in browser",
            "Khôi phục": "Restore",
            "Lưu thay đổi": "Save Changes",
            "Sáng (Light)": "Light",
            "Tối (Dark) - Demo": "Dark",
            "Đã lưu cài đặt thành công!": "Settings saved successfully!",
            "Tổng quan kinh doanh": "Business Overview",
            "Tạo đơn mới": "New Order",
            "Doanh thu": "Revenue",
            "Số đơn hàng": "Total Orders",
            "Sản phẩm sắp hết": "Low stock items",
            "Lô sắp/đã hết hạn": "Expiring/expired batches",
            "Biểu đồ doanh thu 7 ngày qua": "Revenue chart last 7 days",
            "AI Insights": "AI Insights",
            "Oresol sắp hết hàng": "Oresol is out of stock",
            "Tồn kho hiện tại: 0. Gợi ý nhập thêm 100 hộp.": "Current stock: 0. Suggest importing 100 boxes.",
            "Panadol bán chạy": "Panadol is selling fast",
            "Tăng 25% so với tuần trước.": "Increased 25% compared to last week.",
            "Amoxicillin sắp hết hạn": "Amoxicillin expiring soon",
            "Lô LOT2024 hết hạn sau 15 ngày.": "Batch LOT2024 expires in 15 days.",
            "Đơn hàng gần đây": "Recent Orders",
            "Mã đơn": "Order ID",
            "Thời gian": "Time",
            "Tổng tiền": "Total Amount",
            "Trạng thái": "Status",
            "Khách lẻ": "Retail",
            "Hoàn thành": "Completed",
            "Hủy": "Cancelled",
            "Các loại thuốc bán chạy": "Top Selling Medicines",
            "Đã bán": "Sold",
            "hộp": "boxes",
            "lọ": "bottles",
            "vỉ": "blisters",
            "Xem báo cáo chi tiết": "View detailed reports",
            "Khách hàng VIP (Chi tiêu cao)": "VIP Customers (Top Spenders)",
            "Tháng này": "This month",
            "đơn hàng": "orders",
            "Khách hàng mua thường xuyên": "Frequent Buyers",
            "Tất cả": "All",
            "Khách quen (Tiểu đường)": "Regular (Diabetes)",
            "Khách quen (Huyết áp)": "Regular (Blood Pressure)",
            "Khách sỉ": "Wholesale",
            "lần": "times",
            "Mua gần nhất: Hôm qua": "Last purchase: Yesterday",
            "Mua gần nhất: 3 ngày trước": "Last purchase: 3 days ago",
            "Mua gần nhất: Tuần trước": "Last purchase: Last week",
            "NHÀ THUỐC": "PHARMACY",
            "Trần Dược Sĩ": "Tran Pharmacist",
            "Cảnh báo": "Warning",
            "Tích cực": "Positive",
            "Gấp": "Urgent"
        };

        function translateNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent;
                let trimmed = text.trim();
                
                if (trimmed && dict[trimmed]) {
                    node.textContent = text.replace(trimmed, dict[trimmed]);
                } else if (trimmed) {
                    let newText = text;
                    for (const [vi, en] of Object.entries(dict)) {
                        // Safe replacement for partial matches
                        if (newText.includes(vi)) {
                            newText = newText.replace(vi, en);
                        }
                    }
                    if (newText !== text) {
                        node.textContent = newText;
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                    if (node.hasAttribute('placeholder') && dict[node.getAttribute('placeholder')]) {
                        node.setAttribute('placeholder', dict[node.getAttribute('placeholder')]);
                    }
                    for (let i = 0; i < node.childNodes.length; i++) {
                        translateNode(node.childNodes[i]);
                    }
                }
            }
        }

        setTimeout(() => {
            translateNode(document.body);
        }, 150);
    },

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
    App.init();
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
