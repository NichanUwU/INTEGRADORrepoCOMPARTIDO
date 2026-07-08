/* ============================================================
   SOFI — Software Operativo para Fincas e Inmuebles
   app.js (funcional)

   Script compartido para las páginas HTML reales en pages/.
   Maneja autenticación básica, navegación y carga de datos desde
   los endpoints del backend.
   ============================================================ */

const APP_STORAGE_KEY = 'sofi-user';
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'http://54.208.140.131:3000/api';

const roleMeta = {
  directivo: { label: 'Directivo', badge: 'DG', name: 'Dir. González' },
  vendedor: { label: 'Vendedor', badge: 'MR', name: 'M. Rodríguez' },
  asistente: { label: 'Asistente', badge: 'AP', name: 'A. Pérez' },
};

const navConfig = {
  directivo: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'desarrollos', label: 'Desarrollos', icon: '🏘', href: 'desarrollos.html' },
    { id: 'lotes', label: 'Lotes', icon: '🗂', href: 'lotes.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
    { id: 'flujo', label: 'Flujo de Efectivo', icon: '💰', href: 'flujo.html' },
    { id: 'analisis', label: 'Análisis Financiero', icon: '📈', href: 'analisis.html' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', href: 'usuarios.html' },
    { id: 'roles', label: 'Roles', icon: '🔑', href: 'roles.html' },
  ],
  vendedor: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
    { id: 'lotes', label: 'Lotes', icon: '🗂', href: 'lotes.html' },
  ],
  asistente: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'desarrollos', label: 'Desarrollos', icon: '🏘', href: 'desarrollos.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
  ],
};

const pageLabels = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  contratos: 'Contratos',
  desarrollos: 'Desarrollos',
  lotes: 'Lotes',
  analisis: 'Análisis Financiero',
  flujo: 'Flujo de Efectivo',
  usuarios: 'Usuarios',
  roles: 'Roles',
  login: 'Login',
};

let currentRole = 'directivo';

function normalizeRole(role) {
  const value = (role || '').toLowerCase();
  if (['directivo', 'director', 'admin', 'administrador'].includes(value)) return 'directivo';
  if (['vendedor', 'seller', 'ventas'].includes(value)) return 'vendedor';
  if (['asistente', 'assistant', 'soporte'].includes(value)) return 'asistente';
  return 'directivo';
}

function getCurrentPageName() {
  const path = window.location.pathname.split('/').pop() || 'dashboard.html';
  return path.replace('.html', '');
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(APP_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function saveStoredUser(user) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(APP_STORAGE_KEY);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('sidebar-scrim');
  if (!sidebar || !scrim) return;

  const isOpen = sidebar.classList.toggle('open');
  scrim.style.display = isOpen ? 'block' : 'none';
}

function showModal(modalId) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  root.innerHTML = `
    <div class="modal-backdrop" onclick="this.remove()">
      <div class="modal-card" onclick="event.stopPropagation()">
        <h3>SOFI</h3>
        <p>El módulo de alertas y notificaciones ya está conectado al shell compartido.</p>
        <button type="button" class="btn-primary" onclick="this.closest('.modal-backdrop').remove()">Cerrar</button>
      </div>
    </div>
  `;
}

function selectRole(role, button) {
  currentRole = normalizeRole(role);
  document.querySelectorAll('.role-btn').forEach((item) => {
    const isActive = item.dataset.role === currentRole;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });

  if (button) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  }
}

function renderNav(role) {
  const nav = document.getElementById('sb-nav');
  if (!nav) return;

  const items = navConfig[role] || navConfig.directivo;
  nav.innerHTML = items.map((item) => {
    const isActive = getCurrentPageName() === item.id;
    return `
      <a href="${item.href}" class="sidebar-nav-item ${isActive ? 'active' : ''}">
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  }).join('');
}

function applyShellVisibility() {
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app-shell');

  if (!loginScreen || !appShell) return;

  const isLogin = getCurrentPageName() === 'login';
  loginScreen.style.display = isLogin ? 'flex' : 'none';
  appShell.style.display = isLogin ? 'none' : 'flex';
}

function updateShell(user) {
  const role = normalizeRole(user?.role || user?.Rol || currentRole);
  const meta = roleMeta[role] || roleMeta.directivo;

  const badge = document.getElementById('sb-role-badge');
  const avatar = document.getElementById('sb-avatar');
  const name = document.getElementById('sb-name');
  const roleLabel = document.getElementById('sb-role');

  if (badge) badge.textContent = meta.label;
  if (avatar) avatar.textContent = meta.badge;
  if (name) name.textContent = user?.Empleado || meta.name;
  if (roleLabel) roleLabel.textContent = meta.label;

  const breadcrumb = document.querySelector('#breadcrumb .current');
  if (breadcrumb) {
    breadcrumb.textContent = pageLabels[getCurrentPageName()] || 'Inicio';
  }

  renderNav(role);
  currentRole = role;
}

function fetchJson(url, options = {}) {
  return fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(async (response) => {
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(payload?.mensaje || payload?.error || 'Solicitud fallida');
    }

    return payload;
  });
}

function renderDashboard(container) {
  Promise.all([
    fetchJson(`${API_URL}/clientes`),
    fetchJson(`${API_URL}/lotes`),
    fetchJson(`${API_URL}/contratos`),
    fetchJson(`${API_URL}/desarrollos`),
  ])
    .then(([clientes, lotes, contratos, desarrollos]) => {
      const cards = [
        { label: 'Clientes', value: clientes.length, tone: 'var(--c-primary)' },
        { label: 'Lotes', value: lotes.length, tone: 'var(--c-accent)' },
        { label: 'Contratos', value: contratos.length, tone: 'var(--c-warn)' },
        { label: 'Desarrollos', value: desarrollos.length, tone: '#9C27B0' },
      ];

      container.innerHTML = `
        <section class="kpi-grid">
          ${cards.map((card) => `
            <div class="kpi-card" style="border-left-color:${card.tone}">
              <div class="kpi-label">${card.label}</div>
              <div class="kpi-value">${card.value}</div>
              <div class="kpi-trend trend-up">Datos cargados desde el backend</div>
            </div>
          `).join('')}
        </section>
        <section class="chart-card" style="margin-top:20px">
          <div class="chart-title">Estado del módulo</div>
          <p style="color:var(--c-muted);line-height:1.6">
            El frontend ya está preparado para consumir los endpoints de clientes, lotes, contratos y desarrollos.
            Cada vista puede extenderse con formularios y acciones CRUD según lo necesites.
          </p>
        </section>
      `;
    })
    .catch((error) => {
      container.innerHTML = `<div class="feedback error">${error.message}</div>`;
    });
}

function renderSimpleList(container, title, endpoint, columns, emptyMessage) {
  fetchJson(`${API_URL}/${endpoint}`)
    .then((items) => {
      const rows = Array.isArray(items) && items.length
        ? items.map((item) => `
            <tr>
              ${columns.map((column) => `<td>${item[column.key] ?? '-'}</td>`).join('')}
            </tr>
          `).join('')
        : `<tr><td colspan="${columns.length}" style="text-align:center">${emptyMessage}</td></tr>`;

      container.innerHTML = `
        <section class="card">
          <h2>${title}</h2>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  ${columns.map((column) => `<th>${column.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>
      `;
    })
    .catch((error) => {
      container.innerHTML = `<div class="feedback error">${error.message}</div>`;
    });
}

function renderClientes(container) {
  renderSimpleList(container, 'Clientes', 'clientes', [
    { key: 'IdCliente', label: 'ID' },
    { key: 'Nombre', label: 'Nombre' },
    { key: 'Telefono', label: 'Teléfono' },
    { key: 'Direccion', label: 'Dirección' },
  ], 'No hay clientes registrados.');
}

function renderContratos(container) {
  renderSimpleList(container, 'Contratos', 'contratos', [
    { key: 'IdContrato', label: 'ID' },
    { key: 'Fecha', label: 'Fecha' },
    { key: 'Cliente', label: 'Cliente' },
    { key: 'Vendedor', label: 'Vendedor' },
    { key: 'Lote', label: 'Lote' },
  ], 'No hay contratos registrados.');
}

function renderDesarrollos(container) {
  renderSimpleList(container, 'Desarrollos', 'desarrollos', [
    { key: 'IdDesarrollo', label: 'ID' },
    { key: 'Nombre', label: 'Nombre' },
    { key: 'Ubicacion', label: 'Ubicación' },
  ], 'No hay desarrollos registrados.');
}

function renderLotes(container) {
  renderSimpleList(container, 'Lotes', 'lotes', [
    { key: 'IdLote', label: 'ID' },
    { key: 'Numero', label: 'Número' },
    { key: 'Estado', label: 'Estado' },
    { key: 'Precio', label: 'Precio' },
  ], 'No hay lotes registrados.');
}

function renderPlaceholder(container, title, description) {
  container.innerHTML = `
    <section class="card">
      <h2>${title}</h2>
      <p style="color:var(--c-muted);line-height:1.6">${description}</p>
    </section>
  `;
}

function renderPageContent() {
  const container = document.getElementById('page-content');
  if (!container) return;

  const pageName = getCurrentPageName();
  switch (pageName) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'clientes':
      renderClientes(container);
      break;
    case 'contratos':
      renderContratos(container);
      break;
    case 'desarrollos':
      renderDesarrollos(container);
      break;
    case 'lotes':
      renderLotes(container);
      break;
    case 'analisis':
      renderPlaceholder(container, 'Análisis Financiero', 'La vista está lista para conectarse a métricas financieras reales.');
      break;
    case 'flujo':
      renderPlaceholder(container, 'Flujo de Efectivo', 'Este módulo puede integrarse con reportes de ingresos y egresos del backend.');
      break;
    case 'usuarios':
      renderPlaceholder(container, 'Usuarios', 'Se puede conectar a un endpoint de usuarios cuando esté disponible.');
      break;
    case 'roles':
      renderPlaceholder(container, 'Roles', 'La administración de roles puede extenderse desde aquí cuando se agregue el endpoint correspondiente.');
      break;
    default:
      renderPlaceholder(container, 'SOFI', 'Sección sin contenido aún.');
      break;
  }
}

function doLogin(event) {
  if (event) event.preventDefault();

  const email = document.getElementById('login-email')?.value || '';
  const password = document.getElementById('login-password')?.value || '';
  const errorBox = document.getElementById('login-error');

  if (!email || !password) {
    if (errorBox) errorBox.textContent = 'Completa correo y contraseña.';
    return;
  }

  fetchJson(`${API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ NombreUsuario: email, Contrasena: password }),
  })
    .then((user) => {
      const mappedUser = {
        ...user,
        role: normalizeRole(user?.Rol || currentRole),
        email,
      };
      saveStoredUser(mappedUser);
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      if (errorBox) errorBox.textContent = error.message;
    });
}

function doLogout() {
  clearStoredUser();
  window.location.href = 'login.html';
}

function initApp() {
  applyShellVisibility();

  const storedUser = getStoredUser();
  const pageName = getCurrentPageName();

  if (pageName === 'login') {
    const selectedRole = storedUser?.role || currentRole;
    selectRole(selectedRole);
    return;
  }

  if (!storedUser) {
    window.location.href = 'login.html';
    return;
  }

  updateShell(storedUser);
  renderPageContent();
}

window.selectRole = selectRole;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.toggleSidebar = toggleSidebar;
window.showModal = showModal;

document.addEventListener('DOMContentLoaded', initApp);
