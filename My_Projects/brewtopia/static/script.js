// script.js

// Cart functionality
let cart = JSON.parse(localStorage.getItem('brewtopia_cart')) || [];

// Smooth scroll behavior for nav links
const links = document.querySelectorAll('.nav-links a:not(#cart-link)');
links.forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile menu after clicking
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.remove('show');
        }
    });
});

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Handle contact form submission
const form = document.getElementById("contact-form");
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        alert("Thanks for reaching out! We'll get back to you soon.");
        form.reset();
    });
}

// Cart functions
function addToCart(itemName, price) {
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }
    saveCart();
    updateCartCount();
    showNotification(`${itemName} added to cart!`, 'success');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    viewCart();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
        return;
    }
    saveCart();
    updateCartCount();
    viewCart();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    viewCart();
}

function saveCart() {
    localStorage.setItem('brewtopia_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function viewCart() {
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartModal || !cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add some delicious items!</div>';
        cartTotal.textContent = '0';
    } else {
        let itemsHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>R${item.price} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                        <button onclick="removeFromCart(${index})" style="background: #dc3545; margin-left: 10px;">×</button>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = total;
    }

    cartModal.style.display = 'block';
}

function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderSummary = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

    // Redirect to Yoco payment page
    const paymentUrl = 'https://pay.yoco.com/rinae-ramadi';
    window.open(paymentUrl, '_blank');

    showNotification('Redirecting to payment... Please complete your order!', 'success');

    // Optionally clear cart after payment redirect
    // clearCart();
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10001',
        animation: 'slideIn 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });

    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#007bff';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Close cart when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cart-modal');
    if (event.target === cartModal) {
        closeCart();
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
