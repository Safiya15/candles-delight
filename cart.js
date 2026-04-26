// ─── cart.js — Glow & Scent ───────────────────────────────────────
// Single source of truth for all cart logic.

const API_BASE = 'http://localhost:4000'; 

// ── Storage helpers ───────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart')) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ── Badge update ──────────────────────────────────────────────────
function updateCartBadge() {
  const total = getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  
  const badges = document.querySelectorAll('#cartCount, #cartCountFloat, .cart-count');
  badges.forEach(el => {
    if (el.textContent !== String(total)) {
      el.textContent = total;
      
      // Modern pop animation
      el.style.transform = 'scale(1.3)';
      el.style.transition = 'transform 0.2s';
      setTimeout(() => el.style.transform = 'scale(1)', 200);
    }
  });
}

// ── Add to cart ──────────────────────────────────────────────────
function addToCart(name, price, image = null, btnEl = null) {
  if (!image && btnEl) {
    const card = btnEl.closest('.product-card');
    if (card) image = card.querySelector('img')?.src || null;
  }

  const cart = getCart();
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: Number(price), image, qty: 1 });
  }

  saveCart(cart);
  updateCartBadge();

  // Modern Visual feedback

}

// ── Remove item ───────────────────────────────────────────────────
function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ── Quantity change ───────────────────────────────────────────────
function changeQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, (cart[index].qty || 1) + delta);
  saveCart(cart);
  renderCart();
}

// ── Render cart page ──────────────────────────────────────────────
function renderCart() {
  const container = document.querySelector('.cart-container');
  if (!container) return;

  const cart = getCart();
  // We do NOT call updateCartBadge here to avoid reload loops

  if (cart.length === 0) {
    container.innerHTML = `
      <h1>Your Cart</h1>
      <div class="empty-cart">
        <div style="font-size:3rem;margin-bottom:1rem;">🛒</div>
        <p>Your cart is empty.</p>
        <a href="moreproduct.html" style="
          display:inline-block;margin-top:1rem;padding:0.7rem 1.8rem;
          background:#7b5e57;color:white;border-radius:10px;
          font-weight:bold;text-decoration:none;">
          Browse Products
        </a>
      </div>`;
    return;
  }

  let total = 0;
  let itemsHtml = '<h1>Your Cart</h1>';

  cart.forEach((item, idx) => {
    const qty   = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    total += qty * price;

    itemsHtml += `
      <div class="cart-item">
        <img src="${item.image || 'https://via.placeholder.com/80x80'}" alt="${item.name}">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>₹${price.toFixed(2)} each</p>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-num">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">₹${(price * qty).toFixed(2)}</div>
        <button class="remove-btn" onclick="removeItem(${idx})">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;
  });

  itemsHtml += `
    <div class="cart-summary">
      <h2>Total: ₹${total.toFixed(2)}</h2>
      <a href="Checkout.html" class="checkout-btn">Proceed to Checkout →</a>
    </div>`;

  container.innerHTML = itemsHtml;
}

// ── Clean Initialization ──────────────────────────────────────────
let isRendering = false;

document.addEventListener('DOMContentLoaded', () => {
  if (isRendering) return;
  
  updateCartBadge();
  
  const cartContainer = document.querySelector('.cart-container');
  if (cartContainer) {
    isRendering = true;
    renderCart();
    isRendering = false;
  }
});

// Update on cross-tab storage changes
window.addEventListener('storage', (e) => {
  if (e.key !== 'cart') return;
  updateCartBadge();
  if (document.querySelector('.cart-container') && !isRendering) {
    isRendering = true;
    renderCart();
    isRendering = false;
  }
});