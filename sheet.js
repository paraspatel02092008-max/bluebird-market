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
let isAuthMode = 'login';
let editingProductId = null;

// Google Sheets API URLs
const GOOGLE_SHEET_ORDERS_API = "https://script.google.com/macros/s/AKfycbykre9gCeiJAFYZ-otFvsWXyTm6KuSUoDjO-DRuXJCBT641fa2IQMLFFISqbHl5KsvNAg/exec";
const GOOGLE_SHEET_ADMIN_API = "https://script.google.com/macros/s/AKfycbwqX7OEsQtTE-nGfIGMwPM2BZdseileiQzTJVOhNoi6tPsvSl2j_5n5qXxhMFxWcbfqOw/exec";

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

// Send order to Google Sheet
function sendOrderToGoogleSheet(order) {
    const sheetData = {
        action: 'addOrder',
        orderId: order.id,
        product: order.items.map(i => i.productName).join(", "),
        price: order.total.toFixed(2),
        quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
        customer: order.customerName,
        email: order.customerEmail,
        phone: currentUser.phone || 'N/A',
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        status: order.status,
        orderDate: new Date(order.orderDate).toLocaleString(),
        instructions: order.instructions || 'None'
    };

    fetch(GOOGLE_SHEET_ORDERS_API, {
        method: "POST",
        mode: "no-cors",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sheetData)
    })
    .then(() => {
        console.log("Order saved to Google Sheet successfully");
        showNotification('Order saved to database!', 'success');
    })
    .catch(err => {
        console.error("Google Sheet error:", err);
        showNotification('Order placed but database sync failed', 'warning');
    });
}

// Fetch orders from Google Sheet for Admin Dashboard
async function fetchOrdersFromGoogleSheet() {
    try {
        const response = await fetch(`${GOOGLE_SHEET_ADMIN_API}?action=getOrders`);
        const data = await response.json();
        
        if (data.status === 'success' && data.orders) {
            // Update local orders with Google Sheet data
            const sheetOrders = data.orders.map(order => ({
                id: order.orderId,
                userId: order.userId || 0,
                customerName: order.customer,
                customerEmail: order.email,
                items: [],
                subtotal: parseFloat(order.price) / 1.05, // Remove tax
                tax: parseFloat(order.price) * 0.05 / 1.05,
                total: parseFloat(order.price),
                status: order.status,
                pickupDate: order.pickupDate,
                pickupTime: order.pickupTime,
                instructions: order.instructions,
                orderDate: order.orderDate
            }));
            
            return sheetOrders;
        }
        return orders; // Return local orders if fetch fails
    } catch (err) {
        console.error("Error fetching orders from Google Sheet:", err);
        return orders; // Return local orders if fetch fails
    }
}

// Update order status in Google Sheet
function updateOrderStatusInSheet(orderId, newStatus) {
    const sheetData = {
        action: 'updateStatus',
        orderId: orderId,
        status: newStatus
    };

    fetch(GOOGLE_SHEET_ADMIN_API, {
        method: "POST",
        mode: "no-cors",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sheetData)
    })
    .then(() => {
        console.log("Order status updated in Google Sheet");
    })
    .catch(err => {
        console.error("Google Sheet update error:", err);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // Search and Filter
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Cart Button
    document.getElementById('cartBtn').addEventListener('click', openCart);

    // Auth Button
    document.getElementById('authBtn').addEventListener('click', openAuth);

    // Admin Button
    document.getElementById('adminBtn').addEventListener('click', openAdmin);

    // Auth Form
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);

    // Product Form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Admin Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchAdminTab(this.getAttribute('data-tab'));
        });
    });
}

// Show Page
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(pageName + 'Page').classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    if (pageName === 'orders') {
        renderOrders();
    }
}

// Render Products
function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <div class="product-stock ${product.stock <= 5 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}">
                    ${product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                </div>
                <span style="font-size: 4rem;">${product.image}</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate Category Filter
function populateCategoryFilter() {
    const categories = [...new Set(products.map(p => p.category))];
    const filter = document.getElementById('categoryFilter');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

// Filter Products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
}

// Add to Cart
function addToCart(productId) {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'warning');
        openAuth();
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) {
        showNotification('Product out of stock', 'warning');
        return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showNotification('Item quantity updated', 'success');
        } else {
            showNotification('Cannot add more than available stock', 'warning');
            return;
        }
    } else {
        cart.push({
            productId: productId,
            quantity: 1
        });
        showNotification('Item added to cart', 'success');
    }

    updateCartCount();
    saveToLocalStorage();
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Open Cart
function openCart() {
    if (!currentUser) {
        showNotification('Please login to view cart', 'warning');
        openAuth();
        return;
    }

    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    renderCart();
    document.getElementById('cartModal').classList.add('active');
}

// Close Cart
function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

// Render Cart
function renderCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        document.getElementById('cartSubtotal').textContent = '₹0.00';
        document.getElementById('cartTax').textContent = '₹0.00';
        document.getElementById('cartTotal').textContent = '₹0.00';
        return;
    }

    cartItemsDiv.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        const itemTotal = product.price * item.quantity;
        
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
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">₹${itemTotal.toFixed(2)}</div>
                    <button class="remove-item" onclick="removeFromCart(${item.productId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateCartSummary();
}

// Update Cart Quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.productId === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.stock) {
        showNotification('Cannot exceed available stock', 'warning');
        return;
    }

    item.quantity = newQuantity;
    updateCartCount();
    renderCart();
    saveToLocalStorage();
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
    showNotification('Item removed from cart', 'success');
}

// Update Cart Summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    document.getElementById('cartSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;
}

// Proceed to Checkout
function proceedToCheckout() {
    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
}

// Close Checkout
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

// Place Order
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
        subtotal,
        tax,
        total,
        status: 'pending',
        pickupDate,
        pickupTime,
        instructions,
        orderDate: new Date().toISOString()
    };

    orders.push(order);

    // Send order to Google Sheet
    sendOrderToGoogleSheet(order);

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
    showPage('orders');
}

// Set Minimum Date
function setMinDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum 1 day advance
    const minDate = today.toISOString().split('T')[0];
    document.getElementById('pickupDate').setAttribute('min', minDate);
}

// Auth Functions
function openAuth() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuth() {
    document.getElementById('authModal').classList.remove('active');
}

function toggleAuthMode(e) {
    e.preventDefault();
    isAuthMode = isAuthMode === 'login' ? 'signup' : 'login';
    
    if (isAuthMode === 'signup') {
        document.getElementById('authTitle').textContent = 'Sign Up';
        document.getElementById('authBtnText').textContent = 'Sign Up';
        document.getElementById('toggleText').innerHTML = 'Already have an account? <a href="#" id="toggleLink">Login</a>';
        document.getElementById('nameGroup').style.display = 'block';
        document.getElementById('phoneGroup').style.display = 'block';
        document.getElementById('addressGroup').style.display = 'block';
    } else {
        document.getElementById('authTitle').textContent = 'Login';
        document.getElementById('authBtnText').textContent = 'Login';
        document.getElementById('toggleText').innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>';
        document.getElementById('nameGroup').style.display = 'none';
        document.getElementById('phoneGroup').style.display = 'none';
        document.getElementById('addressGroup').style.display = 'none';
    }
    
    document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);
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
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid credentials', 'warning');
        }
    } else {
        const name = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!name || !phone || !address) {
            showNotification('Please fill all fields', 'warning');
            return;
        }

        if (users.find(u => u.email === email)) {
            showNotification('Email already exists', 'warning');
            return;
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            phone,
            address,
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
    if (currentUser) {
        document.getElementById('authBtn').textContent = 'Logout';
        document.getElementById('authBtn').onclick = logout;
        
        if (currentUser.role === 'admin') {
            document.getElementById('adminBtn').style.display = 'block';
        }
    } else {
        document.getElementById('authBtn').textContent = 'Login';
        document.getElementById('authBtn').onclick = openAuth;
        document.getElementById('adminBtn').style.display = 'none';
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

// Render Orders
function renderOrders() {
    const ordersContent = document.getElementById('ordersContent');
    
    if (!currentUser) {
        ordersContent.innerHTML = '<p class="empty-state">Please login to view your orders.</p>';
        return;
    }

    const userOrders = orders.filter(order => order.userId === currentUser.id);

    if (userOrders.length === 0) {
        ordersContent.innerHTML = '<p class="empty-state">You have no orders yet.</p>';
        return;
    }

    ordersContent.innerHTML = userOrders.map(order => `
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
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Pickup</div>
                    <div>${order.pickupDate} | ${order.pickupTime}</div>
                </div>
                <div class="order-total">₹${order.total.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

// Admin Functions
async function openAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access only', 'warning');
        return;
    }

    document.getElementById('adminModal').classList.add('active');
    
    // Fetch latest orders from Google Sheet
    const sheetOrders = await fetchOrdersFromGoogleSheet();
    if (sheetOrders.length > orders.length) {
        orders = sheetOrders;
        saveToLocalStorage();
    }
    
    renderAdminProducts();
    renderAdminOrders();
    updateReports();
}

function closeAdmin() {
    document.getElementById('adminModal').classList.remove('active');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function renderAdminProducts() {
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

async function renderAdminOrders() {
    const tbody = document.getElementById('adminOrdersTable');
    
    // Fetch latest orders
    const latestOrders = await fetchOrdersFromGoogleSheet();
    
    tbody.innerHTML = latestOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customerName}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="order-status ${order.status}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="packing" ${order.status === 'packing' ? 'selected' : ''}>Packing</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>${order.pickupDate} ${order.pickupTime}</td>
            <td>
                <button class="action-btn" onclick="viewOrderDetails(${order.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveToLocalStorage();
        
        // Update in Google Sheet
        updateOrderStatusInSheet(orderId, newStatus);
        
        showNotification('Order status updated', 'success');
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order #${order.id}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nTotal: ₹${order.total.toFixed(2)}\nStatus: ${order.status}\nPickup: ${order.pickupDate} ${order.pickupTime}\nInstructions: ${order.instructions || 'None'}`);
    }
}

function updateReports() {
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = `₹${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`;
    document.getElementById('totalCustomers').textContent = users.filter(u => u.role === 'customer').length;
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
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    
    document.getElementById('productFormModal').classList.add('active');
}

function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value || '📦'
    };

    if (editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        Object.assign(product, productData);
        showNotification('Product updated successfully', 'success');
    } else {
        const newProduct = {
            id: products.length + 1,
            ...productData
        };
        products.push(newProduct);
        showNotification('Product added successfully', 'success');
    }

    saveToLocalStorage();
    renderProducts();
    renderAdminProducts();
    closeProductForm();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveToLocalStorage();
        renderProducts();
        renderAdminProducts();
        showNotification('Product deleted successfully', 'success');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
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
