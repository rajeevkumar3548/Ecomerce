
// ── DATA ────────────────────────────────────
const PRODUCTS = [
  {id:1, name:"Studio Pro Headphones", price:299, was:379, cat:"electronics", em:"🎧", badge:"Best Seller", rating:4.8, reviews:312, desc:"Noise-cancelling, 40hr battery, premium sound."},
  {id:2, name:"Minimal Arc Watch",     price:189, was:null,cat:"accessories", em:"⌚", badge:"New",         rating:4.6, reviews:87,  desc:"Sapphire glass, Swiss movement, 5ATM water-resistant."},
  {id:3, name:"Leather Wallet Slim",   price:79,  was:95,  cat:"accessories", em:"👜", badge:"Sale",        rating:4.9, reviews:540, desc:"Full-grain leather, RFID blocking, 8 card slots."},
  {id:4, name:"Mechanical Keyboard",   price:149, was:null,cat:"electronics", em:"⌨️",badge:null,          rating:4.7, reviews:203, desc:"TKL layout, Cherry MX switches, PBT keycaps."},
  {id:5, name:"Ceramic Pour-Over Set", price:65,  was:null,cat:"home",        em:"☕", badge:"Trending",    rating:4.9, reviews:178, desc:"Handmade ceramic, includes carafe and filter stand."},
  {id:6, name:"Merino Wool Sweater",   price:129, was:159, cat:"fashion",     em:"🧥", badge:"Sale",        rating:4.5, reviews:94,  desc:"100% Merino wool, ethically sourced, 4 colors."},
  {id:7, name:"Portable Power Bank",   price:59,  was:null,cat:"electronics", em:"🔋", badge:null,          rating:4.4, reviews:421, desc:"20,000mAh, USB-C PD 65W, MagSafe compatible."},
  {id:8, name:"Linen Throw Blanket",   price:89,  was:null,cat:"home",        em:"🛋️",badge:"New",          rating:4.8, reviews:65,  desc:"Portuguese linen, 150×200cm, machine washable."},
  {id:9, name:"Running Sneakers",      price:135, was:175, cat:"fashion",     em:"👟", badge:"Sale",        rating:4.6, reviews:289, desc:"Carbon fiber plate, responsive foam, wide toe box."},
  {id:10,name:"Smart Home Hub",        price:99,  was:null,cat:"electronics", em:"🏠", badge:null,          rating:4.3, reviews:112, desc:"Controls 200+ devices, Thread & Zigbee, local processing."},
  {id:11,name:"Sunglasses Aviator",    price:119, was:149, cat:"accessories", em:"🕶️",badge:"Sale",         rating:4.7, reviews:198, desc:"Polarised CR-39 lenses, titanium frame, UV400."},
  {id:12,name:"Scented Candle Set",    price:48,  was:null,cat:"home",        em:"🕯️",badge:null,           rating:4.9, reviews:340, desc:"3 seasonal scents, 60hr burn each, soy wax."}
];

// ── CART (localStorage) ──────────────────────
const CART_KEY = 'luxe_cart_v1';
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { cart = []; }
function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {} }

// ── STATE ────────────────────────────────────
let activeCat = 'all', searchQ = '', sortMode = 'default';

// ── UTILITIES ────────────────────────────────
function fmt(n) { return '$' + n.toFixed(2); }

function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
function inCart(id)  { return cart.find(i => i.id === id); }

function starsHtml(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const full = i <= Math.floor(r);
    const half = !full && (i - 0.5) <= r;
    s += `<span style="color:${full || half ? '#f4a228' : '#ddd'}">★</span>`;
  }
  return s;
}

function badgeClass(b) {
  const map = { 'Sale':'sale', 'New':'new', 'Trending':'trending', 'Best Seller':'bestseller' };
  return `pcard-badge badge-${map[b] || 'new'}`;
}

function getDiscount(p) {
  return p.was ? Math.round((1 - p.price / p.was) * 100) : null;
}

// ── TOAST ────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── RENDER PRODUCTS ──────────────────────────
function getFiltered() {
  let p = [...PRODUCTS];
  if (activeCat !== 'all') p = p.filter(x => x.cat === activeCat);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    p = p.filter(x =>
      x.name.toLowerCase().includes(q) ||
      x.cat.toLowerCase().includes(q) ||
      x.desc.toLowerCase().includes(q)
    );
  }
  if (sortMode === 'price-asc')  p.sort((a, b) => a.price - b.price);
  if (sortMode === 'price-desc') p.sort((a, b) => b.price - a.price);
  if (sortMode === 'rating')     p.sort((a, b) => b.rating - a.rating);
  return p;
}

function renderProducts() {
  const filtered = getFiltered();
  const grid     = document.getElementById('productsGrid');
  const noRes    = document.getElementById('noResults');
  const rtxt     = document.getElementById('resultsText');

  rtxt.textContent = `(${filtered.length} item${filtered.length !== 1 ? 's' : ''})`;

  if (!filtered.length) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    return;
  }
  noRes.style.display = 'none';

  grid.innerHTML = filtered.map((p, i) => {
    const ic   = inCart(p.id);
    const disc = getDiscount(p);
    return `
      <div class="pcard" style="animation-delay:${i * 0.045}s">
        <div class="pcard-img">
          ${p.badge ? `<div class="${badgeClass(p.badge)}">${p.badge}</div>` : ''}
          ${p.em}
        </div>
        <div class="pcard-body">
          <div class="pcard-cat">${p.cat}</div>
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-desc">${p.desc}</div>
          <div class="rating">
            ${starsHtml(p.rating)}
            <span class="rating-n">${p.rating} (${p.reviews.toLocaleString()})</span>
          </div>
          <div class="pcard-footer">
            <div class="price-grp">
              <span class="price-now">${fmt(p.price)}</span>
              ${p.was  ? `<span class="price-was">${fmt(p.was)}</span>` : ''}
              ${disc   ? `<span class="price-off">-${disc}%</span>` : ''}
            </div>
            <button class="add-btn ${ic ? 'in-cart' : ''}" onclick="addToCart(${p.id})">
              ${ic ? `✓ Added (${ic.qty})` : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── CART ACTIONS ─────────────────────────────
function syncBadge() {
  const n = cartCount();
  document.getElementById('cartBadge').textContent = n;
  document.getElementById('cartChip').textContent  = n;
}

function addToCart(id) {
  const p  = PRODUCTS.find(x => x.id === id);
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, em: p.em, qty: 1 });
  saveCart(); syncBadge(); renderProducts(); renderCartItems();
  showToast(`${p.em} ${p.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); syncBadge(); renderProducts(); renderCartItems();
  showToast('Item removed from cart.');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(); syncBadge(); renderProducts(); renderCartItems();
}

function renderCartItems() {
  const el     = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    el.innerHTML = `
      <div class="cart-empty">
        <div class="em-icon">🛍</div>
        <p>Your cart is empty</p>
        <span style="font-size:12px;color:var(--c6)">Browse products and add some!</span>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="ci-thumb">${i.em}</div>
      <div>
        <div class="ci-name">${i.name}</div>
        <div class="ci-price">${fmt(i.price)} each</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQty(${i.id}, -1)">−</button>
          <span class="qty-n">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i.id}, +1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem;padding-top:2px">
        <div class="ci-total">${fmt(i.price * i.qty)}</div>
        <button class="ci-del" onclick="removeFromCart(${i.id})" title="Remove item">🗑</button>
      </div>
    </div>`).join('');

  const sub    = cartTotal();
  const ship   = sub >= 100 ? 'Free' : fmt(9.99);
  const total  = sub >= 100 ? sub : sub + 9.99;

  footer.style.display = 'block';
  document.getElementById('cartSubtotal').textContent = fmt(sub);
  document.getElementById('cartShipping').textContent = ship;
  document.getElementById('cartTotal').textContent    = fmt(total);
}

function openCart() {
  renderCartItems();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── FILTERS ──────────────────────────────────
function setCategory(btn, cat) {
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = cat;
  renderProducts();
}

function filterProducts(fromMobile = false) {
  const val = fromMobile
    ? document.getElementById('mobileSearch').value
    : document.getElementById('searchInput').value;
  searchQ = val.trim();
  const other = fromMobile ? 'searchInput' : 'mobileSearch';
  const otherEl = document.getElementById(other);
  if (otherEl) otherEl.value = val;
  renderProducts();
}

function sortProducts(val) {
  sortMode = val;
  renderProducts();
}

// ── CHECKOUT ─────────────────────────────────
function openCheckout() {
  closeCart();
  const sub   = cartTotal();
  const tax   = sub * 0.08;
  const total = sub + tax;

  document.getElementById('coSub').textContent   = fmt(sub);
  document.getElementById('coTax').textContent   = fmt(tax);
  document.getElementById('coTotal').textContent = fmt(total);

  document.getElementById('coItems').innerHTML = cart.map(i => `
    <div class="co-item">
      <div class="co-item-thumb">${i.em}</div>
      <div style="flex:1">
        <div class="co-item-name">${i.name}</div>
        <div class="co-item-qty">Qty: ${i.qty}</div>
      </div>
      <div class="co-item-price">${fmt(i.price * i.qty)}</div>
    </div>`).join('');

  document.getElementById('checkout-page').style.display = 'block';
  window.scrollTo(0, 0);
}

function closeCheckout() {
  document.getElementById('checkout-page').style.display = 'none';
  openCart();
}

function selectPay(el) {
  document.querySelectorAll('.pay-icon').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
}

function fmtCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function fmtExpiry(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2, 4);
  el.value = v;
}

function placeOrder() {
  const num = Math.floor(Math.random() * 90000 + 10000);
  document.getElementById('orderNum').textContent = num;
  document.getElementById('checkout-page').style.display = 'none';

  const sp = document.getElementById('success-page');
  sp.style.display = 'flex';

  // Clear cart after order
  cart = [];
  saveCart();
  syncBadge();
  renderProducts();
}

function backToShop() {
  document.getElementById('success-page').style.display = 'none';
  window.scrollTo(0, 0);
}

function goHome() {
  document.getElementById('checkout-page').style.display = 'none';
  document.getElementById('success-page').style.display  = 'none';
}

function scrollToProducts() {
  document.getElementById('mainSection').scrollIntoView({ behavior: 'smooth' });
}

// ── INIT ─────────────────────────────────────
syncBadge();
renderProducts();
