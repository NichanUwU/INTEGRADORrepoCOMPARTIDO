/* ============================================================
   SOFI — Software Operativo para Fincas e Inmuebles
   app.js (compilado)

   Generado concatenando los módulos editables en js/src/
   en orden. Edita los archivos en js/src/ y corre build.sh.
   ============================================================ */


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


function viewDirectivoDashboard(){
  return `
  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Ingresos del Mes</div>
      <div class="kpi-value">$2.4M</div>
      <div class="kpi-trend trend-up">▲ 18% vs mes anterior</div>
    </div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)">
      <div class="kpi-label">Contratos Activos</div>
      <div class="kpi-value">142</div>
      <div class="kpi-trend trend-up">▲ 6 nuevos esta semana</div>
    </div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)">
      <div class="kpi-label">Pagos Atrasados</div>
      <div class="kpi-value">17</div>
      <div class="kpi-trend trend-down">▼ requieren atención</div>
    </div>
    <div class="kpi-card" style="border-left-color:#9C27B0">
      <div class="kpi-label">Lotes Disponibles</div>
      <div class="kpi-value">84</div>
      <div class="kpi-trend" style="color:var(--c-muted)">de 260 totales</div>
    </div>
  </div>

  <!-- Charts row -->
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Ingresos vs Egresos (últimos 6 meses)</div>
      <div class="chart-area" id="chart-ie">
        ${barChart([
          {label:'Ene',a:180,b:90},{label:'Feb',a:220,b:110},
          {label:'Mar',a:195,b:85},{label:'Abr',a:260,b:120},
          {label:'May',a:240,b:105},{label:'Jun',a:310,b:95}
        ])}
      </div>
      <div style="display:flex;gap:16px;margin-top:28px">
        <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--c-muted)">
          <span style="width:10px;height:10px;background:var(--c-accent);border-radius:2px;display:inline-block"></span>Ingresos
        </span>
        <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--c-muted)">
          <span style="width:10px;height:10px;background:var(--c-error);border-radius:2px;display:inline-block"></span>Egresos
        </span>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Ranking de Vendedores (mes actual)</div>
      <div class="ranking-list">
        ${[
          {n:'M. Rodríguez',v:'$580K',pct:95},
          {n:'L. García',   v:'$430K',pct:70},
          {n:'R. Sánchez',  v:'$390K',pct:63},
          {n:'P. Torres',   v:'$310K',pct:50},
          {n:'A. Mendoza',  v:'$220K',pct:36},
        ].map((r,i)=>`
        <div class="ranking-item">
          <div class="rank-num">${i+1}</div>
          <div class="rank-name">${r.n}</div>
          <div class="rank-bar"><div class="rank-bar-fill" style="width:${r.pct}%"></div></div>
          <div class="rank-value">${r.v}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Alerts + Desarrollos -->
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Alertas Recientes</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {t:'Pago atrasado',d:'Cliente: J. Hernández · $8,500 vencido el 01/Jun',type:'error'},
          {t:'Contrato por vencer',d:'C-0241 · L. Pérez vence en 5 días',type:'warn'},
          {t:'Pago atrasado',d:'Cliente: R. Domínguez · $12,200 vencido',type:'error'},
          {t:'Documento faltante',d:'Expediente incompleto: CURP de A. Torres',type:'warn'},
        ].map(a=>`
        <div class="alert-card ${a.type}">
          <div class="alert-icon">${a.type==='error'?'❗':'⚠'}</div>
          <div class="alert-text"><strong>${a.t}</strong><span>${a.d}</span></div>
        </div>`).join('')}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Mapa de Desarrollos</div>
      <div class="dev-map">
        ${[
          {name:'Las Palmas Residencial',loc:'Querétaro',disp:32,vend:68,icon:'🏡'},
          {name:'Vista del Lago',        loc:'Guadalajara',disp:20,vend:40,icon:'🌊'},
          {name:'El Encino',             loc:'CDMX',disp:15,vend:25,icon:'🌳'},
        ].map(d=>`
        <div class="dev-card" onclick="navigate('detalle-desarrollo')">
          <div class="dev-card-thumb">${d.icon}</div>
          <div class="dev-card-body">
            <div class="dev-card-name">${d.name}</div>
            <div class="dev-card-meta">📍 ${d.loc}</div>
            <div class="dev-card-stats">
              <div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-accent)">${d.disp}</div><div class="dev-stat-label">Disponibles</div></div>
              <div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-error)">${d.vend}</div><div class="dev-stat-label">Vendidos</div></div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewDesarrollos(){
  setTimeout(() => fetchDesarrollos(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Desarrollos Inmobiliarios</div>
    <button class="btn-accent" onclick="navigate('crear-desarrollo')">＋ Nuevo Desarrollo</button>
  </div>
  <div class="dev-map" id="cards-desarrollos-body" style="margin-bottom:24px">
    <div class="alert-card" style="width:100%;text-align:center;">Cargando desarrollos...</div>
  </div>`;
}

function viewCrearDesarrollo(){
  return `
  <div style="max-width:680px">
    <div class="section-header">
      <div class="section-title">Nuevo Desarrollo</div>
      <button class="btn-outline btn-sm" onclick="navigate('desarrollos')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre del Proyecto *</label>
          <input type="text" placeholder="Ej. Las Palmas Residencial"></div>
        <div class="form-group"><label>Ubicación *</label>
          <input type="text" placeholder="Ciudad, Estado"></div>
        <div class="form-group"><label>Total de Lotes *</label>
          <input type="number" placeholder="0" min="1"></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Activo</option><option>Preventa</option><option>Cerrado</option></select></div>
        <div class="form-group full"><label>Descripción</label>
          <textarea rows="3" placeholder="Describe el desarrollo…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('desarrollos')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Desarrollo creado exitosamente','success');navigate('desarrollos')">Guardar Desarrollo</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleDesarrollo(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Las Palmas Residencial</div>
      <p style="font-size:12px;color:var(--c-muted)">📍 Querétaro, Qro. · 100 lotes totales</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('desarrollos')">← Regresar</button>
      <button class="btn-accent btn-sm">✏ Editar</button>
    </div>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card"><div class="kpi-label">Total Lotes</div><div class="kpi-value">100</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Disponibles</div><div class="kpi-value">32</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Vendidos</div><div class="kpi-value">68</div></div>
  </div>
  <div class="chart-card" style="margin-bottom:16px">
    <div class="chart-title">Disponibilidad de Lotes</div>
    <p style="font-size:12px;color:var(--c-muted);margin-bottom:12px">
      <span style="color:var(--c-accent)">■</span> Disponible &nbsp;
      <span style="color:var(--c-error)">■</span> Vendido &nbsp;
      <span style="color:var(--c-warn)">■</span> Reservado
    </p>
    <div class="lot-grid">
      ${Array.from({length:40},(_,i)=>{
        const s=i<25?'sold':i<28?'reserved':'available';
        const n=(i+1).toString().padStart(2,'0');
        return `<div class="lot-cell ${s}" onclick="navigate('detalle-lote')">L-${n}</div>`;
      }).join('')}
    </div>
  </div>`;
}

function viewLotes(){
  setTimeout(() => fetchLotes(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Gestión de Lotes</div>
    <button class="btn-accent" onclick="navigate('crear-lote')">＋ Nuevo Lote</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar lote…" style="max-width:240px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option><option>Vista del Lago</option></select>
      <select class="filter-select"><option>Todos los Estatus</option><option>Disponible</option><option>Vendido</option><option>Reservado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Desarrollo</th><th>Núm. Lote</th><th>Superficie (m²)</th><th>Precio de Lista</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-lotes-body">
        <tr><td colspan="7">Cargando lotes...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando lotes reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button>
        <button class="pag-btn">3</button><button class="pag-btn">…</button><button class="pag-btn">14</button>
      </div>
    </div>
  </div>`;
}

function viewCrearLote(){
  return `
  <div style="max-width:680px">
    <div class="section-header">
      <div class="section-title">Nuevo Lote</div>
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Desarrollo *</label>
          <select><option>Seleccionar…</option><option>Las Palmas</option><option>Vista del Lago</option></select></div>
        <div class="form-group"><label>Número de Lote *</label>
          <input type="text" placeholder="Ej. A-12"></div>
        <div class="form-group"><label>Superficie (m²) *</label>
          <input type="number" placeholder="120" min="1"></div>
        <div class="form-group"><label>Precio de Lista *</label>
          <input type="number" placeholder="350000" min="0"></div>
        <div class="form-group"><label>Estatus *</label>
          <select><option>Disponible</option><option>Vendido</option><option>Reservado</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('lotes')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Lote creado','success');navigate('lotes')">Guardar Lote</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleLote(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Lote A-01 · Las Palmas Residencial</div>
      <p style="font-size:12px;color:var(--c-muted)">ID: L-001 · 120 m²</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">← Regresar</button>
      <button class="btn-accent btn-sm">✏ Editar</button>
    </div>
  </div>
  <div class="two-col">
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Datos del Lote</div>
      ${detailRow('ID Lote','L-001')}
      ${detailRow('Desarrollo','Las Palmas Residencial')}
      ${detailRow('Número','A-01')}
      ${detailRow('Superficie','120 m²')}
      ${detailRow('Precio de Lista','$380,000 MXN')}
      ${detailRow('Estatus','<span class="chip chip-green">Disponible</span>')}
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Acciones</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn-accent" onclick="navigate('crear-contrato')">📄 Generar Contrato</button>
        <button class="btn-outline">💲 Simular Financiamiento</button>
        <button class="btn-outline">📷 Ver Plano</button>
      </div>
    </div>
  </div>`;
}

function viewClientes(){
  setTimeout(() => fetchClientes(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Clientes</div>
    <button class="btn-accent" onclick="navigate('crear-cliente')">＋ Nuevo Cliente</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar por nombre, INE…" style="max-width:260px">
      <select class="filter-select"><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre Completo</th><th>Teléfono</th><th>INE</th><th>CURP</th><th>Dirección</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-clientes-body">
        <tr><td colspan="7">Cargando clientes...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando clientes reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button>
      </div>
    </div>
  </div>`;
}

function viewCrearCliente(){
  return `
  <div style="max-width:720px">
    <div class="section-header">
      <div class="section-title">Nuevo Cliente</div>
      <button class="btn-outline btn-sm" onclick="navigate('clientes')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre Completo *</label><input placeholder="Nombre Apellido Apellido"></div>
        <div class="form-group"><label>RFC *</label><input placeholder="XXXX000000XX0"><span class="hint">13 caracteres (personas físicas)</span></div>
        <div class="form-group"><label>CURP *</label><input placeholder="XXXXXXXXXXXXXXXXXXXX"><span class="hint">18 caracteres</span></div>
        <div class="form-group full"><label>Dirección *</label><input placeholder="Calle, Número, Colonia, CP, Ciudad, Estado"></div>
        <div class="form-group"><label>Teléfono *</label><input type="tel" placeholder="442-100-0000"></div>
        <div class="form-group"><label>Estado Civil *</label>
          <select><option>Seleccionar…</option><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option><option>Unión libre</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('clientes')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Cliente registrado','success');navigate('clientes')">Guardar Cliente</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleCliente(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Juan Hernández López</div>
      <p style="font-size:12px;color:var(--c-muted)">ID: C-001 · RFC: HELJ801234AB1</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('clientes')">← Regresar</button>
      <button class="btn-accent btn-sm">✏ Editar</button>
    </div>
  </div>
  <div class="two-col" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Datos Personales</div>
        ${detailRow('Nombre','Juan Hernández López')}
        ${detailRow('RFC','HELJ801234AB1')}
        ${detailRow('CURP','HELJ801234HQRNPN03')}
        ${detailRow('Teléfono','442-100-2000')}
        ${detailRow('Estado Civil','Casado')}
        ${detailRow('Dirección','Av. Tecnológico 120, Col. Centro, Querétaro, Qro.')}
      </div>
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Testigos Registrados</div>
        ${[{n:'Laura Hernández (Esposa)',r:'Cónyuge'},{n:'Carlos Medina (Amigo)',r:'Amigo'}]
          .map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--c-border)">
            <span style="font-size:13px">${t.n}</span><span class="chip chip-gray">${t.r}</span>
          </div>`).join('')}
        <button class="btn-outline btn-sm" style="margin-top:10px">＋ Agregar Testigo</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Contratos</div>
        ${[{id:'CON-0051',lot:'A-01',dev:'Las Palmas',monto:'$380K',st:'Activo'},
           {id:'CON-0062',lot:'B-01',dev:'Vista del Lago',monto:'$295K',st:'Activo'}]
          .map(c=>`<div class="alert-card success" style="margin-bottom:8px;cursor:pointer" onclick="navigate('detalle-contrato')">
            <div class="alert-icon">📄</div>
            <div class="alert-text">
              <strong>${c.id} · Lote ${c.lot}</strong>
              <span>${c.dev} · ${c.monto}</span>
            </div>
            <span class="chip chip-green">${c.st}</span>
          </div>`).join('')}
      </div>
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Documentos Adjuntos</div>
        <div class="doc-zone" onclick="showToast('Seleccionar archivo…','')">
          📁<br><span style="font-size:12px;color:var(--c-muted)">Clic para subir documento</span>
        </div>
        <div class="doc-list" style="margin-top:10px">
          ${[{n:'INE_Frente.pdf',s:'1.2 MB'},{n:'Comprobante_Domicilio.pdf',s:'890 KB'}]
            .map(d=>`<div class="doc-item"><div class="doc-icon">📄</div>
              <div class="doc-name">${d.n}</div><div class="doc-size">${d.s}</div>
              <button class="btn-outline btn-sm">⬇</button></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function viewContratos(){
  setTimeout(() => fetchContratos(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Contratos</div>
    <button class="btn-accent" onclick="navigate('crear-contrato')">＋ Nuevo Contrato</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar contrato…" style="max-width:240px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option></select>
      <select class="filter-select"><option>Todos los estados</option><option>Activo</option><option>Vencido</option><option>Liquidado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Cliente</th><th>Lote</th><th>Vendedor</th><th>Fecha</th><th>Monto Total</th><th>Plazo</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-contratos-body">
        <tr><td colspan="9">Cargando contratos...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando contratos reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button>
      </div>
    </div>
  </div>`;
}

function formatCurrency(value) {
  if (value == null || value === '') return '—';
  const normalized = Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(normalized)) return String(value);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(normalized);
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return isNaN(date) ? String(value) : date.toLocaleDateString('es-MX');
}

async function fetchDesarrollos() {
  try {
    const res = await fetch(`${API_URL}/desarrollos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const container = document.getElementById('cards-desarrollos-body');
    if (!container) return;
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<div class="alert-card" style="width:100%;text-align:center;">No hay desarrollos registrados.</div>';
      return;
    }
    container.innerHTML = data.map(d => `
      <div class="dev-card" onclick="navigate('detalle-desarrollo')">
        <div class="dev-card-thumb">🏡</div>
        <div class="dev-card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div class="dev-card-name">${d.Nombre ?? 'Sin nombre'}</div>
            <span class="chip chip-green">Activo</span>
          </div>
          <div class="dev-card-meta">📍 ${d.Ubicacion ?? 'Ubicación no disponible'}</div>
          <div class="dev-card-stats">
            <div class="dev-stat"><div class="dev-stat-num">ID ${d.IdDesarrollo ?? '—'}</div><div class="dev-stat-label">ID</div></div>
            <div class="dev-stat"><div class="dev-stat-num">${formatDate(d.Fecha_inicio)}</div><div class="dev-stat-label">Inicio</div></div>
            <div class="dev-stat"><div class="dev-stat-num">—</div><div class="dev-stat-label">Lotes</div></div>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    const container = document.getElementById('cards-desarrollos-body');
    if (container) container.innerHTML = `<div class="alert-card" style="width:100%;text-align:center;">Error: ${err.message}</div>`;
  }
}

async function fetchLotes() {
  try {
    const res = await fetch(`${API_URL}/lotes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-lotes-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay lotes registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(l => `
      <tr>
        <td style="font-weight:600">${l.IdLote ?? ''}</td>
        <td>${l.IdManzana != null ? `Mzn. ${l.IdManzana}` : 'N/A'}</td>
        <td>${l.Numero ?? ''}</td>
        <td>${l.Medidas ?? ''}</td>
        <td style="font-weight:600">${formatCurrency(l.Precio)}</td>
        <td><span class="chip ${l.Estado === 'Disponible' ? 'chip-green' : l.Estado === 'Vendido' ? 'chip-red' : 'chip-warn'}">${l.Estado ?? 'Desconocido'}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-lote')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-lotes-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7">Error: ${err.message}</td></tr>`;
  }
}

async function fetchClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-clientes-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay clientes registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td style="font-weight:600">${c.IdCliente ?? ''}</td>
        <td>${c.Nombre ?? ''}</td>
        <td>${c.Telefono ?? ''}</td>
        <td style="font-family:monospace">${c.INE ?? ''}</td>
        <td style="font-family:monospace">${c.CURP ?? ''}</td>
        <td>${c.Direccion ?? ''}</td>
        <td style="display:flex;gap:6px"><button class="btn-outline btn-sm" onclick="navigate('detalle-cliente')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-clientes-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7">Error: ${err.message}</td></tr>`;
  }
}

async function fetchContratos() {
  try {
    const res = await fetch(`${API_URL}/contratos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-contratos-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">No hay contratos registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td style="font-weight:600">${c.IdContrato ?? ''}</td>
        <td>${c.Cliente ?? ''}</td>
        <td>${c.Lote != null ? `Lote ${c.Lote}` : ''}</td>
        <td>${c.Vendedor ?? ''}</td>
        <td>${formatDate(c.Fecha)}</td>
        <td style="font-weight:600">—</td>
        <td>—</td>
        <td><span class="chip chip-blue">${c.Estatus ?? 'Activo'}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-contrato')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-contratos-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9">Error: ${err.message}</td></tr>`;
  }
}

function viewCrearContrato(){
  return `
  <div style="max-width:720px">
    <div class="section-header">
      <div class="section-title">Nuevo Contrato</div>
      <button class="btn-outline btn-sm" onclick="navigate('contratos')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Cliente *</label>
          <select><option>Seleccionar…</option><option>Juan Hernández</option><option>María García</option></select></div>
        <div class="form-group"><label>Lote *</label>
          <select><option>Seleccionar…</option><option>A-01 · Las Palmas · $380K</option><option>D-01 · Bosques · $510K</option></select></div>
        <div class="form-group"><label>Vendedor *</label>
          <select><option>Seleccionar…</option><option>M. Rodríguez</option><option>L. García</option></select></div>
        <div class="form-group"><label>Fecha de Emisión *</label><input type="date"></div>
        <div class="form-group"><label>Monto Total *</label><input type="number" placeholder="0.00"></div>
        <div class="form-group"><label>Plazo de Pago (meses) *</label><input type="number" placeholder="12" min="1"></div>
        <div class="form-group full"><label>Notas / Observaciones</label>
          <textarea rows="3" placeholder="Observaciones adicionales…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('contratos')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Contrato generado exitosamente','success');navigate('contratos')">Crear Contrato</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleContrato(){
  const pagos=[
    {mes:'Ene 2025',monto:'$10,556',fecha:'12/Jan',st:'paid'},
    {mes:'Feb 2025',monto:'$10,556',fecha:'12/Feb',st:'paid'},
    {mes:'Mar 2025',monto:'$10,556',fecha:'12/Mar',st:'paid'},
    {mes:'Abr 2025',monto:'$10,556',fecha:'12/Apr',st:'late'},
    {mes:'May 2025',monto:'$10,556',fecha:'12/May',st:'pending'},
    {mes:'Jun 2025',monto:'$10,556',fecha:'12/Jun',st:'pending'},
  ];
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Contrato CON-0051</div>
      <p style="font-size:12px;color:var(--c-muted)">Juan Hernández · Lote A-01 · Las Palmas Residencial</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('contratos')">← Regresar</button>
      <button class="btn-outline btn-sm">🖨 Imprimir</button>
      <button class="btn-accent btn-sm">✏ Editar</button>
    </div>
  </div>
  <div class="two-col" style="align-items:start">
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Datos del Contrato</div>
      ${detailRow('ID Contrato','CON-0051')}
      ${detailRow('Cliente','Juan Hernández López')}
      ${detailRow('Lote','A-01 – Las Palmas Residencial')}
      ${detailRow('Vendedor','M. Rodríguez')}
      ${detailRow('Fecha de Emisión','12 de Enero, 2025')}
      ${detailRow('Monto Total','$380,000 MXN')}
      ${detailRow('Plazo','36 meses')}
      ${detailRow('Pago mensual','$10,556 MXN')}
      ${detailRow('Estatus','<span class="chip chip-green">Activo</span>')}
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Línea de Tiempo de Pagos</div>
      <div class="timeline">
        ${pagos.map((p,i)=>`
        <div class="tl-item">
          ${i<pagos.length-1?'<div class="tl-line"></div>':''}
          <div class="tl-dot ${p.st}"></div>
          <div class="tl-content">
            <div class="tl-label">${p.mes} · ${p.monto}</div>
            <div class="tl-meta">Vence: ${p.fecha} ·
              <span class="${p.st==='paid'?'trend-up':p.st==='late'?'trend-down':''}">
                ${p.st==='paid'?'✓ Pagado':p.st==='late'?'⚠ Atrasado':'⏳ Pendiente'}
              </span>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewFlujo(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Ingresos del Mes</div><div class="kpi-value">$2.4M</div><div class="kpi-trend trend-up">▲ 18% vs mes anterior</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Egresos del Mes</div><div class="kpi-value">$810K</div><div class="kpi-trend trend-down">▲ 5% vs mes anterior</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Flujo Neto</div><div class="kpi-value">$1.59M</div><div class="kpi-trend trend-up">Balance positivo</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">$284K</div><div class="kpi-trend trend-down">17 contratos</div></div>
  </div>
  <div class="section-header" style="margin-top:8px">
    <div class="section-title">Movimientos de Flujo</div>
    <button class="btn-accent" onclick="navigate('registrar-pago')">＋ Registrar Movimiento</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar movimiento…" style="max-width:220px">
      <select class="filter-select"><option>Todos los tipos</option><option>Ingreso</option><option>Egreso</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Pagado</option><option>Atrasado</option></select>
      <input type="date" class="filter-select">
    </div>
    <table>
      <thead><tr><th>ID</th><th>Contrato</th><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>Monto</th><th>Estatus</th><th></th></tr></thead>
      <tbody>
        ${[
          {id:'F-001',c:'CON-0051',f:'12/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$10,556',st:'Pagado'},
          {id:'F-002',c:'CON-0052',f:'18/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$8,194',st:'Pagado'},
          {id:'F-003',c:'CON-0053',f:'05/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$14,167',st:'Atrasado'},
          {id:'F-004',c:'GASTO',   f:'10/Jun/2025',con:'Mantenimiento Las Palmas',t:'Egreso', m:'$25,000',st:'Pagado'},
          {id:'F-005',c:'CON-0054',f:'22/Jun/2025',con:'Enganche',t:'Ingreso',m:'$42,000',st:'Pagado'},
        ].map(f=>`<tr>
          <td style="font-weight:600">${f.id}</td><td>${f.c}</td><td>${f.f}</td><td>${f.con}</td>
          <td><span class="chip ${f.t==='Ingreso'?'chip-green':'chip-red'}">${f.t}</span></td>
          <td style="font-weight:600">${f.m}</td>
          <td><span class="chip ${f.st==='Pagado'?'chip-green':'chip-red'}">${f.st}</span></td>
          <td><button class="btn-outline btn-sm" onclick="navigate('detalle-flujo')">Ver</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando 1–5 de 312 movimientos</span>
      <div style="display:flex;gap:4px"><button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button></div>
    </div>
  </div>`;
}

function viewDetalleFlujo(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Movimiento F-001</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Detalle del Movimiento</div>
      ${detailRow('ID Flujo','F-001')}
      ${detailRow('Contrato','CON-0051 · Juan Hernández')}
      ${detailRow('Fecha de Pago','12 de Junio, 2025')}
      ${detailRow('Monto Recibido','$10,556.00 MXN')}
      ${detailRow('Tipo','<span class="chip chip-green">Ingreso</span>')}
      ${detailRow('Concepto','Mensualidad Junio 2025')}
      ${detailRow('Estatus','<span class="chip chip-green">Pagado</span>')}
      <div class="form-actions">
        <button class="btn-outline">✏ Editar</button>
        <button class="btn-danger btn-sm" onclick="showModal('confirm-delete')">🗑 Eliminar</button>
      </div>
    </div>
  </div>`;
}

function viewAnalisis(){
  return `
  <div class="section-header"><div class="section-title">Análisis Financiero</div></div>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Ingresos Anuales</div><div class="kpi-value">$18.4M</div><div class="kpi-trend trend-up">▲ 23% YoY</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Egresos Anuales</div><div class="kpi-value">$7.2M</div><div class="kpi-trend trend-down">▲ 8% YoY</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Margen Neto</div><div class="kpi-value">60.8%</div><div class="kpi-trend trend-up">▲ 4.2 pp YoY</div></div>
    <div class="kpi-card" style="border-left-color:#9C27B0"><div class="kpi-label">Cartera Total</div><div class="kpi-value">$54.2M</div><div class="kpi-trend" style="color:var(--c-muted)">142 contratos</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Ingresos por Desarrollo (anual)</div>
      <div class="chart-area">
        ${barChart([
          {label:'Las Palmas',a:720,b:0},{label:'Vista Lago',a:430,b:0},
          {label:'El Encino',a:380,b:0},{label:'Bosques',a:290,b:0},{label:'Jardines',a:180,b:0}
        ],['var(--c-accent)','var(--c-accent)'])}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Tendencia Mensual de Ventas</div>
      <div class="chart-area">
        ${lineChart([42,38,55,61,48,72,58,80,66,74,85,92])}
      </div>
    </div>
  </div>`;
}

function viewUsuarios(){
  return `
  <div class="section-header">
    <div class="section-title">Usuarios del Sistema</div>
    <button class="btn-accent" onclick="navigate('crear-usuario')">＋ Nuevo Usuario</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar usuario…" style="max-width:240px">
      <select class="filter-select"><option>Todos los roles</option><option>Directivo</option><option>Vendedor</option><option>Asistente</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Activo</option><option>Inactivo</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody>
        ${[
          {id:'U-001',n:'Dir. González',e:'gonzalez@sofi.mx',rol:'Directivo',st:'Activo'},
          {id:'U-002',n:'M. Rodríguez',e:'rodriguez@sofi.mx',rol:'Vendedor',st:'Activo'},
          {id:'U-003',n:'L. García',e:'garcia@sofi.mx',rol:'Vendedor',st:'Activo'},
          {id:'U-004',n:'A. Pérez',e:'aperez@sofi.mx',rol:'Asistente',st:'Activo'},
          {id:'U-005',n:'R. Sánchez',e:'rsanchez@sofi.mx',rol:'Vendedor',st:'Inactivo'},
        ].map(u=>`<tr>
          <td style="font-weight:600">${u.id}</td><td>${u.n}</td><td style="font-size:12px">${u.e}</td>
          <td><span class="chip ${u.rol==='Directivo'?'chip-blue':u.rol==='Vendedor'?'chip-green':'chip-warn'}">${u.rol}</span></td>
          <td><span class="chip ${u.st==='Activo'?'chip-green':'chip-gray'}">${u.st}</span></td>
          <td style="display:flex;gap:6px">
            <button class="btn-outline btn-sm">✏ Editar</button>
            <button class="btn-outline btn-sm" onclick="showModal('confirm-delete')">🗑</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando 1–5 de 12 usuarios</span>
      <div style="display:flex;gap:4px"><button class="pag-btn active">1</button><button class="pag-btn">2</button></div>
    </div>
  </div>`;
}

function viewCrearUsuario(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Nuevo Usuario</div>
      <button class="btn-outline btn-sm" onclick="navigate('usuarios')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre Completo *</label><input placeholder="Nombre completo"></div>
        <div class="form-group"><label>Correo Electrónico *</label><input type="email" placeholder="correo@sofi.mx"></div>
        <div class="form-group"><label>Contraseña *</label><input type="password" placeholder="Mín. 8 caracteres"></div>
        <div class="form-group"><label>Confirmar Contraseña *</label><input type="password" placeholder="Repetir contraseña"></div>
        <div class="form-group"><label>Rol *</label>
          <select><option>Seleccionar…</option><option>Directivo</option><option>Vendedor</option><option>Asistente</option></select></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Activo</option><option>Inactivo</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('usuarios')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Usuario creado','success');navigate('usuarios')">Crear Usuario</button>
      </div>
    </div>
  </div>`;
}

function viewRoles(){
  return `
  <div class="section-header">
    <div class="section-title">Roles del Sistema</div>
    <button class="btn-accent" onclick="navigate('crear-rol')">＋ Nuevo Rol</button>
  </div>
  <div class="three-col">
    ${[
      {id:'R-001',n:'Directivo',d:'Acceso total al sistema. Dashboard avanzado, reportes, usuarios y configuración.',u:2,color:'chip-blue'},
      {id:'R-002',n:'Vendedor',d:'Gestión de clientes, lotes disponibles, y generación de contratos propios.',u:8,color:'chip-green'},
      {id:'R-003',n:'Asistente',d:'Apoyo administrativo: flujo de efectivo, actualización de clientes y testigos.',u:3,color:'chip-warn'},
    ].map(r=>`
    <div class="form-card" style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="section-title">${r.n}</div>
        <span class="chip ${r.color}">${r.id}</span>
      </div>
      <p style="font-size:13px;color:var(--c-muted);line-height:1.5">${r.d}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--c-muted)">${r.u} usuarios asignados</span>
        <button class="btn-outline btn-sm">✏ Editar</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function viewCrearRol(){
  return `
  <div style="max-width:580px">
    <div class="section-header">
      <div class="section-title">Nuevo Rol</div>
      <button class="btn-outline btn-sm" onclick="navigate('roles')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre del Rol *</label><input placeholder="Ej. Supervisor"></div>
        <div class="form-group full"><label>Descripción</label>
          <textarea rows="3" placeholder="Describe los permisos de este rol…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('roles')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Rol creado','success');navigate('roles')">Guardar Rol</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   VIEWS – VENDEDOR
   ============================================================ */

function viewVendedorDashboard(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Mis Ventas del Mes</div><div class="kpi-value">$580K</div><div class="kpi-trend trend-up">▲ 3 contratos</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)"><div class="kpi-label">Clientes Asignados</div><div class="kpi-value">34</div><div class="kpi-trend" style="color:var(--c-muted)">+5 este mes</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">4</div><div class="kpi-trend trend-down">de mis clientes</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Meta del Mes</div><div class="kpi-value">74%</div><div class="kpi-trend trend-up">$580K / $780K</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Mis Contratos Activos</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {cli:'J. Hernández',lot:'A-01',monto:'$380K',prox:'12/Jul'},
          {cli:'M. García',   lot:'B-01',monto:'$295K',prox:'18/Jul'},
          {cli:'A. Pérez',    lot:'A-02',monto:'$420K',prox:'22/Jul'},
        ].map(c=>`
        <div class="alert-card success" style="cursor:pointer" onclick="navigate('detalle-contrato')">
          <div class="alert-icon">📄</div>
          <div class="alert-text">
            <strong>${c.cli} · Lote ${c.lot}</strong>
            <span>${c.monto} · Próximo pago: ${c.prox}</span>
          </div>
        </div>`).join('')}
        <button class="btn-outline btn-sm" onclick="navigate('contratos')">Ver todos mis contratos →</button>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Alertas de mis Clientes</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {t:'Pago atrasado',d:'R. Domínguez · $14,167 · vencido 05/Jun',type:'error'},
          {t:'Documento faltante',d:'L. Sánchez · Falta CURP actualizado',type:'warn'},
          {t:'Contrato próximo',d:'M. García · Finaliza en 2 meses',type:'warn'},
        ].map(a=>`
        <div class="alert-card ${a.type}">
          <div class="alert-icon">${a.type==='error'?'❗':'⚠'}</div>
          <div class="alert-text"><strong>${a.t}</strong><span>${a.d}</span></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewVendedorClientes(){
  return `
  <div class="section-header">
    <div class="section-title">Mis Clientes</div>
    <button class="btn-accent" onclick="navigate('crear-cliente')">＋ Nuevo Cliente</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Con contrato</option><option>Sin contrato</option></select>
    </div>
    <table>
      <thead><tr><th>Nombre</th><th>RFC</th><th>Teléfono</th><th>Contratos</th><th>Testigos</th><th>Acciones</th></tr></thead>
      <tbody>
        ${[
          {n:'Juan Hernández',rfc:'HELJ801234AB1',tel:'442-100-2000',ctrs:2,test:1},
          {n:'María García',  rfc:'GATM920315CD2',tel:'33-9000-1234', ctrs:1,test:2},
          {n:'Roberto Domínguez',rfc:'DORR780501EF3',tel:'55-4000-5678',ctrs:1,test:0},
        ].map(c=>`<tr>
          <td style="font-weight:600">${c.n}</td>
          <td style="font-size:12px;font-family:monospace">${c.rfc}</td>
          <td>${c.tel}</td>
          <td><span class="chip chip-blue">${c.ctrs}</span></td>
          <td><span class="chip ${c.test?'chip-green':'chip-red'}">${c.test} registrado${c.test!==1?'s':''}</span></td>
          <td style="display:flex;gap:6px">
            <button class="btn-outline btn-sm" onclick="navigate('detalle-cliente')">Ver</button>
            <button class="btn-accent btn-sm" onclick="navigate('crear-contrato')">Contrato</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 34</span></div>
  </div>`;
}

function viewCrearClienteVend(){return viewCrearCliente();}

function viewVendedorLotes(){
  return `
  <div class="section-header">
    <div class="section-title">Lotes Disponibles</div>
    <div style="display:flex;gap:8px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option><option>Vista del Lago</option></select>
      <button class="btn-outline btn-sm" onclick="navigate('simulador')">💲 Simulador</button>
    </div>
  </div>
  ${['Las Palmas Residencial','Vista del Lago'].map(dev=>`
  <div class="chart-card" style="margin-bottom:16px">
    <div class="chart-title">${dev}</div>
    <p style="font-size:12px;color:var(--c-muted);margin-bottom:10px">
      <span style="color:var(--c-accent)">■</span> Disponible &nbsp;<span style="color:var(--c-error)">■</span> Vendido &nbsp;<span style="color:var(--c-warn)">■</span> Reservado
    </p>
    <div class="lot-grid">
      ${Array.from({length:20},(_,i)=>{
        const s=i<12?'sold':i<14?'reserved':'available';
        return `<div class="lot-cell ${s}" onclick="navigate('detalle-lote')">L-${(i+1).toString().padStart(2,'0')}</div>`;
      }).join('')}
    </div>
  </div>`).join('')}`;
}

function viewSimulador(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Simulador de Financiamiento</div>
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Precio del Lote</label>
          <input type="number" id="sim-precio" value="380000" oninput="calcSim()"></div>
        <div class="form-group"><label>Enganche (%)</label>
          <input type="number" id="sim-eng" value="20" min="10" max="50" oninput="calcSim()"></div>
        <div class="form-group"><label>Plazo (meses)</label>
          <input type="number" id="sim-plazo" value="36" min="12" max="120" oninput="calcSim()"></div>
        <div class="form-group"><label>Tasa de Interés Anual (%)</label>
          <input type="number" id="sim-tasa" value="12" min="0" step="0.5" oninput="calcSim()"></div>
      </div>
      <div class="sim-result" id="sim-result">
        <div class="sim-item"><div class="sim-label">Monto a Financiar</div><div class="sim-val">$304,000</div></div>
        <div class="sim-item"><div class="sim-label">Enganche</div><div class="sim-val">$76,000</div></div>
        <div class="sim-item"><div class="sim-label">Mensualidad</div><div class="sim-val">$10,084</div></div>
        <div class="sim-item"><div class="sim-label">Total a Pagar</div><div class="sim-val">$439,024</div></div>
      </div>
      <div class="form-actions">
        <button class="btn-accent" onclick="navigate('crear-contrato')">📄 Generar Contrato con estos datos</button>
      </div>
    </div>
  </div>`;
}

function viewVendedorContratos(){
  return `
  <div class="section-header">
    <div class="section-title">Mis Contratos</div>
    <button class="btn-accent" onclick="navigate('crear-contrato')">＋ Nuevo Contrato</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar…" style="max-width:220px">
      <select class="filter-select"><option>Todos</option><option>Activo</option><option>Atrasado</option><option>Liquidado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Cliente</th><th>Lote</th><th>Fecha</th><th>Monto</th><th>Plazo</th><th>Estatus</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {id:'CON-0051',cli:'J. Hernández',lote:'A-01',f:'12/Jan',m:'$380K',p:'36m',st:'Activo'},
        {id:'CON-0052',cli:'M. García',lote:'B-01',f:'18/Feb',m:'$295K',p:'24m',st:'Activo'},
        {id:'CON-0053',cli:'R. Domínguez',lote:'C-01',f:'05/Mar',m:'$680K',p:'48m',st:'Atrasado'},
      ].map(c=>`<tr>
        <td style="font-weight:600">${c.id}</td><td>${c.cli}</td><td>${c.lote}</td>
        <td>${c.f}</td><td style="font-weight:600">${c.m}</td><td>${c.p}</td>
        <td><span class="chip ${c.st==='Activo'?'chip-green':'chip-red'}">${c.st}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-contrato')">Ver</button></td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 18</span></div>
  </div>`;
}

function viewCrearContratoVend(){return viewCrearContrato();}

/* ============================================================
   VIEWS – ASISTENTE
   ============================================================ */

function viewAsistenteDashboard(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Pagos a Registrar Hoy</div><div class="kpi-value">8</div><div class="kpi-trend" style="color:var(--c-muted)">Pendientes de captura</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Próximos (7 días)</div><div class="kpi-value">23</div><div class="kpi-trend" style="color:var(--c-muted)">Esta semana</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">17</div><div class="kpi-trend trend-down">Requieren seguimiento</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)"><div class="kpi-label">Clientes por Actualizar</div><div class="kpi-value">5</div><div class="kpi-trend trend-down">Documentos faltantes</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Actividades del Día</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {t:'09:00','d':'Registrar pago CON-0051 · J. Hernández · $10,556',done:true},
          {t:'10:30','d':'Actualizar CURP de A. Torres',done:true},
          {t:'11:00','d':'Registrar pago CON-0052 · M. García · $8,194',done:false},
          {t:'14:00','d':'Verificar documentos R. Domínguez',done:false},
          {t:'15:30','d':'Actualizar testigos · L. Sánchez',done:false},
        ].map(a=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:6px;
          background:${a.done?'var(--c-light-bg)':'var(--c-white)'};border:1px solid var(--c-border)">
          <span style="font-size:11px;color:var(--c-muted);width:38px;flex-shrink:0">${a.t}</span>
          <span style="font-size:13px;${a.done?'text-decoration:line-through;color:var(--c-muted)':''}">${a.d}</span>
          ${a.done?'<span style="margin-left:auto;color:var(--c-accent)">✓</span>':''}
        </div>`).join('')}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Pagos Atrasados – Acción Requerida</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {n:'J. Hernández',c:'CON-0051',m:'$10,556',d:'12/Jun'},
          {n:'R. Domínguez',c:'CON-0053',m:'$14,167',d:'05/Jun'},
          {n:'L. Sánchez',  c:'CON-0055',m:'$8,500', d:'01/Jun'},
        ].map(p=>`
        <div class="alert-card error">
          <div class="alert-icon">❗</div>
          <div class="alert-text">
            <strong>${p.n} · ${p.c}</strong>
            <span>${p.m} – vencido ${p.d}</span>
          </div>
          <button class="btn-accent btn-sm" onclick="navigate('registrar-pago')">Registrar</button>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewAsistenteFlujo(){
  return `
  <div class="section-header">
    <div class="section-title">Flujo de Efectivo</div>
    <button class="btn-accent" onclick="navigate('registrar-pago')">＋ Registrar Pago</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar contrato, cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Ingreso</option><option>Egreso</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Pagado</option><option>Atrasado</option></select>
    </div>
    <table>
      <thead><tr><th>Contrato</th><th>Cliente</th><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Tipo</th><th>Estatus</th><th></th></tr></thead>
    <tbody>
      ${[
        {c:'CON-0051',cli:'J. Hernández',f:'12/Jun',con:'Mensualidad Jun',m:'$10,556',t:'Ingreso',st:'Pagado'},
        {c:'CON-0052',cli:'M. García',   f:'18/Jun',con:'Mensualidad Jun',m:'$8,194', t:'Ingreso',st:'Pagado'},
        {c:'CON-0053',cli:'R. Domínguez',f:'05/Jun',con:'Mensualidad Jun',m:'$14,167',t:'Ingreso',st:'Atrasado'},
      ].map(f=>`<tr>
        <td style="font-weight:600">${f.c}</td><td>${f.cli}</td><td>${f.f}</td><td>${f.con}</td>
        <td style="font-weight:600">${f.m}</td>
        <td><span class="chip chip-green">${f.t}</span></td>
        <td><span class="chip ${f.st==='Pagado'?'chip-green':'chip-red'}">${f.st}</span></td>
        <td style="display:flex;gap:4px">
          <button class="btn-outline btn-sm" onclick="navigate('detalle-pago')">Ver</button>
          <button class="btn-accent btn-sm" onclick="navigate('registrar-pago')">✏</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 312</span></div>
  </div>`;
}

function viewRegistrarPago(){
  return `
  <div style="max-width:620px">
    <div class="section-header">
      <div class="section-title">Registrar Pago</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Contrato *</label>
          <select><option>Seleccionar…</option><option>CON-0051 · J. Hernández</option><option>CON-0052 · M. García</option></select></div>
        <div class="form-group"><label>Fecha de Pago *</label><input type="date"></div>
        <div class="form-group"><label>Monto Recibido *</label><input type="number" placeholder="0.00"></div>
        <div class="form-group"><label>Tipo *</label>
          <select><option>Ingreso</option><option>Egreso</option></select></div>
        <div class="form-group full"><label>Concepto *</label><input placeholder="Ej. Mensualidad Junio 2025"></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Pagado</option><option>Atrasado</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('flujo')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Pago registrado exitosamente','success');navigate('flujo')">Guardar Pago</button>
      </div>
    </div>
  </div>`;
}

function viewDetallePago(){
  return `
  <div style="max-width:580px">
    <div class="section-header">
      <div class="section-title">Detalle de Pago</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      ${detailRow('Contrato','CON-0051')}
      ${detailRow('Cliente','Juan Hernández López')}
      ${detailRow('Fecha de Pago','12 de Junio, 2025')}
      ${detailRow('Monto','$10,556.00 MXN')}
      ${detailRow('Tipo','<span class="chip chip-green">Ingreso</span>')}
      ${detailRow('Concepto','Mensualidad Junio 2025')}
      ${detailRow('Estatus','<span class="chip chip-green">Pagado</span>')}
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('registrar-pago')">✏ Editar</button>
      </div>
    </div>
  </div>`;
}

function viewAsistenteClientes(){
  return `
  <div class="section-header">
    <div class="section-title">Clientes – Actualización</div>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Documentos incompletos</option><option>Estado civil desactualizado</option></select>
    </div>
    <table>
      <thead><tr><th>Nombre</th><th>RFC</th><th>Estado Civil</th><th>Documentos</th><th>Última Actualización</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {n:'Juan Hernández',rfc:'HELJ801234AB1',ec:'Casado',docs:'Completo','upd':'10/Jun/2025'},
        {n:'Ana Torres',rfc:'TOAA910203CD5',ec:'Soltera',docs:'Falta CURP','upd':'01/May/2025'},
        {n:'L. Sánchez',rfc:'SAML940710IJ5',ec:'Soltero',docs:'Completo','upd':'20/May/2025'},
      ].map(c=>`<tr>
        <td style="font-weight:600">${c.n}</td>
        <td style="font-size:12px;font-family:monospace">${c.rfc}</td>
        <td>${c.ec}</td>
        <td><span class="chip ${c.docs==='Completo'?'chip-green':'chip-warn'}">${c.docs}</span></td>
        <td style="font-size:12px;color:var(--c-muted)">${c.upd}</td>
        <td style="display:flex;gap:6px">
          <button class="btn-outline btn-sm">✏ Editar</button>
          <button class="btn-outline btn-sm">📁 Documentos</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 248</span></div>
  </div>`;
}

function viewTestigos(){
  return `
  <div class="section-header">
    <div class="section-title">Testigos</div>
    <button class="btn-accent" onclick="navigate('crear-testigo')">＋ Nuevo Testigo</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar testigo o cliente…" style="max-width:240px">
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre Testigo</th><th>Cliente Asociado</th><th>Relación</th><th>Domicilio</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {id:'T-001',n:'Laura Hernández',cli:'J. Hernández',rel:'Cónyuge',dom:'Av. Tecnológico 120, Qro.'},
        {id:'T-002',n:'Carlos Medina',  cli:'J. Hernández',rel:'Amigo',  dom:'Blvd. Bernardo 45, Qro.'},
        {id:'T-003',n:'Sandra López',   cli:'M. García',   rel:'Hermana',dom:'Av. López Mateos 300, GDL'},
      ].map(t=>`<tr>
        <td style="font-weight:600">${t.id}</td><td>${t.n}</td>
        <td><span class="chip chip-blue">${t.cli}</span></td>
        <td>${t.rel}</td>
        <td style="font-size:12px;color:var(--c-muted)">${t.dom}</td>
        <td style="display:flex;gap:6px">
          <button class="btn-outline btn-sm">Ver</button>
          <button class="btn-outline btn-sm">✏</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 47</span></div>
  </div>`;
}

function viewCrearTestigo(){
  return `
  <div style="max-width:620px">
    <div class="section-header">
      <div class="section-title">Nuevo Testigo</div>
      <button class="btn-outline btn-sm" onclick="navigate('testigos')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Cliente Asociado *</label>
          <select><option>Seleccionar…</option><option>Juan Hernández</option><option>María García</option></select></div>
        <div class="form-group"><label>Nombre Completo *</label><input placeholder="Nombre del testigo"></div>
        <div class="form-group full"><label>Domicilio *</label><input placeholder="Calle, Número, Colonia, CP, Ciudad, Estado"></div>
        <div class="form-group"><label>Relación con el Cliente *</label>
          <select><option>Seleccionar…</option><option>Cónyuge</option><option>Familiar</option><option>Amigo</option><option>Otro</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('testigos')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Testigo registrado','success');navigate('testigos')">Guardar Testigo</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   HELPERS
   ============================================================ */

/* ============================================================
   SOFI · UTILIDADES COMPARTIDAS
   Filas de detalle, gráficas, modales, toasts y el cálculo
   del simulador de financiamiento.
   ============================================================ */

/* ---- FILA DE DETALLE DE SOLO LECTURA ---- */
function detailRow(label, value) {
  return `<div class="detail-row">
    <span class="dr-label">${label}</span>
    <span class="dr-value">${value}</span>
  </div>`;
}

/* ---- GRÁFICA DE BARRAS (ingresos vs egresos, por desarrollo, etc.) ---- */
function barChart(data, colors) {
  const max = Math.max(...data.map(d => Math.max(d.a, d.b || 0)));
  const c1 = (colors && colors[0]) || 'var(--c-accent)';
  const c2 = (colors && colors[1]) || 'var(--c-error)';
  return data.map(d => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative">
      <div style="display:flex;gap:2px;align-items:flex-end;width:100%">
        <div class="bar" style="background:${c1};height:${Math.round(d.a / max * 160)}px;flex:1" title="${d.label}: ${d.a}"></div>
        ${d.b ? `<div class="bar" style="background:${c2};height:${Math.round(d.b / max * 160)}px;flex:1" title="${d.label}: ${d.b}"></div>` : ''}
      </div>
      <div style="font-size:10px;color:var(--c-muted);margin-top:4px">${d.label}</div>
    </div>`).join('');
}

/* ---- GRÁFICA DE LÍNEA (tendencias mensuales) ---- */
function lineChart(values) {
  const max = Math.max(...values), min = Math.min(...values);
  const w = 600, h = 150, pad = 20;
  const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const ptFor = (v, i) => {
    const x = pad + (i * (w - 2 * pad) / (values.length - 1));
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    return { x, y };
  };
  const pts = values.map((v, i) => { const p = ptFor(v, i); return `${p.x},${p.y}`; }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px" role="img" aria-label="Tendencia mensual">
    <polyline fill="none" stroke="var(--c-accent)" stroke-width="2.5" points="${pts}"/>
    ${values.map((v, i) => {
      const p = ptFor(v, i);
      return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--c-accent)"/>
              <text x="${p.x}" y="${h}" text-anchor="middle" font-size="10" fill="#6B8FAF">${months[i] || ''}</text>`;
    }).join('')}
  </svg>`;
}

/* ---- MODAL ---- */
function showModal(id) {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  if (id === 'alertas-modal') {
    overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="Alertas del sistema">
      <div class="modal-title">🔔 Alertas del Sistema</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="alert-card error"><div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · J. Hernández</strong><span>$10,556 – vencido 12/Jun</span></div></div>
        <div class="alert-card"><div class="alert-icon">⚠</div>
          <div class="alert-text"><strong>Contrato próximo a vencer</strong><span>CON-0241 – vence en 5 días</span></div></div>
        <div class="alert-card error"><div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · R. Domínguez</strong><span>$14,167 – vencido 05/Jun</span></div></div>
      </div>
      <div class="modal-actions"><button class="btn-outline" onclick="closeModal()">Cerrar</button></div>
    </div>`;
  } else if (id === 'confirm-delete') {
    overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
      <div class="modal-title">⚠ Confirmar Eliminación</div>
      <div class="modal-body">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</div>
      <div class="modal-actions">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-danger" onclick="showToast('Registro eliminado','success');closeModal()">🗑 Eliminar</button>
      </div>
    </div>`;
  }
  root.appendChild(overlay);

  // Cierra el modal con tecla Escape
  document.addEventListener('keydown', escCloseModal);
}
function escCloseModal(e) {
  if (e.key === 'Escape') closeModal();
}
function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  document.removeEventListener('keydown', escCloseModal);
}

/* ---- TOAST ---- */
function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = `toast toast-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
  t.setAttribute('role', 'status');
  t.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : '') + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ---- CÁLCULO DEL SIMULADOR DE FINANCIAMIENTO ---- */
function calcSim() {
  const elPrecio = document.getElementById('sim-precio');
  const elEng = document.getElementById('sim-eng');
  const elPlazo = document.getElementById('sim-plazo');
  const elTasa = document.getElementById('sim-tasa');
  const p = parseFloat(elPrecio ? elPrecio.value : null) || 380000;
  const e = parseFloat(elEng ? elEng.value : null) / 100 || 0.2;
  const n = parseInt(elPlazo ? elPlazo.value : null) || 36;
  const r = parseFloat(elTasa ? elTasa.value : null) / 100 / 12 || 0.01;
  const eng = p * e;
  const fin = p - eng;
  const mensual = r ? fin * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : fin / n;
  const total = mensual * n + eng;
  const res = document.getElementById('sim-result');
  if (res) res.innerHTML = `
    <div class="sim-item"><div class="sim-label">Monto a Financiar</div><div class="sim-val">$${Math.round(fin).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Enganche</div><div class="sim-val">$${Math.round(eng).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Mensualidad</div><div class="sim-val">$${Math.round(mensual).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Total a Pagar</div><div class="sim-val">$${Math.round(total).toLocaleString()}</div></div>`;
}


/* ============================================================
   SOFI · VISTA: SISTEMA DE DISEÑO
   Documentación viva de los tokens y componentes de la marca.
   Accesible desde cualquier rol vía navigate('design-system').
   ============================================================ */
function viewDesignSystem() {
  const colors = [
    { name: 'Primary',  code: '#0F3B5C', css: '--c-primary' },
    { name: 'Accent',   code: '#50A746', css: '--c-accent' },
    { name: 'Light BG', code: '#EEF5E6', css: '--c-light-bg' },
    { name: 'Muted',    code: '#6B8FAF', css: '--c-muted' },
    { name: 'Error',    code: '#D94040', css: '--c-error' },
    { name: 'Warning',  code: '#E09B30', css: '--c-warn' },
    { name: 'Border',   code: '#D6E4F0', css: '--c-border' },
    { name: 'Surface',  code: '#F5F8FC', css: '--c-surface' },
  ];

  return `
  <div style="max-width:980px">
    <div style="margin-bottom:32px">
      <div class="login-logo" style="font-size:30px">SOFI<span class="s2">.</span></div>
      <p style="font-size:13px;color:var(--c-muted);margin-top:4px">
        Software Operativo para Fincas e Inmuebles — Tokens de diseño y componentes reutilizables.
      </p>
    </div>

    <!-- COLOR -->
    <div class="ds-section">
      <div class="ds-section-title">Paleta de color</div>
      <div class="ds-swatches">
        ${colors.map(c => `
          <div class="ds-swatch">
            <div class="ds-swatch-color" style="background:${c.code}"></div>
            <div class="ds-swatch-name">${c.name}</div>
            <div class="ds-swatch-code">${c.code} · var(${c.css})</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- TIPOGRAFÍA -->
    <div class="ds-section">
      <div class="ds-section-title">Tipografía</div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--c-primary)">Istok Web — Display 28px Bold</div>
        <div class="ds-type-meta">Usada en cifras KPI, logotipo y títulos de sección destacados.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:16px;font-weight:600;color:var(--c-primary)">Inter — Heading 16px SemiBold</div>
        <div class="ds-type-meta">Títulos de tarjeta y encabezados de sección.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:13px;color:var(--c-primary)">Inter — Body 13px Regular — para contenido general del sistema</div>
        <div class="ds-type-meta">Texto de tablas, formularios y párrafos.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:11px;color:var(--c-muted)">Inter — Small 11px — para etiquetas y metadatos</div>
        <div class="ds-type-meta">Subtítulos, ayudas de formulario, leyendas.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:10px;font-weight:600;color:var(--c-muted);text-transform:uppercase;letter-spacing:.5px">Inter 10px 600 · Caps labels</div>
        <div class="ds-type-meta">Encabezados de tabla y secciones del menú lateral.</div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="ds-section">
      <div class="ds-section-title">Botones</div>
      <div class="ds-row" style="margin-bottom:12px">
        <button class="btn-accent">＋ Nuevo</button>
        <button class="btn-outline">← Regresar</button>
        <button class="btn-danger">🗑 Eliminar</button>
        <button class="btn-accent" disabled>Deshabilitado</button>
      </div>
      <div style="max-width:300px">
        <button class="btn-primary">Botón Primario (ancho completo)</button>
      </div>
    </div>

    <!-- CHIPS -->
    <div class="ds-section">
      <div class="ds-section-title">Chips de estado</div>
      <div class="ds-row">
        <span class="chip chip-green">Activo</span>
        <span class="chip chip-red">Atrasado</span>
        <span class="chip chip-blue">Liquidado</span>
        <span class="chip chip-warn">Preventa</span>
        <span class="chip chip-gray">Inactivo</span>
      </div>
    </div>

    <!-- KPI + ALERTAS -->
    <div class="ds-section">
      <div class="ds-section-title">Tarjetas KPI y alertas</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Ingresos del Mes</div>
          <div class="kpi-value">$2.4M</div>
          <div class="kpi-trend trend-up">▲ 18% vs mes anterior</div>
        </div>
        <div class="kpi-card" style="border-left-color:var(--c-primary)">
          <div class="kpi-label">Contratos Activos</div>
          <div class="kpi-value">142</div>
          <div class="kpi-trend trend-up">▲ 6 nuevos esta semana</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;max-width:600px">
        <div class="alert-card error">
          <div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · J. Hernández</strong><span>$8,500 vencido el 01/Jun</span></div>
        </div>
        <div class="alert-card">
          <div class="alert-icon">⚠</div>
          <div class="alert-text"><strong>Contrato próximo a vencer</strong><span>C-0241 · L. Pérez vence en 5 días</span></div>
        </div>
      </div>
    </div>

    <!-- FORM ELEMENTS -->
    <div class="ds-section">
      <div class="ds-section-title">Elementos de formulario</div>
      <div class="form-card ds-card-demo">
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input type="text" placeholder="Ej. Juan Hernández López">
          </div>
          <div class="form-group">
            <label>RFC *</label>
            <input type="text" placeholder="HELJ801234AB1">
          </div>
          <div class="form-group">
            <label>Rol *</label>
            <select><option>Vendedor</option><option>Directivo</option><option>Asistente</option></select>
          </div>
          <div class="form-group">
            <label>Estatus</label>
            <select><option>Activo</option><option>Inactivo</option></select>
          </div>
        </div>
      </div>
    </div>

    <!-- ESPACIADO -->
    <div class="ds-section">
      <div class="ds-section-title">Espaciado y radio</div>
      <div class="ds-row">
        ${[4, 8, 12, 16, 24, 28].map(n => `
          <div class="ds-spacing-item">
            <div class="ds-spacing-box" style="width:${n}px;height:${n}px"></div>
            <span class="ds-spacing-label">${n}px</span>
          </div>`).join('')}
        <span class="ds-spacing-label" style="margin-left:16px">Radio: 6px · 8px · 12px · 16px</span>
      </div>
    </div>

    <p style="font-size:11px;color:var(--c-muted);margin-top:24px">
      SOFI v2.4.1 · Inter + Istok Web · Navy #0F3B5C · Verde #50A746 · © 2025
    </p>
  </div>`;
}

