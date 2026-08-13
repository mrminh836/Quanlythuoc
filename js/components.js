/**
 * Layout Components Renderer
 * Hỗ trợ tái sử dụng Sidebar và Header mà không cần copy paste HTML
 */

const Layout = {
    sidebarMenu: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', link: 'dashboard.html' },
        { id: 'pos', label: 'Bán hàng (POS)', icon: 'fa-cash-register', link: 'pos.html' },
        { id: 'products', label: 'Sản phẩm', icon: 'fa-pills', link: 'products.html' },
        { id: 'inventory', label: 'Tồn kho & Lô', icon: 'fa-boxes-stacked', link: 'inventory.html' },
        { id: 'orders', label: 'Đơn hàng', icon: 'fa-file-invoice-dollar', link: 'orders.html' },
        { id: 'customers', label: 'Khách hàng', icon: 'fa-users', link: 'customers.html' },
        { id: 'suppliers', label: 'Nhà cung cấp', icon: 'fa-truck-field', link: 'suppliers.html' },
        { id: 'reports', label: 'Báo cáo', icon: 'fa-chart-line', link: 'reports.html' },
        { id: 'employees', label: 'Nhân viên', icon: 'fa-user-nurse', link: 'employees.html' },
        { id: 'ai', label: 'AI Assistant', icon: 'fa-robot', link: 'ai-assistant.html', extraClass: 'color-primary' },
        { id: 'settings', label: 'Cài đặt', icon: 'fa-gear', link: 'settings.html' }
    ],

    renderSidebar: function(activeId) {
        // Kiểm tra permission trước khi render
        const availableMenus = this.sidebarMenu.filter(menu => Auth.hasPermission(menu.id));
        
        let menuHtml = '';
        availableMenus.forEach(menu => {
            const isActive = menu.id === activeId ? 'active' : '';
            const extraClass = menu.extraClass ? menu.extraClass : '';
            
            menuHtml += `
                <a href="${menu.link}" class="nav-item ${isActive}">
                    <div class="nav-icon ${extraClass}"><i class="fa-solid ${menu.icon}"></i></div>
                    <div class="nav-text" style="${menu.extraClass ? 'font-weight: 600;' : ''}">${menu.label}</div>
                </a>
            `;
        });

        const sidebarHtml = `
            <div class="sidebar-header">
                <i class="fa-solid fa-notes-medical" style="margin-right: 12px; font-size: 1.5rem;"></i>
                <span>Smart Pharm</span>
            </div>
            <div class="sidebar-nav">
                ${menuHtml}
            </div>
            <div style="padding: 1rem; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.75rem;">
                <span class="nav-text">Smart POS v1.0</span>
            </div>
        `;

        const sidebarContainer = document.getElementById('app-sidebar');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHtml;
        }
    },

    renderHeader: function(pageTitle) {
        const user = Auth.getCurrentUser();
        const userName = user ? user.name : 'User';
        const userRole = user ? user.role : '';

        const headerHtml = `
            <div class="header-left">
                <button class="toggle-sidebar-btn" id="toggle-sidebar">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div style="font-weight: 500; font-size: 1.125rem; color: var(--text-secondary)">
                    ${pageTitle}
                </div>
            </div>
            <div class="header-right">
                <div style="position: relative; cursor: pointer;" id="notification-bell">
                    <i class="fa-solid fa-bell text-secondary" style="font-size: 1.25rem;"></i>
                    <span class="badge badge-danger" id="notification-badge" style="position: absolute; top: -8px; right: -8px; font-size: 0.6rem; padding: 2px 5px; display: none;">0</span>
                    
                    <!-- Dropdown -->
                    <div id="notification-dropdown" style="display: none; position: absolute; right: -10px; top: 100%; margin-top: 15px; width: 320px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 1000;">
                        <div style="padding: 10px 15px; font-weight: 600; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                            <span>Thông báo</span>
                            <span style="font-size: 0.75rem; color: var(--primary-color); cursor: pointer;" onclick="Notifications.clearAll()">Đánh dấu đã đọc</span>
                        </div>
                        <div id="notification-list" style="max-height: 300px; overflow-y: auto;">
                            <!-- Notifications injected here -->
                        </div>
                        <div style="padding: 10px; text-align: center; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--primary-color); cursor: pointer;" onclick="window.location.href='inventory.html'">
                            Xem tất cả cảnh báo tồn kho
                        </div>
                    </div>
                </div>
                <div style="position: relative; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; border-left: 1px solid var(--border-color); padding-left: 1rem;" id="user-menu-toggle">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${userName.charAt(0)}
                    </div>
                    <div class="user-name" style="display: flex; flex-direction: column; line-height: 1.2;">
                        <span style="font-size: 0.875rem; font-weight: 600;">${userName}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${userRole}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down text-muted" style="font-size: 0.75rem; margin-left: 0.25rem;"></i>
                    
                    <!-- User Dropdown -->
                    <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 15px; width: 200px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 1000; overflow: hidden;">
                        <a href="profile.html" style="display: block; padding: 12px 15px; color: var(--text-primary); text-decoration: none; border-bottom: 1px solid var(--border-color); transition: background 0.2s;" onmouseover="this.style.backgroundColor='var(--bg-hover)'" onmouseout="this.style.backgroundColor='transparent'"><i class="fa-solid fa-user" style="width:20px;"></i> Hồ sơ cá nhân</a>
                        <a href="settings.html" style="display: block; padding: 12px 15px; color: var(--text-primary); text-decoration: none; border-bottom: 1px solid var(--border-color); transition: background 0.2s;" onmouseover="this.style.backgroundColor='var(--bg-hover)'" onmouseout="this.style.backgroundColor='transparent'"><i class="fa-solid fa-gear" style="width:20px;"></i> Cài đặt</a>
                        <a href="#" onclick="App.logout()" style="display: block; padding: 12px 15px; color: var(--danger-color); text-decoration: none; transition: background 0.2s;" onmouseover="this.style.backgroundColor='var(--bg-hover)'" onmouseout="this.style.backgroundColor='transparent'"><i class="fa-solid fa-right-from-bracket" style="width:20px;"></i> Đăng xuất</a>
                    </div>
                </div>
            </div>
        `;

        const headerContainer = document.getElementById('app-header');
        if (headerContainer) {
            headerContainer.innerHTML = headerHtml;
        }

        // Re-bind sidebar toggle event since we just overwrote the HTML
        App.initSidebar();
        
        // Initialize notifications if Notification module exists
        if(typeof Notifications !== 'undefined') {
            Notifications.init();
        }
        
        // Toggle notification dropdown
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');
        if(bell && dropdown) {
            bell.addEventListener('click', (e) => {
                if(e.target.closest('#notification-list') || e.target.innerText === 'Đánh dấu đã đọc') return; // Do not toggle if clicking inside list
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
            // Close on click outside
            document.addEventListener('click', (e) => {
                if(!bell.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        }
        // Toggle user dropdown
        const userToggle = document.getElementById('user-menu-toggle');
        const userDropdown = document.getElementById('user-dropdown');
        if(userToggle && userDropdown) {
            userToggle.addEventListener('click', () => {
                userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
            });
            document.addEventListener('click', (e) => {
                if(!userToggle.contains(e.target)) {
                    userDropdown.style.display = 'none';
                }
            });
        }
    }
};
