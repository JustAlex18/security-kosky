'use strict';

const ADMIN_ID = 'SK-2026';

const STORAGE_KEY = 'sk_products_v2';

const WA_NUMBER = '584141364498';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Cámara IP HD Exterior',
    desc: 'Cámara de vigilancia HD 1080p resistente al agua, visión nocturna hasta 30m, acceso remoto desde app móvil.',
    price: '$89.99'
  },
  {
    id: 'prod-002',
    name: 'Kit DVR 8 Canales',
    desc: 'Sistema completo de grabación digital con 8 canales, disco duro de 1TB, detección de movimiento y alertas.',
    price: '$245.00'
  },
  {
    id: 'prod-003',
    name: 'Alarma Perimetral Inalámbrica',
    desc: 'Sistema de alarma inteligente con sensores magnéticos, sirena de alta potencia y control por smartphone.',
    price: '$135.50'
  }
];

const viewMain    = document.getElementById('view-main');
const viewCatalog = document.getElementById('view-catalog');

const btnAdminLock = document.getElementById('btn-admin-lock');

const triggerBtn = document.getElementById('btn-redes');
const panel      = document.getElementById('redes-panel');
const chevron    = triggerBtn.querySelector('.accordion__chevron');

const btnVolver = document.getElementById('btn-volver');

const productsGrid = document.getElementById('products-grid');

const modalAdminLogin  = document.getElementById('modal-admin-login');
const formAdminLogin   = document.getElementById('form-admin-login');
const inputAdminId     = document.getElementById('input-admin-id');
const btnCancelLogin   = document.getElementById('btn-cancel-login');
const loginErrorMsg    = document.getElementById('login-error-msg');

const modalAdminPanel  = document.getElementById('modal-admin-panel');
const btnCerrarPanel   = document.getElementById('btn-cerrar-panel');

const formAddProduct    = document.getElementById('form-add-product');
const newProdName       = document.getElementById('new-prod-name');
const newProdDesc       = document.getElementById('new-prod-desc');
const newProdPrice      = document.getElementById('new-prod-price');
const editProdIdInput   = document.getElementById('edit-prod-id');
const addProductError   = document.getElementById('add-product-error');
const adminProductList  = document.getElementById('admin-product-list');
const formSectionTitle  = document.getElementById('form-section-title');
const btnAddSubmit      = document.getElementById('btn-add-product-submit');
const btnCancelEdit     = document.getElementById('btn-cancel-edit');

const newProdImg        = document.getElementById('new-prod-img');
const imgPreviewWrap    = document.getElementById('img-preview-wrap');
const imgPreview        = document.getElementById('img-preview');
const btnClearImg       = document.getElementById('btn-clear-img');
const fileLabelText     = document.getElementById('file-label-text');

let pendingImageBase64 = null;

function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[SK] Error leyendo localStorage, usando datos por defecto.', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('[SK] Error guardando en localStorage.', e);
  }
}

function generateId() {
  return 'prod-' + Date.now().toString(36);
}

let products = loadProducts();

function buildImagePlaceholder() {
  return `
    <div class="product-img-placeholder" aria-label="Imagen del producto no disponible" role="img">
      <div class="product-img-placeholder__icon" aria-hidden="true">
        <svg xmlns="http:
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>
      <span>Imagen del Producto</span>
    </div>
  `;
}

function buildProductCard(product) {
  const waMsg = encodeURIComponent(
    `Hola Security Kosky, estoy interesado/a en el producto: *${product.name}* (${product.price}). ¿Podrían darme más información?`
  );
  const waHref = `https:

  const imageHtml = product.imageBase64
    ? `<img class="product-img-real" src="${product.imageBase64}" alt="${escapeHtml(product.name)}" loading="lazy" />`
    : buildImagePlaceholder();

  return `
    <article class="product-card" role="listitem" data-product-id="${product.id}">
      ${imageHtml}
      <div class="product-card__body">
        <h3 class="product-card__name">${escapeHtml(product.name)}</h3>
        <p class="product-card__desc">${escapeHtml(product.desc)}</p>
        <p class="product-card__price">${escapeHtml(product.price)}</p>
        <a
          class="product-card__btn"
          href="${waHref}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Solicitar ${escapeHtml(product.name)} por WhatsApp"
        >
          <svg xmlns="http:
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Solicitar por WhatsApp
        </a>
      </div>
    </article>
  `;
}

function renderCatalog() {
  if (products.length === 0) {
    productsGrid.innerHTML = `
      <p class="admin-empty-msg" style="grid-column: 1 / -1;">
        No hay productos disponibles en este momento. Vuelve pronto.
      </p>
    `;
    return;
  }
  productsGrid.innerHTML = products.map(buildProductCard).join('');
}

function buildAdminProductItem(product) {

  const thumbHtml = product.imageBase64
    ? `<img class="admin-item-thumb" src="${product.imageBase64}" alt="${escapeHtml(product.name)}" />`
    : `<div class="admin-item-thumb-placeholder" aria-hidden="true">
        <svg xmlns="http:
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>`;

  return `
    <div class="admin-product-item" data-product-id="${product.id}">
      ${thumbHtml}
      <div class="admin-product-item__info">
        <p class="admin-product-item__name">${escapeHtml(product.name)}</p>
        <p class="admin-product-item__price">${escapeHtml(product.price)}</p>
      </div>
      <div class="admin-product-item__actions">
        <button
          class="btn-edit-product"
          data-product-id="${product.id}"
          aria-label="Modificar producto: ${escapeHtml(product.name)}"
        >
          <svg xmlns="http:
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Modificar
        </button>
        <button
          class="btn-delete-product"
          data-product-id="${product.id}"
          aria-label="Eliminar producto: ${escapeHtml(product.name)}"
        >
          <svg xmlns="http:
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  `;
}

function renderAdminList() {
  if (products.length === 0) {
    adminProductList.innerHTML = `
      <p class="admin-empty-msg">No hay productos registrados aún. Usa el formulario de arriba para agregar el primero.</p>
    `;
    return;
  }
  adminProductList.innerHTML = products.map(buildAdminProductItem).join('');
}

function showView(viewName) {
  const views = { main: viewMain, catalog: viewCatalog };

  Object.entries(views).forEach(([name, el]) => {
    if (name === viewName) {
      el.removeAttribute('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      el.setAttribute('hidden', '');
    }
  });
}

function openCatalog() {
  renderCatalog();
  showView('catalog');
}

function goHome() {

  window.location.href = 'index.html';
}

function toggleAccordion() {
  const isOpen = triggerBtn.getAttribute('aria-expanded') === 'true';
  triggerBtn.setAttribute('aria-expanded', String(!isOpen));
  panel.classList.toggle('is-open', !isOpen);
  chevron.classList.toggle('is-rotated', !isOpen);
}

function openAdminModal() {
  inputAdminId.value = '';
  loginErrorMsg.setAttribute('hidden', '');
  modalAdminLogin.removeAttribute('hidden');
  setTimeout(() => inputAdminId.focus(), 50);
}

function closeAdminModal() {
  modalAdminLogin.setAttribute('hidden', '');
  inputAdminId.value = '';
  loginErrorMsg.setAttribute('hidden', '');
  btnAdminLock.focus();
}

function openAdminPanel() {
  resetAdminForm();
  renderAdminList();
  modalAdminPanel.removeAttribute('hidden');

  const body = modalAdminPanel.querySelector('.admin-panel-body');
  if (body) body.scrollTop = 0;
  setTimeout(() => btnCerrarPanel.focus(), 60);
}

function closeAdminPanel() {
  modalAdminPanel.setAttribute('hidden', '');
  resetAdminForm();
  btnAdminLock.focus();
}

function handleAdminLogin(e) {
  e.preventDefault();
  const inputVal = inputAdminId.value.trim();

  if (inputVal === ADMIN_ID) {
    closeAdminModal();
    openAdminPanel();
  } else {
    loginErrorMsg.removeAttribute('hidden');
    inputAdminId.value = '';
    inputAdminId.focus();
    inputAdminId.style.borderColor = 'var(--color-accent)';
    setTimeout(() => { inputAdminId.style.borderColor = ''; }, 1500);
  }
}

function handleModalOverlayClick(e) {
  if (e.target === modalAdminLogin) closeAdminModal();

}

function handleEscapeKey(e) {
  if (e.key !== 'Escape') return;
  if (!modalAdminLogin.hasAttribute('hidden')) closeAdminModal();
  if (!modalAdminPanel.hasAttribute('hidden'))  closeAdminPanel();
}

function handleImageChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
    newProdImg.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    pendingImageBase64 = evt.target.result;

    imgPreview.src = pendingImageBase64;
    imgPreviewWrap.removeAttribute('hidden');

    fileLabelText.textContent = file.name.length > 30
      ? file.name.slice(0, 28) + '…'
      : file.name;
  };
  reader.readAsDataURL(file);
}

function clearImagePreview() {
  pendingImageBase64 = null;
  newProdImg.value = '';
  imgPreview.src = '';
  imgPreviewWrap.setAttribute('hidden', '');
  fileLabelText.textContent = 'Seleccionar imagen (opcional)';
}

function resetAdminForm() {
  formAddProduct.reset();
  clearImagePreview();
  editProdIdInput.value = '';
  addProductError.setAttribute('hidden', '');
  btnCancelEdit.setAttribute('hidden', '');
  btnAddSubmit.innerHTML = `
    <svg xmlns="http:
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    Agregar Producto
  `;
  btnAddSubmit.style.background = '';
  formSectionTitle.innerHTML = `
    <svg xmlns="http:
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    Agregar Nuevo Producto
  `;
}

function handleEditProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  newProdName.value  = product.name;
  newProdPrice.value = product.price;
  newProdDesc.value  = product.desc || '';
  editProdIdInput.value = product.id;

  if (product.imageBase64) {
    pendingImageBase64 = product.imageBase64;
    imgPreview.src = product.imageBase64;
    imgPreviewWrap.removeAttribute('hidden');
    fileLabelText.textContent = 'Imagen actual (reemplazar opcional)';
  } else {
    clearImagePreview();
  }

  formSectionTitle.innerHTML = `
    <svg xmlns="http:
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    Modificar Producto
  `;
  btnAddSubmit.innerHTML = `
    <svg xmlns="http:
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
    Guardar Cambios
  `;
  btnAddSubmit.style.background = 'linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-brand) 100%)';
  btnCancelEdit.removeAttribute('hidden');

  formAddProduct.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  newProdName.focus();
}

function handleAddProduct(e) {
  e.preventDefault();

  const name    = newProdName.value.trim();
  const price   = newProdPrice.value.trim();
  const desc    = newProdDesc.value.trim();
  const editId  = editProdIdInput.value.trim();

  if (!name || !price) {
    addProductError.removeAttribute('hidden');
    if (!name) newProdName.focus();
    else newProdPrice.focus();
    return;
  }

  addProductError.setAttribute('hidden', '');

  if (editId) {

    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        price,
        desc: desc || products[idx].desc,

        imageBase64: pendingImageBase64 !== null ? pendingImageBase64 : products[idx].imageBase64
      };
    }
    saveProducts(products);
    renderAdminList();
    resetAdminForm();

    showActionFeedback(btnAddSubmit, '¡Cambios guardados!', '#1db954', '#17943e');

  } else {

    const newProduct = {
      id: generateId(),
      name,
      desc: desc || 'Producto de seguridad. Consulta por más detalles.',
      price,
      imageBase64: pendingImageBase64 || null
    };

    products.unshift(newProduct);
    saveProducts(products);
    renderAdminList();
    resetAdminForm();
    newProdName.focus();

    showActionFeedback(btnAddSubmit, '¡Producto Agregado!', '#1db954', '#17943e');
  }
}

function showActionFeedback(btn, label, colorFrom, colorTo) {
  const originalHTML = btn.innerHTML;
  const originalBg   = btn.style.background;
  btn.innerHTML = `
    <svg xmlns="http:
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
    ${label}
  `;
  btn.style.background = `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`;
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.background = originalBg;
  }, 2200);
}

function deleteProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const confirmed = window.confirm(`¿Eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`);
  if (!confirmed) return;

  if (editProdIdInput.value === productId) resetAdminForm();

  products = products.filter(p => p.id !== productId);
  saveProducts(products);
  renderAdminList();
}

function handleAdminListClick(e) {
  const editBtn   = e.target.closest('.btn-edit-product');
  const deleteBtn = e.target.closest('.btn-delete-product');

  if (editBtn) {
    const productId = editBtn.getAttribute('data-product-id');
    if (productId) handleEditProduct(productId);
    return;
  }
  if (deleteBtn) {
    const productId = deleteBtn.getAttribute('data-product-id');
    if (productId) deleteProduct(productId);
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function initEventListeners() {

  triggerBtn.addEventListener('click', toggleAccordion);

  btnVolver.addEventListener('click', goHome);

  btnAdminLock.addEventListener('click', openAdminModal);

  btnCancelLogin.addEventListener('click', closeAdminModal);

  formAdminLogin.addEventListener('submit', handleAdminLogin);

  modalAdminLogin.addEventListener('click', handleModalOverlayClick);

  btnCerrarPanel.addEventListener('click', closeAdminPanel);

  document.addEventListener('keydown', handleEscapeKey);

  formAddProduct.addEventListener('submit', handleAddProduct);

  btnCancelEdit.addEventListener('click', resetAdminForm);

  newProdImg.addEventListener('change', handleImageChange);

  btnClearImg.addEventListener('click', clearImagePreview);

  adminProductList.addEventListener('click', handleAdminListClick);
}

function init() {

  initEventListeners();

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');

  if (viewParam === 'catalog') {

    renderCatalog();
    showView('catalog');
  } else {

    showView('main');
  }

  console.info('[Security Kosky] Linktree v3.0 inicializado correctamente. ✓');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
