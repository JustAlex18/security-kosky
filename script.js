/**
 * script.js — Security Kosky Corporate Linktree
 * Versión: 3.0 | 2026
 * Funcionalidades:
 *   - Acordeón de Redes Sociales
 *   - Catálogo activado por parámetro URL (?view=catalog)
 *   - Panel Admin como modal flotante con backdrop-blur
 *   - CRUD completo: Agregar, Modificar, Eliminar productos
 *   - Imágenes via FileReader → Base64 → localStorage
 * ─────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. CONFIGURACIÓN Y CONSTANTES
═══════════════════════════════════════════════════════════════ */

/** ID de administrador requerido para acceder al panel */
const ADMIN_ID = 'SK-2026';

/** Clave de localStorage para persistir productos */
const STORAGE_KEY = 'sk_products_v2';

/** Número de teléfono de WhatsApp de la empresa */
const WA_NUMBER = '584141364498';

/**
 * Productos de demostración iniciales.
 * Solo se usan si localStorage no contiene datos previos.
 */
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


/* ═══════════════════════════════════════════════════════════════
   2. SELECTORES DE ELEMENTOS DEL DOM
═══════════════════════════════════════════════════════════════ */

// Vistas principales
const viewMain    = document.getElementById('view-main');
const viewCatalog = document.getElementById('view-catalog');

// Botones de navegación — tarjeta principal
// (btn-catalogo es ahora un <a>, no un <button>)
const btnAdminLock = document.getElementById('btn-admin-lock');

// Acordeón de redes sociales
const triggerBtn = document.getElementById('btn-redes');
const panel      = document.getElementById('redes-panel');
const chevron    = triggerBtn.querySelector('.accordion__chevron');

// Botón Volver del catálogo
const btnVolver = document.getElementById('btn-volver');

// Cuadrícula de productos del catálogo
const productsGrid = document.getElementById('products-grid');

// Modal de login admin
const modalAdminLogin  = document.getElementById('modal-admin-login');
const formAdminLogin   = document.getElementById('form-admin-login');
const inputAdminId     = document.getElementById('input-admin-id');
const btnCancelLogin   = document.getElementById('btn-cancel-login');
const loginErrorMsg    = document.getElementById('login-error-msg');

// Modal Panel de Control Admin (nueva modal flotante)
const modalAdminPanel  = document.getElementById('modal-admin-panel');
const btnCerrarPanel   = document.getElementById('btn-cerrar-panel');

// Panel de admin — formulario de agregar / editar producto
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

// Campo de imagen
const newProdImg        = document.getElementById('new-prod-img');
const imgPreviewWrap    = document.getElementById('img-preview-wrap');
const imgPreview        = document.getElementById('img-preview');
const btnClearImg       = document.getElementById('btn-clear-img');
const fileLabelText     = document.getElementById('file-label-text');

/** Base64 de la imagen actualmente seleccionada en el formulario (null = sin imagen) */
let pendingImageBase64 = null;


/* ═══════════════════════════════════════════════════════════════
   3. GESTIÓN DE PRODUCTOS — LocalStorage
═══════════════════════════════════════════════════════════════ */

/**
 * Carga los productos desde localStorage.
 * Si no hay datos, retorna los productos de demostración.
 * @returns {Array} Array de objetos de producto
 */
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
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)); // copia profunda
}

/**
 * Guarda el array de productos en localStorage.
 * @param {Array} products - Array de productos a persistir
 */
function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('[SK] Error guardando en localStorage.', e);
  }
}

/**
 * Genera un ID único para un nuevo producto.
 * @returns {string} ID único basado en timestamp
 */
function generateId() {
  return 'prod-' + Date.now().toString(36);
}

/** Estado reactivo de productos (array en memoria) */
let products = loadProducts();


/* ═══════════════════════════════════════════════════════════════
   4. RENDERIZADO DEL CATÁLOGO
═══════════════════════════════════════════════════════════════ */

/**
 * Construye el HTML de placeholder de imagen para una tarjeta.
 * @returns {string} HTML del placeholder
 */
function buildImagePlaceholder() {
  return `
    <div class="product-img-placeholder" aria-label="Imagen del producto no disponible" role="img">
      <div class="product-img-placeholder__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>
      <span>Imagen del Producto</span>
    </div>
  `;
}

/**
 * Construye el HTML completo de una tarjeta de producto.
 * Si el producto tiene imagen guardada en Base64, la muestra;
 * si no, usa el placeholder gris por defecto.
 * @param {Object} product - Objeto producto {id, name, desc, price, imageBase64?}
 * @returns {string} HTML de la tarjeta
 */
function buildProductCard(product) {
  const waMsg = encodeURIComponent(
    `Hola Security Kosky, estoy interesado/a en el producto: *${product.name}* (${product.price}). ¿Podrían darme más información?`
  );
  const waHref = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  // Imagen: Base64 guardada o placeholder CSS
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Solicitar por WhatsApp
        </a>
      </div>
    </article>
  `;
}

/**
 * Renderiza todos los productos en la cuadrícula del catálogo.
 */
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


/* ═══════════════════════════════════════════════════════════════
   5. RENDERIZADO DEL PANEL ADMIN
═══════════════════════════════════════════════════════════════ */

/**
 * Construye el HTML de un ítem de producto en el inventario admin.
 * Incluye miniatura de imagen (real o placeholder), botones Modificar y Eliminar.
 * @param {Object} product
 * @returns {string}
 */
function buildAdminProductItem(product) {
  // Miniatura: imagen real o icono placeholder
  const thumbHtml = product.imageBase64
    ? `<img class="admin-item-thumb" src="${product.imageBase64}" alt="${escapeHtml(product.name)}" />`
    : `<div class="admin-item-thumb-placeholder" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Modificar
        </button>
        <button
          class="btn-delete-product"
          data-product-id="${product.id}"
          aria-label="Eliminar producto: ${escapeHtml(product.name)}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza la lista de productos en el panel de administración.
 */
function renderAdminList() {
  if (products.length === 0) {
    adminProductList.innerHTML = `
      <p class="admin-empty-msg">No hay productos registrados aún. Usa el formulario de arriba para agregar el primero.</p>
    `;
    return;
  }
  adminProductList.innerHTML = products.map(buildAdminProductItem).join('');
}


/* ═══════════════════════════════════════════════════════════════
   6. NAVEGACIÓN ENTRE VISTAS + GESTIÓN DE URL
═══════════════════════════════════════════════════════════════ */

/**
 * Muestra una vista (main o catalog) y oculta la otra.
 * El panel admin ya no es una vista de página: es una modal.
 * @param {'main'|'catalog'} viewName
 */
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

/**
 * Abre el catálogo añadiendo '?view=catalog' a la URL.
 * El enlace <a href="?view=catalog"> ya lo hace de forma nativa;
 * esta función se usa si se necesita activar el catálogo desde JS.
 */
function openCatalog() {
  renderCatalog();
  showView('catalog');
}

/**
 * Vuelve a la tarjeta principal.
 * Navega a index.html limpio para que la detección del parámetro
 * URL se ejecute de nuevo correctamente al cargar la página.
 */
function goHome() {
  // Redirigir a index.html sin parámetros para recargar la vista principal
  window.location.href = 'index.html';
}


/* ═══════════════════════════════════════════════════════════════
   7. ACORDEÓN DE REDES SOCIALES
═══════════════════════════════════════════════════════════════ */

/**
 * Alterna el estado del acordeón de redes sociales.
 * Controla aria-expanded, la clase is-open y la rotación del chevron.
 */
function toggleAccordion() {
  const isOpen = triggerBtn.getAttribute('aria-expanded') === 'true';
  triggerBtn.setAttribute('aria-expanded', String(!isOpen));
  panel.classList.toggle('is-open', !isOpen);
  chevron.classList.toggle('is-rotated', !isOpen);
}


/* ═══════════════════════════════════════════════════════════════
   8. SISTEMA DE AUTENTICACIÓN ADMIN
═══════════════════════════════════════════════════════════════ */

/**
 * Abre el modal de login de administrador.
 */
function openAdminModal() {
  inputAdminId.value = '';
  loginErrorMsg.setAttribute('hidden', '');
  modalAdminLogin.removeAttribute('hidden');
  setTimeout(() => inputAdminId.focus(), 50);
}

/**
 * Cierra el modal de login de administrador.
 */
function closeAdminModal() {
  modalAdminLogin.setAttribute('hidden', '');
  inputAdminId.value = '';
  loginErrorMsg.setAttribute('hidden', '');
  btnAdminLock.focus();
}

/**
 * Abre la modal flotante del Panel de Control.
 * Renderiza el inventario y resetea el formulario a modo "Agregar".
 */
function openAdminPanel() {
  resetAdminForm();        // asegura que esté en modo "Agregar"
  renderAdminList();
  modalAdminPanel.removeAttribute('hidden');
  // Scroll interno al inicio del panel
  const body = modalAdminPanel.querySelector('.admin-panel-body');
  if (body) body.scrollTop = 0;
  setTimeout(() => btnCerrarPanel.focus(), 60);
}

/**
 * Cierra la modal flotante del Panel de Control.
 */
function closeAdminPanel() {
  modalAdminPanel.setAttribute('hidden', '');
  resetAdminForm();
  btnAdminLock.focus();
}

/**
 * Valida el ID de administrador enviado.
 * Si es correcto, cierra el modal de login y abre la modal del panel.
 * @param {Event} e
 */
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

/**
 * Cierra el modal de login si el usuario hace clic en el overlay.
 */
function handleModalOverlayClick(e) {
  if (e.target === modalAdminLogin) closeAdminModal();
  // El panel admin NO se cierra al hacer clic fuera (evitar pérdida accidental)
}

/**
 * Cierra modales activos con la tecla Escape.
 * @param {KeyboardEvent} e
 */
function handleEscapeKey(e) {
  if (e.key !== 'Escape') return;
  if (!modalAdminLogin.hasAttribute('hidden')) closeAdminModal();
  if (!modalAdminPanel.hasAttribute('hidden'))  closeAdminPanel();
}


/* ═══════════════════════════════════════════════════════════════
   9. GESTIÓN DE IMÁGENES — FileReader / Base64
═══════════════════════════════════════════════════════════════ */

/**
 * Procesa el archivo seleccionado en el input de imagen.
 * Usa FileReader para convertir a Base64 y mostrar el preview.
 * @param {Event} e
 */
function handleImageChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // Solo aceptar imágenes
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
    newProdImg.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    pendingImageBase64 = evt.target.result;
    // Mostrar preview
    imgPreview.src = pendingImageBase64;
    imgPreviewWrap.removeAttribute('hidden');
    // Actualizar texto del label
    fileLabelText.textContent = file.name.length > 30
      ? file.name.slice(0, 28) + '…'
      : file.name;
  };
  reader.readAsDataURL(file);
}

/**
 * Limpia la imagen seleccionada y resetea el preview.
 */
function clearImagePreview() {
  pendingImageBase64 = null;
  newProdImg.value = '';
  imgPreview.src = '';
  imgPreviewWrap.setAttribute('hidden', '');
  fileLabelText.textContent = 'Seleccionar imagen (opcional)';
}


/* ═══════════════════════════════════════════════════════════════
   10. GESTIÓN DE PRODUCTOS (CRUD)
═══════════════════════════════════════════════════════════════ */

/**
 * Resetea el formulario admin a su estado inicial (modo "Agregar").
 * Limpia campos, imagen pendiente y oculta el botón Cancelar edición.
 */
function resetAdminForm() {
  formAddProduct.reset();
  clearImagePreview();
  editProdIdInput.value = '';
  addProductError.setAttribute('hidden', '');
  btnCancelEdit.setAttribute('hidden', '');
  btnAddSubmit.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    Agregar Producto
  `;
  btnAddSubmit.style.background = '';
  formSectionTitle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    Agregar Nuevo Producto
  `;
}

/**
 * Carga los datos de un producto en el formulario para editarlos.
 * Activa el modo edición (cambia título, botón y muestra Cancelar).
 * @param {string} productId
 */
function handleEditProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Rellenar campos
  newProdName.value  = product.name;
  newProdPrice.value = product.price;
  newProdDesc.value  = product.desc || '';
  editProdIdInput.value = product.id;

  // Si tiene imagen guardada, mostrar el preview
  if (product.imageBase64) {
    pendingImageBase64 = product.imageBase64;
    imgPreview.src = product.imageBase64;
    imgPreviewWrap.removeAttribute('hidden');
    fileLabelText.textContent = 'Imagen actual (reemplazar opcional)';
  } else {
    clearImagePreview();
  }

  // Cambiar modo visual del formulario
  formSectionTitle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    Modificar Producto
  `;
  btnAddSubmit.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
    Guardar Cambios
  `;
  btnAddSubmit.style.background = 'linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-brand) 100%)';
  btnCancelEdit.removeAttribute('hidden');

  // Scroll suave al formulario dentro del panel
  formAddProduct.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  newProdName.focus();
}

/**
 * Maneja el submit del formulario en modo Agregar o Modificar.
 * Detecta el modo por el campo oculto edit-prod-id.
 * Guarda imagen Base64 si hay una pendiente.
 * @param {Event} e
 */
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
    // ── MODO EDICIÓN: actualizar producto existente ──
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        price,
        desc: desc || products[idx].desc,
        // Si hay nueva imagen pendiente, reemplazar; si no, mantener la anterior
        imageBase64: pendingImageBase64 !== null ? pendingImageBase64 : products[idx].imageBase64
      };
    }
    saveProducts(products);
    renderAdminList();
    resetAdminForm();

    // Feedback
    showActionFeedback(btnAddSubmit, '¡Cambios guardados!', '#1db954', '#17943e');

  } else {
    // ── MODO AGREGAR: crear nuevo producto ──
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

    // Feedback
    showActionFeedback(btnAddSubmit, '¡Producto Agregado!', '#1db954', '#17943e');
  }
}

/**
 * Muestra feedback visual temporal en un botón.
 * @param {HTMLElement} btn
 * @param {string} label
 * @param {string} colorFrom
 * @param {string} colorTo
 */
function showActionFeedback(btn, label, colorFrom, colorTo) {
  const originalHTML = btn.innerHTML;
  const originalBg   = btn.style.background;
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
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

/**
 * Elimina un producto por su ID con confirmación.
 * @param {string} productId
 */
function deleteProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const confirmed = window.confirm(`¿Eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`);
  if (!confirmed) return;

  // Si se estaba editando este producto, resetear el form
  if (editProdIdInput.value === productId) resetAdminForm();

  products = products.filter(p => p.id !== productId);
  saveProducts(products);
  renderAdminList();
}

/**
 * Delegación de eventos para el inventario admin.
 * Detecta clics en Modificar y Eliminar.
 * @param {Event} e
 */
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


/* ═══════════════════════════════════════════════════════════════
   10. UTILIDADES
═══════════════════════════════════════════════════════════════ */

/**
 * Escapa caracteres HTML para prevenir XSS al inyectar texto en el DOM.
 * @param {string} str - String a escapar
 * @returns {string} String seguro para HTML
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}


/* ═══════════════════════════════════════════════════════════════
   11. REGISTRO DE EVENT LISTENERS
═══════════════════════════════════════════════════════════════ */

/**
 * Inicializa todos los event listeners de la aplicación.
 * Se llama una sola vez al cargar el DOM.
 */
function initEventListeners() {

  // ── Acordeón redes sociales ──
  triggerBtn.addEventListener('click', toggleAccordion);

  // ── Botón Volver del catálogo: limpia URL y vuelve al inicio ──
  btnVolver.addEventListener('click', goHome);

  // ── Candado Admin: Abrir modal de login ──
  btnAdminLock.addEventListener('click', openAdminModal);

  // ── Modal login: Cancelar ──
  btnCancelLogin.addEventListener('click', closeAdminModal);

  // ── Modal login: Submit ──
  formAdminLogin.addEventListener('submit', handleAdminLogin);

  // ── Modal login: Clic en overlay ──
  modalAdminLogin.addEventListener('click', handleModalOverlayClick);

  // ── Modal panel admin: Botón Cerrar Panel ──
  btnCerrarPanel.addEventListener('click', closeAdminPanel);

  // ── Tecla Escape — cierra cualquier modal activo ──
  document.addEventListener('keydown', handleEscapeKey);

  // ── Formulario admin: Agregar / Guardar cambios ──
  formAddProduct.addEventListener('submit', handleAddProduct);

  // ── Formulario admin: Cancelar edición ──
  btnCancelEdit.addEventListener('click', resetAdminForm);

  // ── Campo de imagen: FileReader ──
  newProdImg.addEventListener('change', handleImageChange);

  // ── Botón quitar imagen ──
  btnClearImg.addEventListener('click', clearImagePreview);

  // ── Lista de inventario admin: Modificar y Eliminar (delegación) ──
  adminProductList.addEventListener('click', handleAdminListClick);
}


/* ═══════════════════════════════════════════════════════════════
   12. INICIALIZACIÓN + DETECCIÓN DE PARÁMETRO URL
═══════════════════════════════════════════════════════════════ */

/**
 * Punto de entrada de la aplicación.
 * Detecta el parámetro ?view=catalog en la URL para mostrar
 * el catálogo directamente sin pasar por la tarjeta principal.
 */
function init() {
  // Registrar todos los listeners primero
  initEventListeners();

  // ── Detección de parámetro URL ──
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');

  if (viewParam === 'catalog') {
    // URL contiene ?view=catalog → mostrar catálogo directamente
    renderCatalog();
    showView('catalog');
  } else {
    // Vista por defecto: tarjeta principal
    showView('main');
  }

  console.info('[Security Kosky] Linktree v3.0 inicializado correctamente. ✓');
}

// Ejecutar init cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
