// 实验要求：两种对象创建方式（字面量+构造函数）
// 1. 字面量创建图书基础数据
const bookDataLiteral = {
    1: { title: "零基础入门学习Web开发", author: "张三", price: "¥59.00", score: 4.8, category: "科技", img: "./1763863324857.png", desc: "从HTML/CSS到React，实战案例全覆盖" },
    2: { title: "设计思维工具手册", author: "李四", price: "¥45.00", score: 5.0, category: "艺术", img: "./1763863343808.png", desc: "企业创新必备，5大阶段+20+工具" },
    3: { title: "数据分析基础与案例实战", author: "王五", price: "¥68.00", score: 4.7, category: "科技", img: "1763863370334.png", desc: "Python+Pandas+Matplotlib全流程" },
    4: { title: "全球通史：从史前到现代", author: "赵六", price: "¥79.00", score: 4.9, category: "历史", img: "./1763863386112.png", desc: "全球视角，文明兴衰与互动解析" },
    5: { title: "瓦尔登湖", author: "梭罗", price: "¥2.98", score: 5.0, category: "文学", img: "./1763863404234.png", desc: "自然与精神自由的经典之作" }
};

// 2. 构造函数创建图书对象
function Book(id, title, author, price, score, category, img, desc) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.price = price;
    this.score = score;
    this.category = category;
    this.img = img;
    this.desc = desc;
}

// 3. 构造函数创建用户对象（管理登录和购物车）
function User(username, isLogin = false) {
    this.username = username;
    this.isLogin = isLogin;
    this.cart = [];
    this.addToCart = function(book) {
        this.cart.push(book);
    };
    this.removeFromCart = function(bookId) {
        this.cart = this.cart.filter(item => item.id !== bookId);
    };
}

// 实例化用户
const currentUser = new User("guest");

// 整合图书数据为构造函数实例
const bookData = {};
for (let key in bookDataLiteral) {
    const b = bookDataLiteral[key];
    bookData[key] = new Book(key, b.title, b.author, b.price, b.score, b.category, b.img, b.desc);
}

let activeModal = null;
let cart = [];

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 实验要求：至少4种DOM获取元素方法
    const booksList = document.getElementById('booksList'); // 方法1: getElementById
    const filterBtns = document.querySelectorAll('.filter button'); // 方法2: querySelectorAll
    const searchBar = document.querySelector('.search-bar'); // 方法3: querySelector
    const promoCards = document.getElementsByClassName('promo-card'); // 方法4: getElementsByClassName

    // 购物车按钮事件
    document.getElementById('cartBtn').addEventListener('click', () => {
        const cartModal = document.getElementById('cartModal');
        cartModal.classList.add('active');
        activeModal = cartModal;
        document.body.classList.add('modal-open');
        updateCart();
    });

    // 关闭购物车
    document.getElementById('closeCart').addEventListener('click', () => {
        const cartModal = document.getElementById('cartModal');
        cartModal.classList.remove('active');
        activeModal = null;
        document.body.classList.remove('modal-open');
    });

    // 筛选按钮事件
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            filterBooks(filter);
        });
    });

    // 图书卡片点击事件（打开详情）
    document.querySelectorAll('.book-card, .promo-book').forEach(item => {
        item.addEventListener('click', () => {
            const bookId = item.getAttribute('data-book');
            openBookModal(bookId);
        });
    });

    // 轮播图控制
    let currentSlide = 0;
    const slides = document.getElementById('bannerSlides');
    const dots = document.querySelectorAll('.banner-dot');
    function goToSlide(index) {
        currentSlide = index;
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }
    dots.forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });

    // 初始化购物车
    updateCart();

    // 搜索框回车事件
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});

// 智能搜索联想（实验要求：输入关键词实时显示匹配列表）
function showSearchSuggest(keyword) {
    const suggestBox = document.getElementById('searchSuggest');
    const searchType = document.getElementById('searchType').value;
    suggestBox.innerHTML = '';
    
    if (!keyword) {
        suggestBox.classList.remove('active');
        return;
    }

    const suggestions = [];
    const keywordLower = keyword.toLowerCase();
    for (let id in bookData) {
        const book = bookData[id];
        let match = false;
        if (searchType === 'title' && book.title.toLowerCase().includes(keywordLower)) match = true;
        else if (searchType === 'author' && book.author.toLowerCase().includes(keywordLower)) match = true;
        else if (searchType === 'category' && book.category.toLowerCase().includes(keywordLower)) match = true;
        else if (searchType === 'all' && (book.title.toLowerCase().includes(keywordLower) || book.author.toLowerCase().includes(keywordLower) || book.category.toLowerCase().includes(keywordLower))) match = true;

        if (match) suggestions.push(book.title);
    }

    if (suggestions.length > 0) {
        suggestions.forEach(item => {
            const suggestItem = document.createElement('div');
            suggestItem.className = 'suggest-item';
            suggestItem.innerText = item;
            suggestItem.onclick = function() {
                document.getElementById('searchInput').value = item;
                suggestBox.classList.remove('active');
                performSearch();
            };
            suggestBox.appendChild(suggestItem);
        });
        suggestBox.classList.add('active');
    } else {
        suggestBox.classList.remove('active');
    }
}

// 隐藏搜索联想
function hideSearchSuggest() {
    setTimeout(() => document.getElementById('searchSuggest').classList.remove('active'), 200);
}

// 执行搜索（实验要求：支持按书名/作者/分类筛选）
function performSearch() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim().toLowerCase();
    const resultsEl = document.getElementById('searchResults');
    const keywordEl = document.getElementById('searchKeyword');
    const countEl = document.getElementById('resultCount');
    const searchType = document.getElementById('searchType').value;
    
    if (!keyword) {
        resultsEl.classList.remove('active');
        return;
    }
    
    let count = 0;
    for (let id in bookData) {
        const book = bookData[id];
        let isMatch = false;
        if (searchType === 'title' && book.title.toLowerCase().includes(keyword)) isMatch = true;
        else if (searchType === 'author' && book.author.toLowerCase().includes(keyword)) isMatch = true;
        else if (searchType === 'category' && book.category.toLowerCase().includes(keyword)) isMatch = true;
        else if (searchType === 'all' && (book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword) || book.category.toLowerCase().includes(keyword))) isMatch = true;
        if (isMatch) count++;
    }
    
    keywordEl.textContent = keyword;
    countEl.textContent = count;
    resultsEl.classList.add('active');
}

// 筛选图书
function filterBooks(filter) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';
    if (filter === 'all') {
        for (let id in bookData) {
            renderBookCard(id);
        }
        return;
    }
    for (let id in bookData) {
        if (bookData[id].category === filter) {
            renderBookCard(id);
        }
    }
}

// 渲染图书卡片（DOM节点动态创建/添加，实验要求）
function renderBookCard(bookId) {
    const book = bookData[bookId];
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.setAttribute('data-book', bookId);
    bookCard.innerHTML = `
        <div class="card-front">
            <div class="book-img">
                <img src="${book.img}" alt="${book.title}">
            </div>
            <div class="book-info">
                <h4>${book.title}</h4>
                <span class="price">${book.price}</span>
            </div>
        </div>
        <div class="card-back">
            <h4>${book.title}</h4>
            <p>作者：${book.author}</p>
            <p>评分：★★★★☆（${book.score}）</p>
            <p>分类：${book.category}</p>
            <button class="buy-btn" onclick="addToCart('${bookId}')">加入购物车</button>
        </div>
    `;
    document.getElementById('booksList').appendChild(bookCard);
    bookCard.addEventListener('click', () => openBookModal(bookId));
}

// 登录表单验证（实验要求：正则验证用户名格式+密码强度+提交前检查）
function verifyAccount() {
    const account = document.getElementById('login-account').value;
    const tip = document.getElementById('accountTip');
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 邮箱正则
    const phoneReg = /^1[3-9]\d{9}$/; // 手机号正则

    if (!account) {
        tip.innerText = '请输入账号';
        tip.className = 'verify-tip tip-error';
        return false;
    } else if (emailReg.test(account) || phoneReg.test(account)) {
        tip.innerText = '账号格式正确';
        tip.className = 'verify-tip tip-success';
        return true;
    } else {
        tip.innerText = '请输入正确的邮箱或手机号';
        tip.className = 'verify-tip tip-error';
        return false;
    }
}

// 密码强度检测（实验要求：弱/中/强分级提示）
function checkPwdStrength(pwd) {
    const strengthItems = document.querySelectorAll('.strength-item');
    const strengthText = document.querySelector('.strength-text');
    strengthItems.forEach(item => item.className = 'strength-item');
    
    if (pwd.length < 6) {
        strengthText.innerText = '密码强度';
        return;
    }

    let strength = 0;
    if (pwd.length >= 8) strength++; // 长度加分
    if (/[A-Za-z]/.test(pwd) && /\d/.test(pwd)) strength++; // 字母+数字加分
    if (/[^A-Za-z0-9]/.test(pwd)) strength++; // 特殊字符加分

    if (strength >= 1) strengthItems[0].classList.add('strength-weak');
    if (strength >= 2) strengthItems[1].classList.add('strength-middle');
    if (strength >= 3) strengthItems[2].classList.add('strength-strong');
    
    strengthText.innerText = strength === 1 ? '弱' : strength === 2 ? '中' : '强';
}

// 登录表单提交验证（实验要求：提交前完整性检查）
function validateLoginForm() {
    const isAccountValid = verifyAccount();
    const pwd = document.getElementById('login-pwd').value;

    if (!isAccountValid) {
        alert('请输入正确的邮箱或手机号格式！');
        return false;
    }
    if (pwd.length < 6) {
        alert('密码长度不能少于6位！');
        return false;
    }

    currentUser.isLogin = true;
    alert(`登录成功！欢迎您，${document.getElementById('login-account').value}`);
    closeLoginForm();
    return false;
}

// 模态框控制
function openLoginForm() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    activeModal = modal;
    document.body.classList.add('modal-open');
}

function closeLoginForm() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    activeModal = null;
    document.body.classList.remove('modal-open');
}

function openRegisterForm() {
    closeLoginForm();
    const modal = document.getElementById('registerModal');
    modal.classList.add('active');
    activeModal = modal;
    document.body.classList.add('modal-open');
}

function closeRegisterForm() {
    const modal = document.getElementById('registerModal');
    modal.classList.remove('active');
    activeModal = null;
    document.body.classList.remove('modal-open');
}

function openBookModal(bookId) {
    const modal = document.getElementById('bookModal');
    const detailContainer = document.getElementById('bookDetail');
    const book = bookData[bookId];
    if (book) {
        detailContainer.innerHTML = `
            <div class="detail-img">
                <img src="${book.img}" alt="${book.title}">
            </div>
            <div class="detail-info">
                <h2>${book.title}</h2>
                <span class="author">作者：${book.author}</span>
                <span class="price">${book.price}</span>
                <p class="desc">${book.desc}</p>
                <button class="buy-btn" onclick="addToCart('${bookId}')">加入购物车</button>
            </div>
        `;
        modal.classList.add('active');
        activeModal = modal;
        document.body.classList.add('modal-open');
    }
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    activeModal = null;
    document.body.classList.remove('modal-open');
}

// 购物车操作
function addToCart(bookId) {
    const book = bookData[bookId];
    if (book) {
        const existingItem = cart.find(item => item.id === bookId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: bookId,
                title: book.title,
                price: book.price,
                img: book.img,
                quantity: 1
            });
        }
        currentUser.addToCart(book);
        updateCart();
        closeBookModal();
        alert(`《${book.title}》已添加到购物车！`);
    }
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    currentUser.removeFromCart(bookId);
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">购物车是空的，快去添加图书吧~</div>';
        cartTotal.innerHTML = '<span>总计：</span><span>¥0.00</span>';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('¥', ''));
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">${item.price} × ${item.quantity}</div>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart('${item.id}')">×</div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.innerHTML = `<span>总计：</span><span>¥${total.toFixed(2)}</span>`;
}

// 全局键盘事件（ESC关闭模态框）
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
        activeModal.classList.remove('active');
        activeModal = null;
        document.body.classList.remove('modal-open');
    }
});

// 点击模态框背景关闭
document.querySelectorAll('.modal, .cart-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            activeModal = null;
        }
    });
});

// 移动端拖拽注册模态框（实验要求：JavaScript增强体验）
(function() {
    const registerModal = document.getElementById('registerModal');
    const modalContent = registerModal.querySelector('.modal-content');
    let startY = 0;
    let moveY = 0;
    let isDragging = false;
    const threshold = 80;

    modalContent.addEventListener('touchstart', (e) => {
        if (registerModal.classList.contains('active')) {
            startY = e.touches[0].clientY;
            isDragging = true;
            modalContent.style.transition = 'none';
        }
    }, { passive: true });

    modalContent.addEventListener('touchmove', (e) => {
        if (isDragging && registerModal.classList.contains('active')) {
            moveY = e.touches[0].clientY - startY;
            if (moveY > 0) {
                modalContent.style.transform = `translateY(${moveY * 0.8}px)`;
                registerModal.style.background = `rgba(0,0,0,${0.5 - moveY / 500})`;
            }
        }
    }, { passive: true });

    modalContent.addEventListener('touchend', () => {
        if (isDragging && registerModal.classList.contains('active')) {
            modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            registerModal.style.transition = 'background 0.3s ease';
            if (moveY >= threshold) {
                closeRegisterForm();
            } else {
                modalContent.style.transform = 'translateY(0)';
                registerModal.style.background = 'rgba(0,0,0,0.5)';
            }
            startY = 0;
            moveY = 0;
            isDragging = false;
        }
    });

    // 桌面端拖拽模拟
    modalContent.addEventListener('mousedown', (e) => {
        if (registerModal.classList.contains('active') && e.target === modalContent) {
            startY = e.clientY;
            isDragging = true;
            modalContent.style.transition = 'none';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && registerModal.classList.contains('active')) {
            moveY = e.clientY - startY;
            if (moveY > 0) {
                modalContent.style.transform = `translateY(${moveY * 0.8}px)`;
                registerModal.style.background = `rgba(0,0,0,${0.5 - moveY / 500})`;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging && registerModal.classList.contains('active')) {
            modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            registerModal.style.transition = 'background 0.3s ease';
            if (moveY >= threshold) {
                closeRegisterForm();
            } else {
                modalContent.style.transform = 'translateY(0)';
                registerModal.style.background = 'rgba(0,0,0,0.5)';
            }
            startY = 0;
            moveY = 0;
            isDragging = false;
        }
    });

    // 阻止表单元素触发拖拽
    modalContent.querySelectorAll('input, select, textarea, button').forEach(el => {
        el.addEventListener('touchstart', (e) => {
            isDragging = false;
        });
        el.addEventListener('mousedown', (e) => {
            isDragging = false;
        });
    });
})();
