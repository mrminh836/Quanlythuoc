const Shop = {
    allProducts: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 12,

    init: function() {
        this.allProducts = Storage.get('products') || [];
        this.filteredProducts = [...this.allProducts];
        
        this.renderCategories();
        this.renderBrands();
        this.bindEvents();
        this.renderProducts();
        this.initSlider();
        this.loadNews();
    },

    initSlider: function() {
        const slides = document.querySelectorAll('.hero-slide');
        const dotsContainer = document.getElementById('hero-dots');
        if(!slides.length || !dotsContainer) return;
        
        let currentSlide = 0;
        
        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.hero-dot');
        
        const goToSlide = (n) => {
            slides[currentSlide].style.display = 'none';
            dots[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].style.display = 'flex';
            dots[currentSlide].classList.add('active');
        };

        setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 4000); // Tự động trượt sau 4 giây
    },

    loadNews: async function() {
        const track = document.getElementById('news-marquee-track');
        if(!track) return;
        
        try {
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://vnexpress.net/rss/suc-khoe.rss');
            const data = await response.json();
            
            if (data && data.items && data.items.length > 0) {
                let html = '';
                const items = data.items.slice(0, 6);
                
                const renderItems = () => {
                    items.forEach(item => {
                        let imgSrc = item.thumbnail;
                        if (!imgSrc) {
                            const imgMatch = item.description.match(/src="([^"]+)"/);
                            if (imgMatch) imgSrc = imgMatch[1];
                        }
                        if (!imgSrc) imgSrc = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop';

                        // Parse the date (yyyy-mm-dd format in rss2json)
                        let dateStr = 'Mới nhất';
                        if (item.pubDate) {
                            const d = new Date(item.pubDate);
                            dateStr = d.toLocaleDateString('vi-VN');
                        }
                        
                        const div = document.createElement('div');
                        div.innerHTML = item.description;
                        const text = div.textContent || div.innerText || "";
                        
                        html += `
                            <a href="${item.link}" target="_blank" class="news-card">
                                <img src="${imgSrc}" alt="${item.title.replace(/"/g, '&quot;')}">
                                <div class="news-card-body">
                                    <div class="news-date">${dateStr}</div>
                                    <div class="news-title">${item.title}</div>
                                    <div class="news-summary">${text.substring(0, 100)}...</div>
                                </div>
                            </a>
                        `;
                    });
                };
                
                renderItems();
                renderItems(); // Duplicate for marquee
                
                track.innerHTML = html;
            } else {
                track.innerHTML = '<div style="padding: 2rem;">Không tải được tin tức.</div>';
            }
        } catch (error) {
            console.error('Lỗi khi tải tin tức:', error);
            track.innerHTML = '<div style="padding: 2rem;">Không tải được tin tức.</div>';
        }
    },

    bindEvents: function() {
        // Sort
        document.getElementById('sort-select').addEventListener('change', () => {
            this.applySortAndFilter();
        });

        // Search (autocomplete & enter)
        const searchInput = document.getElementById('shop-search-input');
        const searchDropdown = document.getElementById('search-dropdown');
        if(searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    if(searchDropdown) searchDropdown.style.display = 'none';
                    this.applySortAndFilter();
                }
            });

            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                if(!term) {
                    if(searchDropdown) searchDropdown.style.display = 'none';
                    return;
                }

                // Tìm kiếm sản phẩm
                let matches = this.allProducts.filter(p => 
                    p.name.toLowerCase().includes(term) || 
                    (p.activeIngredient && p.activeIngredient.toLowerCase().includes(term))
                );

                // Ưu tiên các sản phẩm có tên bắt đầu bằng từ khóa lên đầu
                matches.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    
                    const aStartsWith = aName.startsWith(term);
                    const bStartsWith = bName.startsWith(term);
                    
                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;
                    
                    // Nếu cùng (hoặc không cùng) bắt đầu bằng từ khóa, ưu tiên sản phẩm có từ khóa trong TÊN thay vì HOẠT CHẤT
                    const aHasInName = aName.includes(term);
                    const bHasInName = bName.includes(term);
                    
                    if (aHasInName && !bHasInName) return -1;
                    if (!aHasInName && bHasInName) return 1;
                    
                    return 0;
                });

                matches = matches.slice(0, 5); // Lấy tối đa 5 kết quả

                if (matches.length > 0) {
                    let html = '';
                    matches.forEach(p => {
                        const imgSrc = p.imageUrl || p.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECh%C6%B0a%20c%C3%B3%20%E1%BA%A3nh%3C%2Ftext%3E%3C%2Fsvg%3E';
                        html += `
                            <a href="shop-detail.html?id=${p.id}" class="search-dropdown-item">
                                <img src="${imgSrc}" class="search-dropdown-img" alt="${p.name}">
                                <div class="search-dropdown-info">
                                    <div class="search-dropdown-name">${p.name}</div>
                                    <div class="search-dropdown-price">${App.formatCurrency(p.price)}</div>
                                </div>
                            </a>
                        `;
                    });
                    if(searchDropdown) {
                        searchDropdown.innerHTML = html;
                        searchDropdown.style.display = 'block';
                    }
                } else {
                    if(searchDropdown) {
                        searchDropdown.innerHTML = '<div style="padding: 15px; color: #6b7280; text-align: center; font-size: 0.9rem;">Không tìm thấy sản phẩm phù hợp</div>';
                        searchDropdown.style.display = 'block';
                    }
                }
            });
            
            // Ẩn dropdown khi click ra ngoài
            document.addEventListener('click', (e) => {
                if(searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                    searchDropdown.style.display = 'none';
                }
            });
        }

        // Radios and Checkboxes
        document.querySelectorAll('input[name="price"], input[name="rating"]').forEach(el => {
            el.addEventListener('change', () => this.applySortAndFilter());
        });
    },

    renderCategories: function() {
        const cats = ['Thuốc', 'Thực phẩm bảo vệ sức khỏe', 'Vitamin & khoáng chất', 'Chăm sóc cá nhân', 'Thiết bị y tế', 'Dược mỹ phẩm', 'Mẹ & bé', 'Chăm sóc răng miệng'];
        const nav = document.getElementById('category-nav');
        let html = '<li class="shop-nav-item" onclick="Shop.filterCategory(\'all\')">Tất cả</li>';
        cats.forEach(c => {
            html += `<li class="shop-nav-item" onclick="Shop.filterCategory('${c}')">${c}</li>`;
        });
        if(nav) nav.innerHTML = html;
    },

    renderBrands: function() {
        // Lấy danh sách thương hiệu duy nhất từ products
        const brands = [...new Set(this.allProducts.map(p => p.brand))].filter(b => b);
        const container = document.getElementById('brand-filters');
        if(!container) return;
        
        let html = '';
        brands.forEach(b => {
            html += `<label class="filter-label"><input type="checkbox" class="brand-cb" value="${b}"> ${b}</label>`;
        });
        container.innerHTML = html;

        document.querySelectorAll('.brand-cb').forEach(el => {
            el.addEventListener('change', () => this.applySortAndFilter());
        });
    },

    filterCategory: function(cat) {
        // Reset search
        document.getElementById('shop-search-input').value = '';
        if (cat === 'all') {
            this.currentCategory = null;
        } else {
            this.currentCategory = cat;
        }
        this.applySortAndFilter();

        // Tự động trượt xuống phần sản phẩm
        const gridSection = document.querySelector('.shop-layout-grid');
        if (gridSection) {
            window.scrollTo({
                top: gridSection.offsetTop - 80, // Cách top 80px để không bị che
                behavior: 'smooth'
            });
        }
    },

    search: function() {
        this.applySortAndFilter();
    },

    applySortAndFilter: function() {
        let result = [...this.allProducts];

        // 1. Search filter
        const searchTerm = document.getElementById('shop-search-input').value.toLowerCase();
        if (searchTerm) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                (p.activeIngredient && p.activeIngredient.toLowerCase().includes(searchTerm))
            );
        }

        // 2. Category filter
        if (this.currentCategory) {
            result = result.filter(p => p.category === this.currentCategory);
        }

        // 3. Price filter
        const priceVal = document.querySelector('input[name="price"]:checked')?.value || 'all';
        if(priceVal !== 'all') {
            result = result.filter(p => {
                if(priceVal === 'under100') return p.price < 100000;
                if(priceVal === '100-300') return p.price >= 100000 && p.price <= 300000;
                if(priceVal === '300-500') return p.price > 300000 && p.price <= 500000;
                if(priceVal === 'over500') return p.price > 500000;
                return true;
            });
        }

        // 4. Rating filter
        const ratingVal = document.querySelector('input[name="rating"]:checked')?.value || 'all';
        if(ratingVal !== 'all') {
            const minRating = parseFloat(ratingVal);
            result = result.filter(p => parseFloat(p.rating || 0) >= minRating);
        }

        // 5. Brand filter
        const checkedBrands = Array.from(document.querySelectorAll('.brand-cb:checked')).map(cb => cb.value);
        if(checkedBrands.length > 0) {
            result = result.filter(p => checkedBrands.includes(p.brand));
        }

        // 6. Sort
        const sortVal = document.getElementById('sort-select').value;
        if (sortVal === 'price-asc') result.sort((a,b) => a.price - b.price);
        if (sortVal === 'price-desc') result.sort((a,b) => b.price - a.price);
        if (sortVal === 'bestseller') result.sort((a,b) => (b.sold || 0) - (a.sold || 0));
        if (sortVal === 'rating') result.sort((a,b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

        this.filteredProducts = result;
        this.currentPage = 1;
        this.renderProducts();
    },

    renderProducts: function() {
        const grid = document.getElementById('product-grid');
        if(!grid) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--shop-text-muted);">Không tìm thấy sản phẩm nào phù hợp.</div>`;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        // Pagination logic
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paginated = this.filteredProducts.slice(start, start + this.itemsPerPage);

        let html = '';
        paginated.forEach(p => {
            const discountTag = p.discount > 0 ? `<div class="product-badge">-${p.discount}%</div>` : '';
            const oldPriceHtml = p.discount > 0 ? `<span class="product-old-price">${App.formatCurrency(p.oldPrice)}</span>` : '';
            
            // Stock logic
            let stockHtml = '';
            let btnDisabled = '';
            if (p.stock === 0) {
                stockHtml = `<div style="color: #ef4444; font-size: 0.75rem; margin-bottom: 4px;">Hết hàng</div>`;
                btnDisabled = 'disabled';
            } else if (p.stock <= p.minStock) {
                stockHtml = `<div style="color: #f59e0b; font-size: 0.75rem; margin-bottom: 4px;">Chỉ còn ${p.stock} sp</div>`;
            }

            const imgSrc = p.imageUrl || p.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECh%C6%B0a%20c%C3%B3%20%E1%BA%A3nh%3C%2Ftext%3E%3C%2Fsvg%3E';
            html += `
                <div class="product-card">
                    ${discountTag}
                    <img src="${imgSrc}" alt="${p.name}" class="product-image" onclick="location.href='shop-detail.html?id=${p.id}'" style="cursor:pointer; object-fit: cover;">
                    <div class="product-brand">${p.brand || 'Khác'}</div>
                    <div class="product-name" title="${p.name}" onclick="location.href='shop-detail.html?id=${p.id}'" style="cursor:pointer;">${p.name}</div>
                    
                    <div class="product-rating">
                        ★★★★★ <span style="color:var(--shop-text-muted); font-size: 0.75rem;">${p.rating || '5.0'}</span>
                        <span class="product-sold">| Đã bán ${p.sold || 0}</span>
                    </div>

                    ${stockHtml}

                    <div class="product-price-row">
                        <span class="product-price">${App.formatCurrency(p.price)}</span>
                        ${oldPriceHtml}
                    </div>

                    <div class="product-actions">
                        <button class="btn-add-cart" ${btnDisabled} onclick="Cart.add('${p.id}', 1, event)">
                            ${p.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                        <button class="btn-wishlist" onclick="Wishlist.toggle('${p.id}', this)"><i class="fa-solid fa-heart"></i></button>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        this.renderPagination();
    },

    renderPagination: function() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        if(!container) return;
        
        if(totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        for(let i = 1; i <= totalPages; i++) {
            html += `<button onclick="Shop.goToPage(${i})" style="padding: 6px 12px; border: 1px solid var(--shop-border); background: ${this.currentPage === i ? 'var(--shop-primary)' : 'white'}; color: ${this.currentPage === i ? 'white' : 'black'}; border-radius: 4px; cursor: pointer;">${i}</button>`;
        }
        container.innerHTML = html;
    },

    goToPage: function(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: document.querySelector('.shop-layout-grid').offsetTop - 100, behavior: 'smooth' });
    }
};
