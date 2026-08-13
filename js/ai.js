/**
 * Kiến trúc Mock AI Service
 * Sau này sẽ được thay thế bởi API call tới Node.js -> Gemini
 */
const aiService = {
    // Giả lập API delay
    delay: (ms) => new Promise(res => setTimeout(res, ms)),

    ask: async function(query) {
        await this.delay(1000 + Math.random() * 1000); // 1-2 giây delay
        const q = query.toLowerCase();
        const products = Storage.get('products') || [];
        const orders = Storage.get('orders') || [];

        // Logic phân tích thô sơ (Mock Gemini)
        if (q.includes('hết hạn') || q.includes('hạn sử dụng')) {
            const today = new Date();
            const expired = products.filter(p => new Date(p.expiryDate) < today);
            const soon = products.filter(p => {
                const diff = (new Date(p.expiryDate) - today) / (1000 * 3600 * 24);
                return diff >= 0 && diff <= 30;
            });
            return `Dựa trên dữ liệu hiện tại, có **${expired.length}** sản phẩm đã hết hạn và **${soon.length}** sản phẩm sắp hết hạn trong 30 ngày tới. Bạn nên kiểm tra kho tại trang "Tồn Kho".`;
        }
        
        if (q.includes('hết hàng') || q.includes('tồn kho')) {
            const outOfStock = products.filter(p => p.stock === 0);
            const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
            return `Hiện tại có **${outOfStock.length}** sản phẩm đã hết hàng hoàn toàn, và **${lowStock.length}** sản phẩm đang dưới mức tồn tối thiểu. Bạn có muốn tôi gợi ý đơn vị nhập hàng không?`;
        }

        if (q.includes('doanh thu') || q.includes('bán được')) {
            let total = 0;
            orders.forEach(o => { if(o.status !== 'CANCELLED') total += o.summary.total; });
            return `Tổng doanh thu hệ thống ghi nhận tính đến nay là **${App.formatCurrency(total)}**. Nếu bạn cần chi tiết theo ngày, vui lòng xem ở bảng điều khiển Báo cáo.`;
        }

        if (q.includes('nhập hàng') || q.includes('gợi ý')) {
            const lowStock = products.filter(p => p.stock <= p.minStock).map(p => p.name).join(', ');
            if(!lowStock) return "Hiện tại kho vẫn đủ hàng hóa, bạn chưa cần nhập thêm ngay lúc này.";
            return `Dựa vào lượng tồn kho thấp, AI đề xuất bạn nên ưu tiên nhập thêm các mặt hàng sau: **${lowStock}**.`;
        }

        return "Xin lỗi, hiện tại tôi chỉ là bản Demo mô phỏng (Mock AI). Sau này khi kết nối backend với Google Gemini API, tôi sẽ có thể phân tích bất kỳ câu hỏi phức tạp nào của bạn dựa trên dữ liệu hệ thống!";
    }
};

const AI = {
    init: function() {
        this.renderInsights();
        const input = document.getElementById('chat-input');
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight < 100 ? this.scrollHeight : 100) + 'px';
        });
    },

    renderInsights: function() {
        const panel = document.getElementById('insights-panel');
        const products = Storage.get('products') || [];
        const today = new Date();
        
        // Expiry alert
        const expSoon = products.filter(p => {
            const d = (new Date(p.expiryDate) - today) / 86400000;
            return d > 0 && d <= 30;
        });

        // Stock alert
        const outOfStock = products.filter(p => p.stock === 0);

        // Sales insight (mock logic)
        let html = `
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px;">AI Insights Dashboard</h3>
        `;

        if (expSoon.length > 0) {
            html += `
                <div class="insight-card danger">
                    <div class="insight-title"><i class="fa-solid fa-clock"></i> Cảnh báo hết hạn</div>
                    <div class="insight-desc">Phát hiện ${expSoon.length} lô thuốc sắp hết hạn sử dụng. Cần có biện pháp xử lý.</div>
                </div>
            `;
        } else {
            html += `
                <div class="insight-card success">
                    <div class="insight-title"><i class="fa-solid fa-check-circle"></i> Hạn sử dụng an toàn</div>
                    <div class="insight-desc">Không phát hiện thuốc nào sắp hết hạn trong 30 ngày tới.</div>
                </div>
            `;
        }

        if (outOfStock.length > 0) {
            html += `
                <div class="insight-card warning">
                    <div class="insight-title"><i class="fa-solid fa-box-open"></i> Đứt gãy nguồn cung</div>
                    <div class="insight-desc">Có ${outOfStock.length} sản phẩm hết hàng hoàn toàn. Đề xuất nhập thêm ngay.</div>
                </div>
            `;
        }

        html += `
            <div class="insight-card">
                <div class="insight-title"><i class="fa-solid fa-chart-line"></i> Xu hướng bán hàng</div>
                <div class="insight-desc">Panadol Extra đang là sản phẩm có tốc độ bán ra nhanh nhất tuần qua.</div>
            </div>
            <div class="insight-card" style="border-left-color: var(--primary-color);">
                <div class="insight-title"><i class="fa-solid fa-lightbulb"></i> Gợi ý tối ưu</div>
                <div class="insight-desc">Có thể kết hợp bán thêm Vitamin C chung với đơn thuốc Kháng sinh để tăng doanh thu.</div>
            </div>
        `;

        panel.innerHTML = html;
    },

    clearChat: function() {
        document.getElementById('chat-messages').innerHTML = `
            <div class="message ai">
                <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="message-bubble">
                    Đã xóa lịch sử. Bạn cần hỗ trợ gì?
                </div>
            </div>
        `;
    },

    ask: function(query) {
        const input = document.getElementById('chat-input');
        input.value = query;
        this.sendInput();
    },

    sendInput: function() {
        const input = document.getElementById('chat-input');
        const query = input.value.trim();
        if (!query) return;

        input.value = '';
        input.style.height = 'auto'; // reset height

        this.appendMessage('user', query);
        this.showTyping();

        // Simulate API call
        aiService.ask(query).then(response => {
            this.hideTyping();
            // Convert markdown-like bold to HTML for simple rendering
            const htmlRes = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            this.appendMessage('ai', htmlRes);
        });
    },

    appendMessage: function(sender, text) {
        const chat = document.getElementById('chat-messages');
        const avatar = sender === 'ai' ? '<i class="fa-solid fa-robot"></i>' : 'U';
        const html = `
            <div class="message ${sender}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-bubble">${text}</div>
            </div>
        `;
        chat.insertAdjacentHTML('beforeend', html);
        chat.scrollTop = chat.scrollHeight;
    },

    showTyping: function() {
        const chat = document.getElementById('chat-messages');
        const html = `
            <div class="message ai" id="typing-indicator">
                <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        chat.insertAdjacentHTML('beforeend', html);
        chat.scrollTop = chat.scrollHeight;
    },

    hideTyping: function() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }
};
