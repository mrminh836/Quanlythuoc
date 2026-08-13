/**
 * Global AI Assistant for B2C Shop (AINA)
 * Advanced AI Character with animations and context-awareness
 */
const ShopAI = {
    init: function() {
        this.buildUI();
        this.buildFooter();
        // Trigger initial contextual greeting after a short delay
        setTimeout(() => {
            this.showContextTooltip();
        }, 2000);
    },

    buildFooter: function() {
        if(document.querySelector('footer')) return;
        const footerHtml = `
            <footer id="shop-footer" style="background-color: #1f2937; color: #d1d5db; padding: 3rem 1rem 1rem; margin-top: auto; width: 100%; box-sizing: border-box;">
                <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; border-bottom: 1px solid #374151; padding-bottom: 2rem;">
                    <div>
                        <h3 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; font-size: 1.2rem;">
                            <img src="../assets/images/ainalogo.png" class="shop-logo-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/8687/8687597.png'" alt="Logo">
                            <div class="shop-logo-text" style="text-align: left;">
                                <span class="shop-logo-top">NHÀ THUỐC</span>
                                <span class="shop-logo-bottom">AINA</span>
                            </div>
                        </h3>
                        <p style="font-size: 0.875rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-location-dot" style="width: 20px;"></i> 123 Đường ABC, Quận X, TP.HCM</p>
                        <p style="font-size: 0.875rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-phone" style="width: 20px;"></i> Hotline: 1900 1234</p>
                        <p style="font-size: 0.875rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-envelope" style="width: 20px;"></i> Email: contact@smartpharmacy.local</p>
                    </div>
                    <div>
                        <h4 style="color: white; margin-bottom: 1rem; font-size: 1rem;">Về chúng tôi</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Giới thiệu</a></li>
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Chính sách bảo mật</a></li>
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="color: white; margin-bottom: 1rem; font-size: 1rem;">Hỗ trợ khách hàng</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Hướng dẫn mua hàng</a></li>
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Chính sách đổi trả</a></li>
                            <li><a href="#" style="color: #d1d5db; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d1d5db'">Chính sách giao hàng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="color: white; margin-bottom: 1rem; font-size: 1rem;">Kết nối với chúng tôi</h4>
                        <div style="display: flex; gap: 1rem; font-size: 1.5rem;">
                            <a href="#" style="color: #d1d5db; transition: color 0.2s;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#d1d5db'"><i class="fa-brands fa-facebook"></i></a>
                            <a href="#" style="color: #d1d5db; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#d1d5db'"><i class="fa-brands fa-youtube"></i></a>
                            <a href="#" style="color: #d1d5db; transition: color 0.2s;" onmouseover="this.style.color='#ec4899'" onmouseout="this.style.color='#d1d5db'"><i class="fa-brands fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;">
                    &copy; 2026 AINA Pharmacy. All rights reserved.
                </div>
            </footer>
        `;
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    },

    buildUI: function() {
        if(document.getElementById('shop-ai-container')) return;

        const styleHtml = `
            <style>
                /* Animations for AINA */
                @keyframes aina-float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes aina-wave {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    50% { transform: rotate(0deg); }
                    75% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes aina-glow {
                    0% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
                    50% { filter: drop-shadow(0 10px 15px rgba(59, 130, 246, 0.6)); }
                    100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
                }
                @keyframes tooltip-pop {
                    0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                
                .aina-container {
                    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                    display: flex; flex-direction: column; align-items: flex-end;
                }

                .aina-tooltip {
                    background: white; color: var(--shop-text);
                    padding: 12px 18px; border-radius: 20px; border-bottom-right-radius: 0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    margin-bottom: 15px; font-size: 0.9rem; font-weight: 500;
                    max-width: 220px; text-align: left; line-height: 1.4;
                    border: 1px solid var(--shop-border);
                    display: none; animation: tooltip-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    position: relative;
                }
                .aina-tooltip::after {
                    content: ''; position: absolute; bottom: -10px; right: 25px;
                    border-width: 10px 10px 0; border-style: solid;
                    border-color: white transparent transparent transparent;
                    display: block; width: 0;
                }

                .aina-character {
                    width: 110px; height: auto; cursor: pointer;
                    animation: aina-float 3.5s ease-in-out infinite, aina-wave 4s ease-in-out infinite, aina-glow 3.5s infinite;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .aina-character:hover { transform: scale(1.15) rotate(-10deg); animation-play-state: paused; }

                /* Chat Window */
                .aina-chat-window {
                    display: none; flex-direction: column; position: fixed; 
                    bottom: 160px; right: 20px; width: 360px; height: 500px; 
                    max-height: 80vh; max-width: 90vw; background: var(--shop-surface); 
                    border: 1px solid var(--shop-border); border-radius: 16px; 
                    box-shadow: 0 15px 40px rgba(0,0,0,0.25); z-index: 9998; overflow: hidden;
                    transform-origin: bottom right;
                    animation: tooltip-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                .aina-header {
                    background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; 
                    padding: 15px; display: flex; justify-content: space-between; align-items: center;
                }
                .aina-header-info { display: flex; align-items: center; gap: 12px; }
                .aina-header-avatar {
                    width: 45px; height: 45px; border-radius: 50%; object-fit: cover;
                    border: 2px solid white; background: white;
                }
            </style>
        `;

        const greeting = this.getTimeGreeting();
        const firstMsg = `${greeting}! Tôi là AINA. ${this.getContextHelp()}`;

        const html = `
            ${styleHtml}
            <!-- AINA Character -->
            <div id="shop-ai-container" class="aina-container">
                <div id="aina-tooltip" class="aina-tooltip">
                    Xin chào! Tôi là AINA.
                </div>
                <!-- Fallback to a placeholder character image if aina.png not found -->
                <img src="../assets/images/aina.png" class="aina-character" onclick="ShopAI.toggle()" alt="AINA Assistant" onerror="this.src='https://cdn-icons-png.flaticon.com/512/8687/8687597.png'">
            </div>

            <!-- AI Chat Window -->
            <div id="shop-ai-window" class="aina-chat-window">
                <div class="aina-header">
                    <div class="aina-header-info">
                        <img src="../assets/images/aina.png" class="aina-header-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/8687/8687597.png'">
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem; letter-spacing: 0.5px;">AINA Assistant</div>
                            <div style="font-size: 0.8rem; color: #bfdbfe; margin-top: 2px;"><i class="fa-solid fa-circle" style="color:#22c55e; font-size: 0.5rem; vertical-align: middle; margin-right: 2px;"></i> Sẵn sàng hỗ trợ</div>
                        </div>
                    </div>
                    <button onclick="ShopAI.toggle()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.8rem; line-height:1; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">&times;</button>
                </div>

                <div style="background:#fffbeb; color:#b45309; padding:10px 15px; font-size:0.8rem; border-bottom:1px solid #fde68a; text-align:center; line-height:1.4;">
                    <i class="fa-solid fa-shield-heart"></i> <strong>Lưu ý:</strong> AINA cung cấp thông tin tham khảo, không thay thế bác sĩ hay dược sĩ chuyên môn.
                </div>

                <div id="shop-ai-messages" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; background:#f8fafc;">
                    <div style="align-self:flex-start; background:white; padding:12px 16px; border-radius:18px; border-top-left-radius:4px; max-width:85%; font-size:0.95rem; border:1px solid var(--shop-border); box-shadow:0 2px 8px rgba(0,0,0,0.04); color:var(--shop-text);">
                        ${firstMsg}
                    </div>
                </div>

                <div style="padding:12px 15px; display:flex; gap:10px; overflow-x:auto; white-space:nowrap; background:white; border-top:1px solid var(--shop-border); scrollbar-width:none;">
                    <button onclick="ShopAI.ask('Tư vấn vitamin')" style="background:#f1f5f9; border:none; border-radius:20px; padding:8px 14px; font-size:0.85rem; font-weight:500; cursor:pointer; color:#334155; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Tư vấn Vitamin</button>
                    <button onclick="ShopAI.ask('Thuốc giảm đau')" style="background:#f1f5f9; border:none; border-radius:20px; padding:8px 14px; font-size:0.85rem; font-weight:500; cursor:pointer; color:#334155; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Thuốc giảm đau</button>
                    <button onclick="ShopAI.ask('Sản phẩm khuyến mãi')" style="background:#f1f5f9; border:none; border-radius:20px; padding:8px 14px; font-size:0.85rem; font-weight:500; cursor:pointer; color:#334155; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Đang khuyến mãi</button>
                </div>

                <div style="display:flex; border-top:1px solid var(--shop-border); padding:12px 15px; background:white; align-items:center; gap:10px;">
                    <input type="text" id="shop-ai-input" placeholder="Nhập câu hỏi cho AINA..." style="flex:1; border:none; background:#f1f5f9; border-radius:24px; font-family:inherit; font-size:0.95rem; padding:12px 16px; outline:none;" onkeypress="if(event.key==='Enter') ShopAI.send()">
                    <button onclick="ShopAI.send()" style="background:linear-gradient(135deg, #3b82f6, #2563eb); border:none; color:white; width:42px; height:42px; border-radius:50%; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform 0.2s, box-shadow 0.2s; flex-shrink:0; box-shadow: 0 4px 10px rgba(37,99,235,0.3);" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 15px rgba(37,99,235,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(37,99,235,0.3)'"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    getTimeGreeting: function() {
        const hour = new Date().getHours();
        if(hour >= 5 && hour < 12) return 'Chào buổi sáng';
        if(hour >= 12 && hour < 18) return 'Chào buổi chiều';
        if(hour >= 18 && hour < 22) return 'Chào buổi tối';
        return 'Chào bạn';
    },

    getContextHelp: function() {
        const path = window.location.pathname;
        if(path.includes('shop-detail')) {
            return 'Bạn đang xem chi tiết sản phẩm. Bạn có thắc mắc gì về công dụng hay cách dùng không?';
        } else if(path.includes('checkout')) {
            return 'Bạn đang ở bước thanh toán. Nếu gặp khó khăn khi nhập thông tin, hãy cho tôi biết nhé!';
        } else if(path.includes('shop.html')) {
            return 'Bạn muốn tìm sản phẩm nào, hay cần gợi ý danh mục nổi bật hôm nay?';
        } else if(path.includes('wishlist')) {
            return 'Danh sách yêu thích của bạn tuyệt quá! Cần thông tin thêm về sản phẩm nào không?';
        }
        return 'Tôi có thể giúp bạn tra cứu nhanh thông tin sản phẩm và tư vấn các vấn đề cơ bản.';
    },

    showContextTooltip: function() {
        const tt = document.getElementById('aina-tooltip');
        if(tt && (document.getElementById('shop-ai-window').style.display === 'none' || document.getElementById('shop-ai-window').style.display === '')) {
            tt.innerText = this.getContextHelp();
            tt.style.display = 'block';
            setTimeout(() => {
                tt.style.display = 'none';
            }, 8000); // Hide after 8s
        }
    },

    toggle: function() {
        const win = document.getElementById('shop-ai-window');
        const tt = document.getElementById('aina-tooltip');
        if(win.style.display === 'none' || win.style.display === '') {
            win.style.display = 'flex';
            if(tt) tt.style.display = 'none';
            // Scroll to bottom
            const chat = document.getElementById('shop-ai-messages');
            chat.scrollTop = chat.scrollHeight;
        } else {
            win.style.display = 'none';
        }
    },

    ask: function(q) {
        document.getElementById('shop-ai-input').value = q;
        this.send();
    },

    send: function() {
        const input = document.getElementById('shop-ai-input');
        const text = input.value.trim();
        if(!text) return;
        
        input.value = '';
        this.appendMsg('user', text);
        this.appendTyping();

        // Simulate API delay algorithm based on text length
        const delay = 800 + Math.random() * 500 + (text.length * 10);
        setTimeout(() => {
            this.removeTyping();
            this.processQuery(text.toLowerCase());
        }, delay);
    },

    appendMsg: function(sender, text) {
        const chat = document.getElementById('shop-ai-messages');
        let style = '';
        if(sender === 'user') {
            style = 'align-self:flex-end; background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; border-top-right-radius:4px; border:none; box-shadow:0 4px 10px rgba(37,99,235,0.2);';
        } else {
            style = 'align-self:flex-start; background:white; border:1px solid var(--shop-border); border-top-left-radius:4px; color:var(--shop-text); box-shadow:0 2px 8px rgba(0,0,0,0.04);';
        }
        
        const html = `
            <div style="padding:12px 16px; border-radius:18px; max-width:85%; font-size:0.95rem; line-height:1.5; ${style}">
                ${text}
            </div>
        `;
        chat.insertAdjacentHTML('beforeend', html);
        chat.scrollTop = chat.scrollHeight;
    },

    appendTyping: function() {
        const chat = document.getElementById('shop-ai-messages');
        const html = `
            <div id="shop-ai-typing" style="align-self:flex-start; background:white; padding:12px 20px; border-radius:18px; border-top-left-radius:4px; max-width:85%; border:1px solid var(--shop-border); color:var(--shop-text-muted); display:flex; gap:6px; align-items:center;">
                <div style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:fade 1s infinite alternate;"></div>
                <div style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:fade 1s infinite alternate; animation-delay:0.2s;"></div>
                <div style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:fade 1s infinite alternate; animation-delay:0.4s;"></div>
            </div>
        `;
        
        // Add fade keyframes if not exists
        if(!document.getElementById('aina-typing-style')) {
            const style = document.createElement('style');
            style.id = 'aina-typing-style';
            style.innerHTML = `@keyframes fade { 0% { opacity: 0.3; transform:translateY(0); } 100% { opacity: 1; transform:translateY(-3px); } }`;
            document.head.appendChild(style);
        }

        chat.insertAdjacentHTML('beforeend', html);
        chat.scrollTop = chat.scrollHeight;
    },

    removeTyping: function() {
        const typing = document.getElementById('shop-ai-typing');
        if(typing) typing.remove();
    },

    processQuery: function(q) {
        const products = Storage.get('products') || [];
        
        // Advanced contextual algorithms for AINA
        
        // 1. Strict Check for medical advice
        if (q.includes('chữa bệnh') || q.includes('đơn thuốc') || q.includes('điều trị') || q.includes('kê đơn') || q.includes('uống thế nào để khỏi')) {
            this.appendMsg('ai', '⚠️ Xin lỗi, AINA được lập trình để cung cấp thông tin sản phẩm và <strong>không được phép chẩn đoán, tư vấn điều trị hay kê đơn thuốc</strong> thay cho bác sĩ. Vui lòng đến cơ sở y tế gần nhất hoặc liên hệ dược sĩ chuyên môn để được tư vấn chính xác.');
            return;
        }

        // 2. Search for pain relievers
        if (q.includes('đau đầu') || q.includes('giảm đau') || q.includes('nhức đầu')) {
            const match = products.find(p => p.name.toLowerCase().includes('panadol') || p.category.includes('Giảm đau'));
            if(match) {
                this.appendMsg('ai', `AINA gợi ý sản phẩm phổ biến mang tính <strong>tham khảo</strong>: <strong>${match.name}</strong> (${App.formatCurrency(match.price)}).<br><br><em>Lưu ý: Xin vui lòng đọc kỹ hướng dẫn sử dụng và tham khảo ý kiến chuyên gia trước khi dùng.</em><br><br><a href="shop-detail.html?id=${match.id}" style="display:inline-block; margin-top:8px; padding:6px 12px; background:#eff6ff; color:#2563eb; border-radius:15px; text-decoration:none; font-weight:600; font-size:0.85rem;">Xem chi tiết sản phẩm</a>`);
                return;
            }
        }

        // 3. Search for vitamins
        if (q.includes('vitamin') || q.includes('đề kháng') || q.includes('miễn dịch')) {
            const matches = products.filter(p => p.name.toLowerCase().includes('vitamin'));
            if(matches.length > 0) {
                this.appendMsg('ai', `Hiện AINA tìm thấy ${matches.length} loại Vitamin trong hệ thống. Nổi bật nhất là <strong>${matches[0].name}</strong> với giá ${App.formatCurrency(matches[0].price)}. Sản phẩm rất tốt để hỗ trợ nâng cao sức đề kháng.<br><br><a href="shop-detail.html?id=${matches[0].id}" style="display:inline-block; margin-top:8px; padding:6px 12px; background:#eff6ff; color:#2563eb; border-radius:15px; text-decoration:none; font-weight:600; font-size:0.85rem;">Xem chi tiết</a>`);
                return;
            }
        }

        // 4. Search for promotions
        if (q.includes('khuyến mãi') || q.includes('giảm giá') || q.includes('sale')) {
            const matches = products.filter(p => p.discount > 0);
            if(matches.length > 0) {
                this.appendMsg('ai', `Tin vui đây! AINA thấy hệ thống đang có ${matches.length} sản phẩm giảm giá cực mạnh. Bạn hãy bấm vào danh mục "Khuyến mãi" trên thanh Menu để xem và săn deal nhé!`);
                return;
            }
        }

        // 5. Fallback logic - Basic product search
        const found = products.find(p => q.includes(p.name.toLowerCase().split(' ')[0])); // Simple match on first word
        if (found) {
             this.appendMsg('ai', `AINA tìm thấy sản phẩm <strong>${found.name}</strong> (${App.formatCurrency(found.price)}) phù hợp với câu hỏi của bạn.<br><br><a href="shop-detail.html?id=${found.id}" style="display:inline-block; margin-top:8px; padding:6px 12px; background:#eff6ff; color:#2563eb; border-radius:15px; text-decoration:none; font-weight:600; font-size:0.85rem;">Xem ngay</a>`);
             return;
        }

        this.appendMsg('ai', 'AINA chưa tìm được thông tin phù hợp cho câu hỏi của bạn trong cơ sở dữ liệu. Để được tư vấn chuyên sâu hơn, bạn vui lòng liên hệ dược sĩ qua số Hotline 1900 1234 nhé!');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ShopAI.init();
});
