// =============== Configuración ===============
const WHATSAPP_NUMBER = '573219736929'; // Reemplaza con tu número en formato internacional, solo dígitos. Ej: 573001234567

// Productos de ejemplo (puedes conectar con tu backend o editar aquí)
const PRODUCTS = [

// { 
    //id: 'p1', 
    //nombre: 'Audífonos inalámbricos Airpods', 
   // precio: 60000, 
    //images: ['...'], 
    //descripcion: 'Sonido de alta fidelidad, libertad total. 🎶' // <-- Pega aquí la descripción que elijas
 // },
	

  { id: 'p1', nombre: 'Audífonos inalámbricos Airpods', precio: 60000, images: ['assets/img/Audífonos inalámbricos Airpods/Audífonos inalámbricos Airpods.webp','assets/img/Audífonos inalámbricos Airpods/Audífonos inalámbricos Airpods 1.webp','assets/img/Audífonos inalámbricos Airpods/Audífonos inalámbricos Airpods 2.webp','assets/img/Audífonos inalámbricos Airpods/Audífonos inalámbricos Airpods 3.webp'], descripcion: 'Audífonos de alta calidad para una experiencia de audio inmersiva.' },
  { id: 'p2', nombre: 'Combo audifonos + smartwatch Q9', precio: 80000, images: ['assets/img/Combo/Combo 1.jpeg', 'assets/img/Combo/Combo 2.png'], descripcion: 'El combo perfecto para tu día a día, con audífonos y smartwatch.' },
  { id: 'p3', nombre: 'Pilas Beston Recargable X4 Con Cargador', precio: 35000, images: ['assets/img/Betson/betson 1.webp', 'assets/img/Betson/betson 2.webp'], descripcion: 'No te quedes sin energía. La duración está garantizada.' },
 

];

const fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// =============== Estado ===============
let cart = loadCart();
let currentImageIndex = 0;
let currentProductImages = [];

// =============== Utilidades ===============
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}
function findInCart(id) {
  return cart.find(item => item.id === id);
}
function updateCartCount() {
  const count = cart.reduce((a, b) => a + b.cantidad, 0);
  document.getElementById('cart-count').textContent = count;
}

// =============== Render de productos ===============
function renderProducts() {
  const grid = document.getElementById('productos');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="card-media">
        <a href="javascript:void(0)" class="product-image-link" data-id="${p.id}" data-index="0">
          <img src="${p.images[0]}" alt="Imagen de ${p.nombre}">
        </a>
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.nombre}</h3>
        <div class="muted small">Ref int: ${p.id}</div>
        <div class="price">${fmtCOP.format(p.precio)}</div>
        <div class="product-description">${p.descripcion}</div>
        <div class="card-gallery">
          ${p.images.map((img, index) => `<img src="${img}" class="card-thumb" data-id="${p.id}" data-index="${index}" alt="Miniatura ${index + 1}">`).join('')}
        </div>
        <button class="btn" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add));
  });

  grid.querySelectorAll('.product-image-link, .card-thumb').forEach(el => {
    el.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.id;
      const imageIndex = parseInt(e.currentTarget.dataset.index);
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        currentProductImages = product.images;
        currentImageIndex = imageIndex;
        openImageModal(currentProductImages[currentImageIndex]);
      }
    });
  });
}

// =============== Carrito ===============
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = findInCart(id);
  if (existing) existing.cantidad += 1;
  else cart.push({ id: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1 });
  saveCart();
  openCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function setQty(id, qty) {
  const item = findInCart(id);
  if (!item) return;
  const q = Math.max(1, Math.min(99, Number(qty) || 1));
  item.cantidad = q;
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = findInCart(id);
  if (!item) return;
  item.cantidad = Math.max(1, Math.min(99, item.cantidad + delta));
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, it) => sum + it.precio * it.cantidad, 0);
}

// =============== Render del carrito ===============
function renderCart() {
  const list = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (cart.length === 0) {
    list.innerHTML = `<li class="muted">Tu carrito está vacío.</li>`;
  } else {
    list.innerHTML = cart.map(item => `
      <li class="cart-item">
        <div class="cart-thumb"></div>
        <div>
          <h4 class="cart-title">${item.nombre}</h4>
          <div class="cart-row">
            <span class="muted small">${fmtCOP.format(item.precio)} c/u</span>
            <div class="qty">
              <button aria-label="Disminuir" onclick="changeQty('${item.id}', -1)">−</button>
              <input type="text" inputmode="numeric" value="${item.cantidad}" onchange="setQty('${item.id}', this.value)" />
              <button aria-label="Aumentar" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
            <strong>${fmtCOP.format(item.precio * item.cantidad)}</strong>
            <button class="btn btn-outline" onclick="removeFromCart('${item.id}')">Quitar</button>
          </div>
        </div>
        <div></div>
      </li>
    `).join('');
  }
  subtotalEl.textContent = fmtCOP.format(cartSubtotal());
}

// =============== WhatsApp ===============
function buildWhatsAppMessage() {
  if (cart.length === 0) return 'Hola, estoy interesado en .......';
  const lines = cart.map(item => `• ${item.nombre} x${item.cantidad} — ${fmtCOP.format(item.precio * item.cantidad)}`);
  const total = fmtCOP.format(cartSubtotal());
  return [
    'Hola, quiero finalizar mi compra 🛒',
    '',
    'Detalle del pedido:',
    ...lines,
    '',
    `Subtotal: ${total}`,
    '',
    '¿Disponibilidad, tiempo de entrega y costo de envío?'
  ].join('\n');
}

function openWhatsApp() {
  const msg = encodeURIComponent(buildWhatsAppMessage());
  const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
  if (!phone) {
    alert('Configura tu número de WhatsApp en script.js (WHATSAPP_NUMBER).');
    return;
  }
  const url = `https://wa.me/${phone}?text=${msg}`;
  window.open(url, '_blank');
}

// =============== Modal del carrito ===============
const backdrop = document.getElementById('cart-backdrop');
const modal = document.getElementById('cart-modal');
const btnOpen = document.getElementById('btn-open-cart');
const btnClose = document.getElementById('btn-close-cart');
const btnClear = document.getElementById('btn-clear-cart');
const btnContinue = document.getElementById('btn-continue');
const btnWhatsapp = document.getElementById('btn-whatsapp');

function openCart() {
  backdrop.hidden = false;
  modal.hidden = false;
  modal.focus();
}
function closeCart() {
  backdrop.hidden = true;
  modal.hidden = true;
}

btnOpen.addEventListener('click', () => { renderCart(); openCart(); });
btnClose.addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
btnContinue.addEventListener('click', closeCart);
btnClear.addEventListener('click', () => {
  if (cart.length === 0) return closeCart();
  if (confirm('¿Vaciar todo el carrito?')) clearCart();
});
btnWhatsapp.addEventListener('click', openWhatsApp);

// =============== Modal de imagen (nuevo) ===============
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModal = document.querySelector('.image-modal');
const modalImage = document.getElementById('modal-image');
const btnCloseImageModal = document.getElementById('btn-close-image-modal');
const btnPrevImage = document.getElementById('btn-prev-image');
const btnNextImage = document.getElementById('btn-next-image');

function openImageModal(imageSrc) {
  modalImage.src = imageSrc;
  imageModalBackdrop.hidden = false;
  document.body.classList.add('modal-open');
}

function closeImageModal() {
  imageModalBackdrop.hidden = true;
  document.body.classList.remove('modal-open');
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % currentProductImages.length;
  modalImage.src = currentProductImages[currentImageIndex];
}

function showPrevImage() {
  currentImageIndex = (currentImageIndex - 1 + currentProductImages.length) % currentProductImages.length;
  modalImage.src = currentProductImages[currentImageIndex];
}

if (imageModalBackdrop) {
  imageModalBackdrop.addEventListener('click', (e) => {
    if (e.target.id === 'image-modal-backdrop') {
      closeImageModal();
    }
  });
}

if (btnCloseImageModal) {
  btnCloseImageModal.addEventListener('click', closeImageModal);
}

if (btnPrevImage) {
  btnPrevImage.addEventListener('click', showPrevImage);
}

if (btnNextImage) {
  btnNextImage.addEventListener('click', showNextImage);
}

// =============== Init ===============
renderProducts();
renderCart();
updateCartCount();