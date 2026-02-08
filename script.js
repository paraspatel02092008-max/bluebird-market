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

// 🔴 ADDED: Google Sheet Web App URL
const GOOGLE_SHEET_API =
  "https://script.google.com/macros/s/AKfycbwlVuZxRzmEVtfy2-OmS3-ZtjwP4jHHg_vpYZ_0yBptho98MP-7FJJJ6acgn5ZxCV6jkQ/exec";

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

// 🔴 ADDED: Send order to Google Sheet
function sendOrderToGoogleSheet(order) {
    const sheetData = {
        product: order.items.map(i => i.productName).join(", "),
        price: order.total,
        quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
        customer: order.customerName,
        email: order.customerEmail,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime
    };

    fetch(GOOGLE_SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetData)
    })
    .then(res => res.json())
    .then(() => console.log("Order saved to Google Sheet"))
    .catch(err => console.error("Google Sheet error:", err));
}

/* ===========================
   YOUR ORIGINAL CODE CONTINUES
   (NO LOGIC CHANGED BELOW)
   =========================== */

// Checkout (ONLY ONE LINE ADDED INSIDE)
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

    // 🔴 ADDED LINE (Google Sheet sync)
    sendOrderToGoogleSheet(order);

    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) product.stock -= item.quantity;
    });

    cart = [];
    updateCartCount();
    saveToLocalStorage();

    closeCheckout();
    showNotification('Order placed successfully! Order ID: #' + order.id, 'success');
    showPage('orders');
}

