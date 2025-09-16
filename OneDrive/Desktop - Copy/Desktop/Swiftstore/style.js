const FALLBACK_PRODUCTS = [
    { name: "Paracetamol 500mg", brand: "Calpol", category: "Pain Relief", price: 2.99, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop" },
    { name: "Ibuprofen 200mg", brand: "Advil", category: "Pain Relief", price: 3.49, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop" },
    { name: "Cough Syrup", brand: "Benylin", category: "Cold & Flu", price: 5.99, image: "https://images.unsplash.com/photo-1609705025031-7c4c8e3a2d5a?q=80&w=600&auto=format&fit=crop" },
    { name: "Vitamin C 1000mg", brand: "Now Foods", category: "Vitamins", price: 7.49, image: "https://images.unsplash.com/photo-1599050751795-5cda3a4b708d?q=80&w=600&auto=format&fit=crop" },
    { name: "Antacid Tablets", brand: "Tums", category: "Digestion", price: 4.29, image: "https://images.unsplash.com/photo-1626716493139-7686b0f5a7a1?q=80&w=600&auto=format&fit=crop" },
    { name: "Allergy Relief", brand: "Zyrtec", category: "Allergy", price: 6.99, image: "https://images.unsplash.com/photo-1584312903318-8d3b6a3e7a9b?q=80&w=600&auto=format&fit=crop" }
];

let products = [];

const CART_KEY = 'swiftstore_cart';
const LEADS_KEY = 'swiftstore_leads';

async function loadProducts() {
    try {
        const res = await fetch('products.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        products = Array.isArray(data) ? data : FALLBACK_PRODUCTS;
    } catch (e) {
        products = FALLBACK_PRODUCTS;
    }
    renderProducts(products);
}

const productContainer = document.getElementById('product-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const ctaForm = document.getElementById('cta-form');
const ctaStatus = document.getElementById('cta-status');
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const resultCount = document.getElementById('result-count');

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;

    const title = document.createElement('h3');
    title.textContent = product.name;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${product.brand} • ${product.category}`;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${product.price.toFixed(2)}`;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn primary';
    addBtn.type = 'button';
    addBtn.textContent = 'Add to cart';
    addBtn.addEventListener('click', () => {
        addToCart(product);
        addBtn.textContent = 'Added ✔';
        setTimeout(() => (addBtn.textContent = 'Add to cart'), 1200);
    });

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn ghost';
    infoBtn.type = 'button';
    infoBtn.textContent = 'Details';
    infoBtn.addEventListener('click', () => {
        alert(`${product.name}\n${product.brand} • ${product.category}\nPrice: $${product.price.toFixed(2)}`);
    });

    actions.appendChild(addBtn);
    actions.appendChild(infoBtn);

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(price);
    card.appendChild(actions);

    return card;
}

function renderProducts(list) {
    productContainer.innerHTML = '';
    list.forEach((product) => {
        productContainer.appendChild(createProductCard(product));
    });
    if (resultCount) resultCount.textContent = `${list.length} result${list.length === 1 ? '' : 's'}`;
}

function filterProducts(query) {
    const q = query.trim().toLowerCase();
    const category = categoryFilter ? categoryFilter.value : '';
    let list = products.slice();
    if (category) list = list.filter((p) => p.category === category);
    if (q) {
        list = list.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }
    const sort = sortSelect ? sortSelect.value : '';
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
}

function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchInput ? searchInput.value : '';
    renderProducts(filterProducts(q));
    const section = document.getElementById('medicines');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateCartBadge() {
    if (!cartBtn) return;
    const items = getCart();
    const count = items.reduce((sum, it) => sum + it.qty, 0);
    cartBtn.textContent = `Cart (${count})`;
}

function openCart() {
    if (cartDrawer) cartDrawer.hidden = false;
    if (cartOverlay) cartOverlay.hidden = false;
    renderCart();
}

function closeCart() {
    if (cartDrawer) cartDrawer.hidden = true;
    if (cartOverlay) cartOverlay.hidden = true;
}

function renderCart() {
    if (!cartItemsEl || !cartTotalEl) return;
    const items = getCart();
    cartItemsEl.innerHTML = '';
    let total = 0;
    items.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        const img = document.createElement('img');
        const product = products.find((p) => p.name === it.name && p.brand === it.brand);
        img.src = product ? product.image : 'https://via.placeholder.com/56x56?text=Rx';
        img.alt = it.name;
        const info = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = it.name;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `${it.brand} • $${it.price.toFixed(2)}`;
        info.appendChild(title);
        info.appendChild(meta);
        const controls = document.createElement('div');
        const qty = document.createElement('div');
        qty.className = 'qty';
        const dec = document.createElement('button');
        dec.type = 'button';
        dec.textContent = '-';
        dec.addEventListener('click', () => changeQty(idx, -1));
        const n = document.createElement('span');
        n.textContent = String(it.qty);
        const inc = document.createElement('button');
        inc.type = 'button';
        inc.textContent = '+';
        inc.addEventListener('click', () => changeQty(idx, +1));
        qty.appendChild(dec);
        qty.appendChild(n);
        qty.appendChild(inc);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-btn';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => removeItem(idx));
        controls.appendChild(qty);
        controls.appendChild(remove);
        row.appendChild(img);
        row.appendChild(info);
        row.appendChild(controls);
        cartItemsEl.appendChild(row);
        total += it.price * it.qty;
    });
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
    updateCartBadge();
}

function changeQty(index, delta) {
    const items = getCart();
    const it = items[index];
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) items.splice(index, 1);
    saveCart(items);
    renderCart();
}

function removeItem(index) {
    const items = getCart();
    items.splice(index, 1);
    saveCart(items);
    renderCart();
}

function handleCtaSubmit(e) {
    e.preventDefault();
    const need = document.getElementById('need');
    const phone = document.getElementById('phone');
    if (!need || !phone) return;
    if (!need.value.trim() || !phone.value.trim()) {
        ctaStatus.textContent = 'Please enter your need and phone number.';
        ctaStatus.style.color = 'var(--danger)';
        return;
    }
    saveLead({ need: need.value.trim(), phone: phone.value.trim(), ts: Date.now() });
    ctaStatus.style.color = 'var(--primary)';
    ctaStatus.textContent = 'Thanks! We will call you shortly.';
    need.value = '';
    phone.value = '';
}

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(product) {
    const items = getCart();
    const key = `${product.name}__${product.brand}`;
    const existing = items.find((i) => i.key === key);
    if (existing) {
        existing.qty += 1;
    } else {
        items.push({ key, name: product.name, brand: product.brand, price: product.price, qty: 1 });
    }
    saveCart(items);
}

function getLeads() {
    try { return JSON.parse(localStorage.getItem(LEADS_KEY)) || []; } catch { return []; }
}

function saveLeads(leads) {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

function saveLead(lead) {
    const leads = getLeads();
    leads.push(lead);
    saveLeads(leads);
}

function enableSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    if (searchForm) searchForm.addEventListener('submit', handleSearchSubmit);
    if (ctaForm) ctaForm.addEventListener('submit', handleCtaSubmit);
    enableSmoothAnchors();
    // Cart events
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => alert('Checkout coming soon'));
    updateCartBadge();
    // Filters
    if (categoryFilter && sortSelect) {
        categoryFilter.addEventListener('change', () => renderProducts(filterProducts(searchInput ? searchInput.value : '')));
        sortSelect.addEventListener('change', () => renderProducts(filterProducts(searchInput ? searchInput.value : '')));
    }
});

// Populate categories when products load
(async function ensureCategories() {
    await loadProducts();
    if (categoryFilter && products.length) {
        const cats = Array.from(new Set(products.map((p) => p.category)));
        const current = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">All categories</option>' +
            cats.map((c) => `<option value="${c}">${c}</option>`).join('');
        categoryFilter.value = current;
    }
})();