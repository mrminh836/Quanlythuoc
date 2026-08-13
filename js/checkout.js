const Checkout = {
    cartItems: [],
    total: 0,

    isBuyNow: false,

    init: function() {
        const urlParams = new URLSearchParams(window.location.search);
        this.isBuyNow = urlParams.get('mode') === 'buynow';

        if (this.isBuyNow) {
            this.cartItems = Storage.get('buy_now_item') || [];
        } else {
            this.cartItems = Storage.get('shop_cart') || [];
        }

        if (this.cartItems.length === 0) {
            alert('Không có sản phẩm để thanh toán! Đang quay lại trang chủ.');
            window.location.href = 'shop.html';
            return;
        }
        this.bindEvents();
        this.renderOrderSummary();
    },

    bindEvents: function() {
        const nameInput = document.getElementById('co-name');
        const phoneInput = document.getElementById('co-phone');
        const addressInput = document.getElementById('co-address');
        const noteInput = document.getElementById('co-note');

        // CSS feedback for disabled fields
        const styleDisabled = (el) => {
            el.style.backgroundColor = '#f3f4f6';
            el.style.cursor = 'not-allowed';
            el.disabled = true;
        };
        const styleEnabled = (el) => {
            el.style.backgroundColor = '#ffffff';
            el.style.cursor = 'text';
            el.disabled = false;
        };

        // Khởi tạo ban đầu
        styleDisabled(phoneInput);
        styleDisabled(addressInput);
        styleDisabled(noteInput);

        const checkFields = () => {
            // Check Name
            if (nameInput.value.trim().length > 0) {
                styleEnabled(phoneInput);
            } else {
                styleDisabled(phoneInput);
                styleDisabled(addressInput);
                styleDisabled(noteInput);
                return;
            }

            // Check Phone (10-11 numbers)
            if (phoneInput.value.trim().match(/^[0-9]{10,11}$/)) {
                styleEnabled(addressInput);
            } else {
                styleDisabled(addressInput);
                styleDisabled(noteInput);
                return;
            }

            // Check Address
            if (addressInput.value.trim().length > 0) {
                styleEnabled(noteInput);
            } else {
                styleDisabled(noteInput);
            }
        };

        nameInput.addEventListener('input', checkFields);
        phoneInput.addEventListener('input', checkFields);
        addressInput.addEventListener('input', checkFields);
    },

    renderOrderSummary: function() {
        const container = document.getElementById('co-items');
        let html = '';
        this.total = 0;

        this.cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            this.total += itemTotal;
            html += `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.875rem;">
                    <div style="flex:1; padding-right:10px;">${item.name} <strong style="color:var(--shop-primary);">x${item.quantity}</strong></div>
                    <div style="font-weight:600;">${App.formatCurrency(itemTotal)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        document.getElementById('co-subtotal').innerText = App.formatCurrency(this.total);
        document.getElementById('co-total').innerText = App.formatCurrency(this.total);
    },

    placeOrder: function() {
        const name = document.getElementById('co-name').value.trim();
        const phone = document.getElementById('co-phone').value.trim();
        const address = document.getElementById('co-address').value.trim();
        const payment = document.querySelector('input[name="payment"]:checked').value;

        // Clear old errors
        ['name', 'phone', 'address'].forEach(id => {
            document.getElementById(`co-${id}`).style.borderColor = 'var(--shop-border)';
            document.getElementById(`err-${id}`).style.display = 'none';
        });

        if (!name) {
            document.getElementById('co-name').style.borderColor = '#ef4444';
            const err = document.getElementById('err-name');
            err.innerText = 'Vui lòng nhập họ và tên';
            err.style.display = 'block';
            document.getElementById('co-name').focus();
            return;
        }

        if (!phone) {
            document.getElementById('co-phone').style.borderColor = '#ef4444';
            const err = document.getElementById('err-phone');
            err.innerText = 'Vui lòng nhập số điện thoại';
            err.style.display = 'block';
            document.getElementById('co-phone').focus();
            return;
        } else if (!phone.match(/^[0-9]{10,11}$/)) {
            document.getElementById('co-phone').style.borderColor = '#ef4444';
            const err = document.getElementById('err-phone');
            err.innerText = 'Số điện thoại không hợp lệ (10-11 số)';
            err.style.display = 'block';
            document.getElementById('co-phone').focus();
            return;
        }

        if (!address) {
            document.getElementById('co-address').style.borderColor = '#ef4444';
            const err = document.getElementById('err-address');
            err.innerText = 'Vui lòng nhập địa chỉ giao hàng';
            err.style.display = 'block';
            document.getElementById('co-address').focus();
            return;
        }

        // Tạo order
        const orders = Storage.get('orders') || [];
        const orderId = 'DH' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14); // VD: DH20260813153022
        
        const newOrder = {
            id: orderId,
            timestamp: new Date().toISOString(),
            customerId: 'GUEST',
            customerName: name, // Custom field for shop orders
            customerPhone: phone,
            customerAddress: address,
            paymentMethod: payment,
            employeeName: 'Online',
            status: 'PENDING',
            items: this.cartItems,
            summary: {
                subtotal: this.total,
                tax: 0,
                discount: 0,
                total: this.total
            }
        };

        orders.push(newOrder);
        Storage.set('orders', orders);

        // Trừ tồn kho
        const products = Storage.get('products') || [];
        this.cartItems.forEach(cartItem => {
            const p = products.find(x => x.id === cartItem.id);
            if (p) {
                p.stock -= cartItem.quantity;
                p.sold = (p.sold || 0) + cartItem.quantity;
            }
        });
        Storage.set('products', products);

        // Xóa giỏ hàng
        if (this.isBuyNow) {
            Storage.set('buy_now_item', []);
        } else {
            Storage.set('shop_cart', []);
        }

        // Chuyển tới trang Success (pass mã đơn qua URL)
        window.location.href = `order-success.html?id=${orderId}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Checkout.init();
});
