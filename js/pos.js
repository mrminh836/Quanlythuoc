/**
 * Module Bán Hàng (POS)
 */
const POS = {
    cart: [],
    products: [],
    customers: [],
    currentCustomer: 'GUEST',

    init: function() {
        this.loadData();
        this.renderProducts();
        this.renderCustomers();
        this.bindEvents();
    },

    loadData: function() {
        this.products = Storage.get('products') || [];
        this.customers = Storage.get('customers') || [];
    },

    bindEvents: function() {
        // Search & Filter
        const searchInput = document.getElementById('pos-search');
        const categorySelect = document.getElementById('pos-category');

        searchInput.addEventListener('input', (e) => this.renderProducts(e.target.value, categorySelect.value));
        categorySelect.addEventListener('change', (e) => this.renderProducts(searchInput.value, e.target.value));

        // Checkout
        document.getElementById('btn-checkout').addEventListener('click', () => this.checkout());

        // Customer selection
        document.getElementById('customer-select').addEventListener('change', (e) => {
            this.currentCustomer = e.target.value;
            this.updateCartSummary();
        });
    },

    renderProducts: function(searchTerm = '', category = '') {
        const grid = document.getElementById('product-grid');
        let filtered = this.products.filter(p => p.status === 'ACTIVE');

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.id.toLowerCase().includes(term) ||
                (p.activeIngredient && p.activeIngredient.toLowerCase().includes(term))
            );
        }

        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Không tìm thấy sản phẩm</div>`;
            return;
        }

        let html = '';
        filtered.forEach(p => {
            const isOutOfStock = p.stock <= 0;
            const stockClass = isOutOfStock ? 'badge-danger' : (p.stock <= p.minStock ? 'badge-warning' : 'badge-success');
            const stockText = isOutOfStock ? 'Hết hàng' : `Tồn: ${p.stock}`;

            html += `
                <div class="pos-card ${isOutOfStock ? 'out-of-stock' : ''}" onclick="POS.addToCart('${p.id}')">
                    <div class="pos-card-header">
                        <div class="pos-card-title" title="${p.name}">${p.name}</div>
                        <span class="badge ${stockClass} pos-card-stock">${stockText}</span>
                    </div>
                    <div class="pos-card-footer">
                        <div class="pos-card-category" title="${p.category}">${p.category}</div>
                        <div class="pos-card-price">${App.formatCurrency(p.price)}</div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    renderCustomers: function() {
        const select = document.getElementById('customer-select');
        let html = '<option value="GUEST">Khách lẻ</option>';
        this.customers.forEach(c => {
            html += `<option value="${c.id}">${c.name} - ${c.phone} (Hạng ${c.tier})</option>`;
        });
        select.innerHTML = html;
    },

    showAddCustomerModal: function() {
        document.getElementById('new-customer-name').value = '';
        document.getElementById('new-customer-phone').value = '';
        document.getElementById('add-customer-modal').classList.add('active');
    },

    saveNewCustomer: function() {
        const name = document.getElementById('new-customer-name').value.trim();
        const phone = document.getElementById('new-customer-phone').value.trim();

        if (!name || !phone) {
            App.showToast('Vui lòng nhập tên và số điện thoại!', 'error');
            return;
        }

        const newId = 'CUS-' + Date.now().toString().slice(-6);
        const newCustomer = {
            id: newId,
            name: name,
            phone: phone,
            email: '',
            address: '',
            tier: 'Bronze',
            points: 0,
            joinDate: new Date().toISOString()
        };

        this.customers.push(newCustomer);
        Storage.set('customers', this.customers);
        
        this.renderCustomers();
        
        // Select the newly added customer
        document.getElementById('customer-select').value = newId;
        this.currentCustomer = newId;
        this.updateCartSummary();

        document.getElementById('add-customer-modal').classList.remove('active');
        App.showToast('Đã thêm khách hàng mới!', 'success');
    },

    addToCart: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock <= 0) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            // Check stock limit
            if (existingItem.quantity >= product.stock) {
                App.showToast(`Chỉ còn ${product.stock} sản phẩm trong kho!`, 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            });
        }

        this.renderCart();
    },

    updateQuantity: function(productId, change) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        const newQty = item.quantity + change;
        
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }

        if (newQty > item.maxStock) {
            App.showToast(`Kho chỉ còn ${item.maxStock} sản phẩm!`, 'warning');
            return;
        }

        item.quantity = newQty;
        this.renderCart();
    },

    setQuantity: function(productId, value) {
        const qty = parseInt(value);
        if (isNaN(qty) || qty <= 0) {
            this.renderCart(); // Re-render to clear invalid input
            return;
        }

        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        if (qty > item.maxStock) {
            App.showToast(`Kho chỉ còn ${item.maxStock} sản phẩm!`, 'warning');
            item.quantity = item.maxStock;
        } else {
            item.quantity = qty;
        }

        this.renderCart();
    },

    removeFromCart: function(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.renderCart();
    },

    clearCart: function() {
        this.cart = [];
        this.currentCustomer = 'GUEST';
        document.getElementById('customer-select').value = 'GUEST';
        this.renderCart();
    },

    renderCart: function() {
        const container = document.getElementById('cart-items');
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Chưa có sản phẩm nào trong giỏ hàng</p>
                </div>
            `;
            document.getElementById('btn-checkout').disabled = true;
            this.updateCartSummary();
            return;
        }

        let html = '';
        this.cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${App.formatCurrency(item.price)}</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="POS.updateQuantity('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                            <input type="number" class="qty-input" value="${item.quantity}" onchange="POS.setQuantity('${item.id}', this.value)" min="1">
                            <button class="qty-btn" onclick="POS.updateQuantity('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
                        <button class="remove-btn btn" onclick="POS.removeFromCart('${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
                        <div class="cart-item-total">${App.formatCurrency(item.price * item.quantity)}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        document.getElementById('btn-checkout').disabled = false;
        
        // Scroll to bottom of cart
        container.scrollTop = container.scrollHeight;
        
        this.updateCartSummary();
    },

    updateCartSummary: function() {
        let subtotal = 0;
        let totalItems = 0;

        this.cart.forEach(item => {
            subtotal += item.price * item.quantity;
            totalItems += item.quantity;
        });

        const tax = subtotal * 0.1; // 10% VAT
        let discount = 0;

        // Apply discount for registered customer tiers
        if (this.currentCustomer !== 'GUEST') {
            const customer = this.customers.find(c => c.id === this.currentCustomer);
            if (customer) {
                if (customer.tier === 'VIP') discount = subtotal * 0.1;
                else if (customer.tier === 'Gold') discount = subtotal * 0.05;
                else if (customer.tier === 'Silver') discount = subtotal * 0.02;
            }
        }

        const total = subtotal + tax - discount;

        document.getElementById('cart-count').innerText = totalItems;
        document.getElementById('cart-subtotal').innerText = App.formatCurrency(subtotal);
        document.getElementById('cart-tax').innerText = App.formatCurrency(tax);
        document.getElementById('cart-discount').innerText = App.formatCurrency(discount);
        document.getElementById('cart-total').innerText = App.formatCurrency(total);
        
        // Save to current state for checkout
        this.currentSummary = { subtotal, tax, discount, total };
    },

    checkout: function() {
        if (this.cart.length === 0) return;
        
        document.getElementById('payment-total-amount').innerText = App.formatCurrency(this.currentSummary.total);
        document.getElementById('payment-method').value = 'CASH'; // default
        document.getElementById('amount-given').value = '';
        document.getElementById('amount-change').innerText = '0 ₫';
        this.handlePaymentMethodChange(); // Init cash details display

        document.getElementById('payment-modal').classList.add('active');
    },

    handlePaymentMethodChange: function() {
        const method = document.getElementById('payment-method').value;
        const cashDetails = document.getElementById('cash-payment-details');
        if (method === 'CASH') {
            cashDetails.style.display = 'block';
            this.calculateChange();
        } else {
            cashDetails.style.display = 'none';
        }
    },

    calculateChange: function() {
        const inputEl = document.getElementById('amount-given');
        const givenInput = inputEl.value.replace(/[^0-9]/g, '');
        const given = parseInt(givenInput) || 0;
        
        if (givenInput) {
             inputEl.value = given.toLocaleString('vi-VN');
        } else {
             inputEl.value = '';
        }

        const total = this.currentSummary ? this.currentSummary.total : 0;
        let change = given - total;
        if (change < 0) change = 0;

        document.getElementById('amount-change').innerText = App.formatCurrency(change);
    },

    processCheckout: function() {
        if (this.cart.length === 0) return;
        
        const paymentMethod = document.getElementById('payment-method').value;

        // Close payment modal
        document.getElementById('payment-modal').classList.remove('active');

        // 1. Tạo đơn hàng mới
        const orderId = 'ORD-' + Date.now().toString().slice(-6);
        const currentUser = Auth.getCurrentUser();
        
        const newOrder = {
            id: orderId,
            customerId: this.currentCustomer,
            employeeId: currentUser ? currentUser.id : 'unknown',
            employeeName: currentUser ? currentUser.name : 'Unknown',
            items: [...this.cart],
            summary: this.currentSummary,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED',
            paymentMethod: paymentMethod
        };

        const orders = Storage.get('orders') || [];
        orders.push(newOrder);
        Storage.set('orders', orders);

        // 2. Update stock for products and batches
        let batches = Storage.get('batches') || [];
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
                
                // Deduct from batches (FIFO: oldest expiry first)
                let remainingToDeduct = cartItem.quantity;
                let productBatches = batches.filter(b => b.productId === product.id && b.quantity > 0)
                                            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
                                            
                for (let b of productBatches) {
                    if (remainingToDeduct <= 0) break;
                    if (b.quantity >= remainingToDeduct) {
                        b.quantity -= remainingToDeduct;
                        remainingToDeduct = 0;
                    } else {
                        remainingToDeduct -= b.quantity;
                        b.quantity = 0;
                    }
                }
            }
        });
        Storage.set('products', this.products); // Update stock
        Storage.set('batches', batches); // Update batch stock
        this.renderProducts(); // Update UI

        // 3. Render Hóa đơn
        this.showInvoice(newOrder);
        
        App.showToast('Thanh toán thành công!', 'success');
    },

    showInvoice: function(order) {
        let customerName = 'Khách lẻ';
        if (order.customerId !== 'GUEST') {
            const c = this.customers.find(x => x.id === order.customerId);
            if (c) customerName = c.name;
        }

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>${item.name}<br><small>${item.quantity} x ${item.price.toLocaleString('vi-VN')}</small></td>
                    <td style="text-align: right;">${(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                </tr>
            `;
        });

        const invoiceHtml = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px;">
                <h2>NHÀ THUỐC AINA</h2>
                <p>123 Đường Y Tế, Quận 1, TP.HCM<br>ĐT: 0123.456.789</p>
            </div>
            <h3 style="margin: 1rem 0;">HÓA ĐƠN BÁN HÀNG</h3>
            <div style="text-align: left; margin-bottom: 1rem; font-size: 0.875rem;">
                <div>Mã HĐ: ${order.id}</div>
                <div>Ngày: ${new Date(order.timestamp).toLocaleString('vi-VN')}</div>
                <div>Thu ngân: ${order.employeeName}</div>
                <div>Khách hàng: ${customerName}</div>
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
                <div class="invoice-total">TỔNG: ${order.summary.total.toLocaleString('vi-VN')} ₫</div>
            </div>
            <p style="margin-top: 2rem;">Cảm ơn quý khách và hẹn gặp lại!</p>
        `;

        document.getElementById('invoice-content').innerHTML = invoiceHtml;
        document.getElementById('invoice-modal').classList.add('active');
    }
};
