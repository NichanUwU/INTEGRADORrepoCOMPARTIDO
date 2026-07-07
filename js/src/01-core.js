/* ============================================================
   SOFI · NÚCLEO DE LA APLICACIÓN
   Estado global, autenticación, navegación y router de vistas.
   ============================================================ */

/* ---- CONFIGURACIÓN API ---- */
// Reemplaza esto con la IP pública real de tu servidor AWS
const API_URL = 'http://54.208.140.131:3000/api';

/* ---- ESTADO ---- */
let currentRole = 'directivo';
let currentView = 'dashboard';

/* ---- METADATOS DE ROL ---- */
const roleMeta = {
  directivo: { label: 'Directivo', badge: 'DG', name: 'Dir. González' },
  vendedor:  { label: 'Vendedor',  badge: 'MR', name: 'M. Rodríguez' },
  asistente: { label: 'Asistente', badge: 'AP', name: 'A. Pérez' },
};

/* ---- CONFIGURACIÓN DE NAVEGACIÓN POR ROL ---- */
const navConfig = {
  directivo: [
    { section: 'PRINCIPAL', items: [{ id: 'dashboard', icon: '📊', label: 'Dashboard' }] },
    { section: 'INMUEBLES', items: [
      { id: 'desarrollos', icon: '🏘', label: 'Desarrollos' },
      { id: 'lotes',       icon: '🗂', label: 'Lotes' },
    ]},
    { section: 'COMERCIAL', items: [
      { id: 'clientes',  icon: '👥', label: 'Clientes' },
      { id: 'contratos', icon: '📄', label: 'Contratos' },
    ]},
    { section: 'FINANZAS', items: [
      { id: 'flujo',    icon: '💰', label: 'Flujo de Efectivo' },
      { id: 'analisis', icon: '📈', label: 'Análisis Financiero' },
    ]},
    { section: 'ADMINISTRACIÓN', items: [
      { id: 'usuarios', icon: '👤', label: 'Usuarios' },
      { id: 'roles',    icon: '🔑', label: 'Roles' },
    ]},
  ],
  vendedor: [
    { section: 'PRINCIPAL', items: [{ id: 'dashboard', icon: '📊', label: 'Mi Dashboard' }] },
    { section: 'VENTAS', items: [
      { id: 'clientes',  icon: '👥', label: 'Mis Clientes' },
      { id: 'lotes',     icon: '🗂', label: 'Lotes Disponibles' },
      { id: 'contratos', icon: '📄', label: 'Mis Contratos' },
    ]},
  ],
  asistente: [
    { section: 'PRINCIPAL', items: [{ id: 'dashboard', icon: '📊', label: 'Dashboard' }] },
    { section: 'OPERATIVO', items: [
      { id: 'flujo',    icon: '💰', label: 'Flujo de Efectivo' },
      { id: 'clientes', icon: '👥', label: 'Clientes' },
      { id: 'testigos', icon: '📝', label: 'Testigos' },
    ]},
  ],
};

/* Etiquetas de breadcrumb */
const viewLabels = {
  dashboard: 'Dashboard',
  desarrollos: 'Desarrollos', 'crear-desarrollo': 'Nuevo Desarrollo', 'detalle-desarrollo': 'Detalle de Desarrollo',
  lotes: 'Lotes', 'crear-lote': 'Nuevo Lote', 'detalle-lote': 'Detalle de Lote',
  clientes: 'Clientes', 'crear-cliente': 'Nuevo Cliente', 'detalle-cliente': 'Detalle de Cliente',
  contratos: 'Contratos', 'crear-contrato': 'Nuevo Contrato', 'detalle-contrato': 'Detalle de Contrato',
  flujo: 'Flujo de Efectivo', 'detalle-flujo': 'Detalle de Movimiento', 'registrar-pago': 'Registrar Pago', 'detalle-pago': 'Detalle de Pago',
  analisis: 'Análisis Financiero',
  usuarios: 'Usuarios', 'crear-usuario': 'Nuevo Usuario',
  roles: 'Roles', 'crear-rol': 'Nuevo Rol',
  testigos: 'Testigos', 'crear-testigo': 'Nuevo Testigo',
  simulador: 'Simulador de Financiamiento',
  'design-system': 'Sistema de Diseño',
};

const standalonePageMap = {
  dashboard: 'dashboard', desarrollos: 'desarrollos', lotes: 'lotes', clientes: 'clientes', 
  contratos: 'contratos', flujo: 'flujo', analisis: 'analisis', usuarios: 'usuarios', 
  roles: 'roles', 'design-system': 'design-system'
};

const standalonePageFiles = Object.keys(standalonePageMap).reduce((acc, key) => {
  acc[key] = `${key}.html`;
  return acc;
}, { login: 'login.html' });

/* ---- FUNCIONES DE INICIO ---- */
function getCurrentStandalonePage() {
  const path = window.location.pathname.split('/').pop() || '';
  return path.replace(/\.html$/i, '') || 'login';
}

function setRoleUI() {
  const m = roleMeta[currentRole] || roleMeta.directivo;
  const setTxt = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };
  setTxt('sb-role-badge', m.label);
  setTxt('sb-avatar', m.badge);
  setTxt('sb-name', m.name);
  setTxt('sb-role', m.label);
}

function getPageTarget(viewId) {
  return standalonePageFiles[viewId] || `${viewId}.html`;
}

function initStandalonePage() {
  const pageName = getCurrentStandalonePage();
  if (pageName === 'login') return;

  currentRole = sessionStorage.getItem('sofi-role') || 'directivo';
  
  document.getElementById('app-shell')?.classList.add('visible');
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'none';
  
  setRoleUI();
  buildNav();
  navigate(standalonePageMap[pageName] || 'dashboard');
}

/* ---- LOGIN / LOGOUT CON API (AWS) ---- */
function selectRole(role, el) {
  currentRole = role;
  sessionStorage.setItem('sofi-role', role);
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
}

async function doLogin() {
  const emailInput = document.getElementById('login-email');
  const errorBox   = document.getElementById('login-error');

  const showError = (msg) => {
    if (errorBox) { errorBox.textContent = msg; errorBox.classList.add('visible'); }
  };

  if (!emailInput?.value.trim()) {
    showError('Ingresa tu correo electrónico (NombreUsuario) para continuar.');
    emailInput?.focus();
    return;
  }

  try {
    // Aquí mandamos el usuario a Javalin (Contraseña quemada por ahora, hasta que agregues el input visual)
    const payload = {
      NombreUsuario: emailInput.value.trim(),
      Contrasena: "TuContrasenaAqui123" 
    };

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Credenciales incorrectas');

    const usuario = await response.json();
    currentRole = usuario.Rol.toLowerCase(); // Guarda si es directivo, vendedor o asistente
    sessionStorage.setItem('sofi-role', currentRole);

    errorBox?.classList.remove('visible');
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell')?.classList.add('visible');
    
    setRoleUI();
    buildNav();
    window.location.href = 'dashboard.html';

  } catch (error) {
    showError(error.message || 'Error al conectar con el servidor.');
  }
}

function doLogout() {
  sessionStorage.removeItem('sofi-role');
  document.getElementById('app-shell')?.classList.remove('visible');
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-scrim')?.classList.remove('visible');
  
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'flex';
  window.location.href = 'login.html';
}

/* ---- SIDEBAR: CONSTRUCCIÓN Y TOGGLE MÓVIL ---- */
function buildNav() {
  const nav = document.getElementById('sb-nav');
  if (!nav) return;
  nav.innerHTML = '';
  
  navConfig[currentRole].forEach(section => {
    const lbl = document.createElement('div');
    lbl.className = 'nav-section-label';
    lbl.textContent = section.section;
    nav.appendChild(lbl);
    
    section.items.forEach(item => {
      const anchor = document.createElement('a');
      anchor.className = 'nav-item';
      anchor.dataset.id = item.id;
      anchor.setAttribute('href', getPageTarget(item.id));
      anchor.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
      anchor.addEventListener('click', closeSidebarOnMobile);
      nav.appendChild(anchor);
    });
  });
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-scrim')?.classList.toggle('visible');
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-scrim')?.classList.remove('visible');
  }
}

/* ---- NAVEGACIÓN ---- */
function navigate(viewId, subLabel) {
  currentView = viewId;
  
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.id === viewId);
  });

  const lbl = subLabel || viewLabels[viewId] || viewId;
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `<span>SOFI</span><span class="sep">›</span><span class="current">${lbl}</span>`;
  }

  const pc = document.getElementById('page-content');
  if (pc) {
    pc.innerHTML = renderView(viewId);
    pc.scrollTop = 0;
  }
}

/* Alias retro-compatible usado por algunas vistas heredadas */
const navigate2 = (viewId, sub) => navigate(viewId, sub);

/* ---- ENRUTADOR DE VISTAS ---- */
function renderView(id) {
  if (id === 'design-system') return viewDesignSystem();

  const r = currentRole;
  if (r === 'directivo') {
    switch (id) {
      case 'dashboard':          return viewDirectivoDashboard();
      case 'desarrollos':        return viewDesarrollos();
      case 'lotes':              return viewLotes();
      case 'clientes':           return viewClientes();
      case 'contratos':          return viewContratos();
      case 'flujo':              return viewFlujo();
      case 'analisis':           return viewAnalisis();
      case 'usuarios':           return viewUsuarios();
      case 'roles':              return viewRoles();
      case 'crear-desarrollo':   return viewCrearDesarrollo();
      case 'detalle-desarrollo': return viewDetalleDesarrollo();
      case 'crear-lote':         return viewCrearLote();
      case 'detalle-lote':       return viewDetalleLote();
      case 'crear-cliente':      return viewCrearCliente();
      case 'detalle-cliente':    return viewDetalleCliente();
      case 'crear-contrato':     return viewCrearContrato();
      case 'detalle-contrato':   return viewDetalleContrato();
      case 'crear-usuario':      return viewCrearUsuario();
      case 'crear-rol':          return viewCrearRol();
      case 'detalle-flujo':      return viewDetalleFlujo();
      default:                   return viewDirectivoDashboard();
    }
  }
  if (r === 'vendedor') {
    switch (id) {
      case 'clientes':           return viewVendedorClientes();
      case 'lotes':              return viewVendedorLotes();
      case 'contratos':          return viewVendedorContratos();
      case 'crear-cliente':      return viewCrearClienteVend();
      case 'simulador':          return viewSimulador();
      case 'detalle-contrato':   return viewDetalleContrato();
      case 'crear-contrato':     return viewCrearContratoVend();
      case 'detalle-lote':       return viewDetalleLote();
      default:                   return viewVendedorDashboard();
    }
  }
  if (r === 'asistente') {
    switch (id) {
      case 'flujo':              return viewAsistenteFlujo();
      case 'clientes':           return viewAsistenteClientes();
      case 'testigos':           return viewTestigos();
      case 'crear-testigo':      return viewCrearTestigo();
      case 'registrar-pago':     return viewRegistrarPago();
      case 'detalle-pago':       return viewDetallePago();
      default:                   return viewAsistenteDashboard();
    }
  }
  return '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Vista no encontrada</div></div>';
}

/* Listeners globales */
window.addEventListener('DOMContentLoaded', initStandalonePage);
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
});
