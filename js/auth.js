/**
 * Module xử lý xác thực người dùng
 */
const Auth = {
    login: function(email, password, remember) {
        const users = Storage.get('users');
        if (!users) {
            App.showToast('Lỗi hệ thống: Không tìm thấy dữ liệu người dùng.', 'error');
            return false;
        }

        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Không lưu password vào current user session
            const userSession = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            
            // Nếu remember, lưu lâu hơn (nhưng đây là mock, ta cứ lưu vào localStorage)
            Storage.set('currentUser', userSession);
            return true;
        } else {
            App.showToast('Email hoặc mật khẩu không chính xác!', 'error');
            return false;
        }
    },

    logout: function() {
        Storage.remove('currentUser');
        window.location.href = 'login.html';
    },

    getCurrentUser: function() {
        return Storage.get('currentUser');
    },

    requireAuth: function() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    },

    // Kiểm tra quyền truy cập menu
    hasPermission: function(module) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const role = user.role; // ADMIN, PHARMACIST, CASHIER
        
        switch (role) {
            case 'ADMIN':
                return true; // Admin has all rights
            case 'PHARMACIST':
                // Không hiển thị Employees
                return module !== 'employees';
            case 'CASHIER':
                // Cashier chỉ thấy Dashboard, POS, Orders, Customers
                return ['dashboard', 'pos', 'orders', 'customers'].includes(module);
            default:
                return false;
        }
    }
};
