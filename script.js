// Data Storage (Simulating Database)
let products = [
    {
        id: 1,
        name: "Fresh Tomatoes",
        category: "Fruits & Vegetables",
        description: "Fresh organic tomatoes, perfect for salads and cooking",
        price: 45.00,
        stock: 50,
        image: "🍅"
    },
    {
        id: 2,
        name: "Milk (1L)",
        category: "Dairy & Eggs",
        description: "Fresh pasteurized milk, daily delivery",
        price: 60.00,
        stock: 30,
        image: "🥛"
    },
    {
        id: 3,
        name: "Whole Wheat Bread",
        category: "Bakery",
        description: "Freshly baked whole wheat bread",
        price: 35.00,
        stock: 25,
        image: "🍞"
    },
    {
        id: 4,
        name: "Orange Juice",
        category: "Beverages",
        description: "100% pure orange juice, no added sugar",
        price: 120.00,
        stock: 20,
        image: "🧃"
    },
    {
        id: 5,
        name: "Banana",
        category: "Fruits & Vegetables",
        description: "Fresh yellow bananas, rich in potassium",
        price: 40.00,
        stock: 60,
        image: "🍌"
    },
    {
        id: 6,
        name: "Potato Chips",
        category: "Snacks",
        description: "Crispy salted potato chips",
        price: 25.00,
        stock: 40,
        image: "🥔"
    },
    {
        id: 7,
        name: "Basmati Rice (1kg)",
        category: "Pantry",
        description: "Premium quality basmati rice",
        price: 150.00,
        stock: 35,
        image: "🍚"
    },
    {
        id: 8,
        name: "Fresh Eggs (12)",
        category: "Dairy & Eggs",
        description: "Farm fresh eggs, dozen pack",
        price: 75.00,
        stock: 45,
        image: "🥚"
    },
    {
        id: 9,
        name: "Green Apples",
        category: "Fruits & Vegetables",
        description: "Crispy green apples, great for snacking",
        price: 180.00,
        stock: 30,
        image: "🍏"
    },
    {
        id: 10,
        name: "Cheddar Cheese",
        category: "Dairy & Eggs",
        description: "Aged cheddar cheese, 200g pack",
        price: 200.00,
        stock: 15,
        image: "🧀"
    },
    {
        id: 11,
        name: "Coffee Beans",
        category: "Beverages",
        description: "Arabica coffee beans, 250g",
        price: 350.00,
        stock: 20,
        image: "☕"
    },
    {
        id: 12,
        name: "Chocolate Bar",
        category: "Snacks",
        description: "Premium dark chocolate bar",
        price: 80.00,
        stock: 50,
        image: "🍫"
    }
];

let users = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@bluebird.com",
        password: "admin123",
        phone: "1234567890",
        address: "Admin Office",
        role: "admin"
    }
];

let orders = [];
let cart = [];
let currentUser = null;
let isAuthMode = 'login'; // 'login' or 'signup'
let editingProductId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderProducts();
    populateCategoryFilter();
    setupEventListeners();
    updateCartCount();
    setMinDate();
});

// Load data from localStorage
function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('bluebird_products');
    const savedUsers = localStorage.getItem('bluebird_users');
    const savedOrders = localStorage.getItem('bluebird_orders');
    const savedCart = localStorage.getItem('bluebird_cart');
    const savedUser = localStorage.getItem('bluebird_currentUser');

    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedOrders) orders = JSON.parse(savedOrders);
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('bluebird_products', JSON.stringify(products));
    localStorage.setItem('bluebird_users', JSON.stringify(users));
    localStorage.setItem('bluebird_orders', JSON.stringify(orders));
    localStorage.setItem('bluebird_cart', JSON.stringify(cart));
    if (currentUser) {
        localStorage.setItem('bluebird_currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('bluebird_currentUser');
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page);
        });
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', openCart);

    // Auth button
    document.getElementById('authBtn').addEventListener('click', function() {
        if (currentUser) {
            logout();
        } else {
            openAuth();
        }
    });

    // Admin button
    document.getElementById('adminBtn').addEventListener('click', openAdmin);

    // Search
    document.getElementById('searchInput').addEventListener('input', filterProducts);

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Auth form
    document.getElementById('authForm').addEventListener('submit', handleAuth);

    // Toggle auth mode
    document.getElementById('toggleLink').addEventListener('click', function(e) {
        e.preventDefault();
        toggleAuthMode();
    });

    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchAdminTab(tab);
        });
    });
}

// Page Navigation
function showPage(pageName) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Show page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName + 'Page').classList.add('active');

    // Load page-specific content
    if (pageName === 'orders') {
        loadUserOrders();
    }
}

// Products
function renderProducts(productsToRender = products) {
    const grid = document.getElementById('productsGrid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }

    grid.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image}
                <span class="product-stock ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}">
                    ${product.stock} in stock
                </span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function populateCategoryFilter() {
    const categories = [...new Set(products.map(p => p.category))];
    const select = document.getElementById('categoryFilter');
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    let filtered = products;

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    renderProducts(filtered);
}

// Cart Functions
function addToCart(productId) {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'warning');
        openAuth();
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showNotification('Cart updated successfully!', 'success');
        } else {
            showNotification('Maximum stock reached', 'warning');
        }
    } else {
        cart.push({
            productId: productId,
            quantity: 1,
            price: product.price
        });
        showNotification('Product added to cart!', 'success');
    }

    updateCartCount();
    saveToLocalStorage();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function openCart() {
    if (!currentUser) {
        showNotification('Please login to view cart', 'warning');
        openAuth();
        return;
    }

    renderCart();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        updateCartSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `
            <div class="cart-item">
                <div class="cart-item-image">${product.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">₹${product.price.toFixed(2)} each</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, -1)">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    updateCartSummary();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.productId === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (item.quantity > product.stock) {
        item.quantity = product.stock;
        showNotification('Maximum stock reached', 'warning');
    }

    renderCart();
    updateCartCount();
    saveToLocalStorage();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    renderCart();
    updateCartCount();
    saveToLocalStorage();
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    document.getElementById('cartSubtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('cartTax').textContent = '₹' + tax.toFixed(2);
    document.getElementById('cartTotal').textContent = '₹' + total.toFixed(2);
}

// Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function setMinDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('pickupDate').min = dateStr;
}

function placeOrder() {
    const pickupDate = document.getElementById('pickupDate').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const instructions = document.getElementById('specialInstructions').value;

    if (!pickupDate || !pickupTime) {
        showNotification('Please select pickup date and time', 'warning');
        return;
    }

    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const order = {
        id: orders.length + 1,
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        items: cart.map(item => ({
            ...item,
            productName: products.find(p => p.id === item.productId).name
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'pending',
        pickupDate: pickupDate,
        pickupTime: pickupTime,
        instructions: instructions,
        orderDate: new Date().toISOString()
    };

    orders.push(order);

    // Update product stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    cart = [];
    updateCartCount();
    saveToLocalStorage();

    closeCheckout();
    showNotification('Order placed successfully! Order ID: #' + order.id, 'success');
    
    // Clear form
    document.getElementById('pickupDate').value = '';
    document.getElementById('pickupTime').value = '';
    document.getElementById('specialInstructions').value = '';

    // Show orders page
    showPage('orders');
}

// Orders
function loadUserOrders() {
    const container = document.getElementById('ordersContent');

    if (!currentUser) {
        container.innerHTML = '<p class="empty-state">Please login to view your orders.</p>';
        return;
    }

    const userOrders = orders.filter(o => o.userId === currentUser.id);

    if (userOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">You have no orders yet.</p>';
        return;
    }

    container.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${new Date(order.orderDate).toLocaleDateString()}
                    </div>
                </div>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.productName} × ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div>
                    <strong>Pickup:</strong> ${order.pickupDate} at ${order.pickupTime}
                </div>
                <div class="order-total">₹${order.total.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

// Authentication
function openAuth() {
    isAuthMode = 'login';
    updateAuthForm();
    document.getElementById('authModal').classList.add('active');
}

function closeAuth() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('authForm').reset();
}

function toggleAuthMode() {
    isAuthMode = isAuthMode === 'login' ? 'signup' : 'login';
    updateAuthForm();
}

function updateAuthForm() {
    const isSignup = isAuthMode === 'signup';
    
    document.getElementById('authTitle').textContent = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('authBtnText').textContent = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('toggleText').innerHTML = isSignup 
        ? 'Already have an account? <a href="#" id="toggleLink">Login</a>'
        : 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>';
    
    document.getElementById('nameGroup').style.display = isSignup ? 'block' : 'none';
    document.getElementById('phoneGroup').style.display = isSignup ? 'block' : 'none';
    document.getElementById('addressGroup').style.display = isSignup ? 'block' : 'none';
    
    // Re-attach event listener to new toggle link
    document.getElementById('toggleLink').addEventListener('click', function(e) {
        e.preventDefault();
        toggleAuthMode();
    });
}

function handleAuth(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isAuthMode === 'login') {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            saveToLocalStorage();
            updateAuthUI();
            closeAuth();
            showNotification('Welcome back, ' + user.name + '!', 'success');
        } else {
            showNotification('Invalid email or password', 'error');
        }
    } else {
        const name = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (users.find(u => u.email === email)) {
            showNotification('Email already registered', 'error');
            return;
        }

        const newUser = {
            id: users.length + 1,
            name: name,
            email: email,
            password: password,
            phone: phone,
            address: address,
            role: 'customer'
        };

        users.push(newUser);
        currentUser = newUser;
        saveToLocalStorage();
        updateAuthUI();
        closeAuth();
        showNotification('Account created successfully!', 'success');
    }

    document.getElementById('authForm').reset();
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (currentUser) {
        authBtn.textContent = 'Logout';
        authBtn.classList.remove('btn-primary');
        authBtn.classList.add('btn-secondary');

        if (currentUser.role === 'admin') {
            adminBtn.style.display = 'block';
        }
    } else {
        authBtn.textContent = 'Login';
        authBtn.classList.remove('btn-secondary');
        authBtn.classList.add('btn-primary');
        adminBtn.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    cart = [];
    updateCartCount();
    saveToLocalStorage();
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
    showPage('home');
}

// Admin Dashboard
function openAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }

    loadAdminData();
    document.getElementById('adminModal').classList.add('active');
}

function closeAdmin() {
    document.getElementById('adminModal').classList.remove('active');
}

function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Show tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Load tab data
    if (tabName === 'products') {
        loadAdminProducts();
    } else if (tabName === 'orders') {
        loadAdminOrders();
    } else if (tabName === 'reports') {
        loadAdminReports();
    }
}

function loadAdminData() {
    loadAdminProducts();
}

function loadAdminProducts() {
    const tbody = document.getElementById('adminProductsTable');
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="action-btn" onclick="editProduct(${product.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct(${product.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersTable');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customerName}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>
                <select class="filter-select" onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 0.5rem;">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="packing" ${order.status === 'packing' ? 'selected' : ''}>Packing</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>${order.pickupDate}<br>${order.pickupTime}</td>
            <td>
                <button class="action-btn" onclick="viewOrderDetails(${order.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadAdminReports() {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toFixed(2);
    document.getElementById('totalCustomers').textContent = uniqueCustomers;
    document.getElementById('totalProducts').textContent = products.length;
}

function showAddProduct() {
    editingProductId = null;
    document.getElementById('productFormTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productFormModal').classList.add('active');
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('active');
    editingProductId = null;
}

function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: getEmojiForCategory(document.getElementById('productCategory').value)
    };

    if (editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        Object.assign(product, productData);
        showNotification('Product updated successfully!', 'success');
    } else {
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...productData
        };
        products.push(newProduct);
        showNotification('Product added successfully!', 'success');
    }

    saveToLocalStorage();
    loadAdminProducts();
    renderProducts();
    closeProductForm();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;

    document.getElementById('productFormModal').classList.add('active');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        loadAdminProducts();
        renderProducts();
        showNotification('Product deleted successfully!', 'success');
    }
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveToLocalStorage();
        showNotification('Order status updated!', 'success');
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const details = `
Order ID: #${order.id}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Order Date: ${new Date(order.orderDate).toLocaleString()}
Pickup: ${order.pickupDate} at ${order.pickupTime}
Status: ${order.status.toUpperCase()}

Items:
${order.items.map(item => `- ${item.productName} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: ₹${order.subtotal.toFixed(2)}
Tax: ₹${order.tax.toFixed(2)}
Total: ₹${order.total.toFixed(2)}

${order.instructions ? 'Instructions: ' + order.instructions : ''}
    `;

    alert(details);
}

function getEmojiForCategory(category) {
    const emojis = {
        'Fruits & Vegetables': '🥬',
        'Dairy & Eggs': '🥛',
        'Bakery': '🍞',
        'Beverages': '🥤',
        'Snacks': '🍪',
        'Pantry': '🥫'
    };
    return emojis[category] || '📦';
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success-color)' : 
                     type === 'error' ? 'var(--danger-color)' : 
                     type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
