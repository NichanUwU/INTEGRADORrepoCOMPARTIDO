// CONFIGURACIÓN GLOBAL DEL SISTEMA

// CONSTANTES DE ROLES
const ROLES = {
  DIRECTIVO: 'directivo',
  VENDEDOR: 'vendedor',
  ASISTENTE: 'asistente'
};

// CONFIGURACIÓN DE API
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDev) {
    return 'http://localhost:8080/api';
  }
  
  // En AWS
  if (hostname === '54.208.140.131') {
    return 'http://54.208.140.131:8080/api';
  }
  
  // En producción con dominio personalizado
  return window.ENV?.API_URL || 'https://' + hostname + '/api';
};

// CONFIGURACIÓN DE ROLES
const roleMeta = {
  [ROLES.DIRECTIVO]: { 
    label: 'Directivo', 
    badge: '👔', 
    name: 'Directivo',
    color: '#0F3B5C',
    description: 'Acceso total al sistema'
  },
  [ROLES.VENDEDOR]: { 
    label: 'Vendedor', 
    badge: '💼', 
    name: 'Ejecutivo de Ventas',
    color: '#50A746',
    description: 'Gestión de clientes y contratos'
  },
  [ROLES.ASISTENTE]: { 
    label: 'Asistente', 
    badge: '📋', 
    name: 'Asistente',
    color: '#E09B30',
    description: 'Apoyo administrativo'
  }
};

// NAVEGACIÓN POR ROLES
const navConfig = {
  [ROLES.DIRECTIVO]: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'desarrollos', label: 'Desarrollos', icon: '🏘️', href: 'desarrollos.html' },
    { id: 'lotes', label: 'Lotes', icon: '🏗️', href: 'lotes.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
    { id: 'flujo', label: 'Flujo de Efectivo', icon: '💰', href: 'flujo.html' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', href: 'usuarios.html' },
  ],
  [ROLES.VENDEDOR]: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
    { id: 'lotes', label: 'Lotes', icon: '🏗️', href: 'lotes.html' },
  ],
  [ROLES.ASISTENTE]: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { id: 'clientes', label: 'Clientes', icon: '👥', href: 'clientes.html' },
    { id: 'desarrollos', label: 'Desarrollos', icon: '🏘️', href: 'desarrollos.html' },
    { id: 'contratos', label: 'Contratos', icon: '📄', href: 'contratos.html' },
  ]
};

// ETIQUETAS DE PÁGINAS
const pageLabels = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  contratos: 'Contratos',
  desarrollos: 'Desarrollos',
  lotes: 'Lotes',
  flujo: 'Flujo de Efectivo',
  usuarios: 'Usuarios',
  'detalle-desarrollo': 'Detalle Desarrollo',
  login: 'Inicio de Sesión'
};

// PERMISOS POR ROL
const permissions = {
  [ROLES.DIRECTIVO]: {
    canEdit: true,
    canDelete: true,
    canCreate: true,
    canViewAll: true,
    canExport: true
  },
  [ROLES.VENDEDOR]: {
    canEdit: true,
    canDelete: false,
    canCreate: true,
    canViewAll: false,
    canExport: true
  },
  [ROLES.ASISTENTE]: {
    canEdit: false,
    canDelete: false,
    canCreate: false,
    canViewAll: false,
    canExport: false
  }
};

// VALIDACIÓN DE CONFIGURACIÓN
const validateConfig = () => {
  const errors = [];
  
  // Verificar que todos los roles tengan navegación
  Object.values(ROLES).forEach(role => {
    if (!navConfig[role]) {
      errors.push(`Falta configuración de navegación para: ${role}`);
    }
    if (!roleMeta[role]) {
      errors.push(`Falta metadata para: ${role}`);
    }
  });
  
  // Verificar que la API URL esté definida
  const apiUrl = getApiUrl();
  if (!apiUrl || apiUrl === '') {
    errors.push('API URL no configurada correctamente');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:', errors);
    return false;
  }
  
  console.log('✅ Configuración validada correctamente');
  return true;
};

// EXPORTAR CONFIGURACIÓN
// Para uso con módulos ES6
const config = {
  API_URL: getApiUrl(),
  ROLES,
  roleMeta,
  navConfig,
  pageLabels,
  permissions,
  validateConfig,
  isDevelopment: () => ['localhost', '127.0.0.1'].includes(window.location.hostname),
  getRoleMeta: (role) => roleMeta[role] || roleMeta[ROLES.DIRECTIVO],
  getNavItems: (role) => navConfig[role] || navConfig[ROLES.DIRECTIVO],
  getPageLabel: (page) => pageLabels[page] || page,
  hasPermission: (role, permission) => {
    return permissions[role]?.[permission] || false;
  }
};

// Congelar para evitar modificaciones accidentales
Object.freeze(config);
Object.freeze(ROLES);
Object.freeze(roleMeta);
Object.freeze(navConfig);
Object.freeze(pageLabels);
Object.freeze(permissions);

// EXPOSICIÓN GLOBAL (para compatibilidad)
// Solo exponer lo necesario, de forma controlada
window.CONFIG = config;

// Mantener compatibilidad con código existente
window.API_URL = config.API_URL;
window.roleMeta = config.roleMeta;
window.navConfig = config.navConfig;
window.pageLabels = config.pageLabels;
window.ROLES = config.ROLES;
window.permissions = config.permissions;