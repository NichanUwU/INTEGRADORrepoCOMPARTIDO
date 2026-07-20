// nucleo de la aplicacion
(function() {
  'use strict';

  // configuracion
  const CONFIG = {
    defaultRole: 'directivo',
    toastDuration: 3000,
    animationDelay: 300,
    apiBaseUrl: window.API_URL || getApiUrl()
  };

  function getApiUrl() {
    const hostname = window.location.hostname;
    // En desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    // En AWS
    if (hostname === '54.208.140.131') {
      return 'http://54.208.140.131:8080/api';
    }
    // Por defecto
    return 'http://' + hostname + ':8080/api';
  }

  // configuracion de navegacion por roles
  const navConfig = {
    directivo: [
      { id: 'dashboard', href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
      { id: 'desarrollos', href: 'desarrollos.html', icon: '🏘', label: 'Desarrollos' },
      { id: 'lotes', href: 'lotes.html', icon: '🗂', label: 'Lotes' },
      { id: 'clientes', href: 'clientes.html', icon: '👥', label: 'Clientes' },
      { id: 'contratos', href: 'contratos.html', icon: '📄', label: 'Contratos' },
      { id: 'flujo', href: 'flujo.html', icon: '💰', label: 'Flujo' },
      { id: 'usuarios', href: 'usuarios.html', icon: '👤', label: 'Usuarios' }
    ],
    vendedor: [
      { id: 'dashboard', href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
      { id: 'clientes', href: 'clientes.html', icon: '👥', label: 'Clientes' },
      { id: 'contratos', href: 'contratos.html', icon: '📄', label: 'Contratos' },
      { id: 'lotes', href: 'lotes.html', icon: '🗂', label: 'Lotes' }
    ],
    asistente: [
      { id: 'dashboard', href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
      { id: 'clientes', href: 'clientes.html', icon: '👥', label: 'Clientes' },
      { id: 'desarrollos', href: 'desarrollos.html', icon: '🏘', label: 'Desarrollos' },
      { id: 'contratos', href: 'contratos.html', icon: '📄', label: 'Contratos' },
      { id: 'flujo', href: 'flujo.html', icon: '💰', label: 'Flujo' }
    ]
  };

  // metadata de roles (SOLO para etiquetas, el nombre viene de la BD)
  const roleLabels = {
    directivo: 'Directivo',
    vendedor: 'Vendedor',
    asistente: 'Asistente'
  };

  // etiquetas de paginas
  const pageLabels = {
    dashboard: 'Dashboard',
    clientes: 'Clientes',
    contratos: 'Contratos',
    lotes: 'Lotes',
    desarrollos: 'Desarrollos',
    'detalle-desarrollo': 'Detalle Desarrollo',
    flujo: 'Flujo de Efectivo',
    usuarios: 'Usuarios',
    login: 'Inicio Sesión'
  };

  // cliente HTTP con token
  const fetchApi = (url, options = {}) => {
    const baseUrl = CONFIG.apiBaseUrl;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const user = getUserFromStorage();
    if (user && user.token) {
      headers['Authorization'] = 'Bearer ' + user.token;
    }

    return fetch(baseUrl + url, {
      ...options,
      headers: headers
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.mensaje || err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(err => {
      console.error('API Error:', err);
      throw err;
    });
  };

  // estado de la aplicacion
  const state = {
    currentRole: 'directivo',
    user: null
  };

  const permissions = window.SOFI_PERMISSIONS || null;

  function getCurrentUserRole() {
    return utils.getRole(state.user || getUserFromStorage());
  }

  function canPerformAction(action) {
    if (permissions && typeof permissions.canPerformAction === 'function') {
      return permissions.canPerformAction(getCurrentUserRole(), action);
    }
    return true;
  }

  function setVisibility(id, visible) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = visible ? '' : 'none';
  }

  function applyActionPermissions() {
    setVisibility('btn-crear-cliente', canPerformAction('crear_cliente'));
    setVisibility('btn-crear-contrato', canPerformAction('crear_contrato'));
    setVisibility('btn-crear-lote', canPerformAction('crear_lote'));
    setVisibility('btn-crear-desarrollo', canPerformAction('crear_desarrollo'));
    setVisibility('btn-crear-usuario', canPerformAction('gestionar_usuarios'));
  }

  // utilidades seguras
  const utils = {
    getElement: (id) => document.getElementById(id),
    querySelector: (selector, context = document) => context.querySelector(selector),
    querySelectorAll: (selector, context = document) => context.querySelectorAll(selector),
    
    sanitizeText: (text) => {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    sanitizeAttribute: (value) => {
      if (!value) return '';
      const div = document.createElement('div');
      div.textContent = value;
      return div.textContent;
    },

    isArray: (value) => Array.isArray(value),
    isObject: (value) => value && typeof value === 'object' && !Array.isArray(value),
    
    getRole: (user) => {
      if (!utils.isObject(user)) return CONFIG.defaultRole;
      const role = user.role || user.Rol || CONFIG.defaultRole;
      return String(role).toLowerCase();
    }
  };

  // obtener usuario del localStorage
  function getUserFromStorage() {
    try {
      const data = localStorage.getItem('sofi-user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // guardar usuario en localStorage
  function saveUserToStorage(user) {
    try {
      localStorage.setItem('sofi-user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  }

  // limpiar usuario
  function clearUserFromStorage() {
    try {
      localStorage.removeItem('sofi-user');
    } catch (e) {
      console.error('Error clearing user:', e);
    }
  }

  // navegacion
  const navigation = {
    getCurrentPage: () => {
      const path = window.location.pathname;
      const page = path.split('/').pop().replace('.html', '') || 'dashboard';
      return page;
    },

    navigateTo: (page) => {
      const current = navigation.getCurrentPage();
      if (page === current) return;
      window.location.href = page + '.html';
    },

    renderNav: (role) => {
      const nav = utils.getElement('sb-nav');
      if (!nav) return;

      const items = navConfig[role] || navConfig[CONFIG.defaultRole];
      const currentPage = navigation.getCurrentPage();
      
      let html = '';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const activeClass = currentPage === item.id ? 'active' : '';
        html += `<a href="${item.href}" class="sidebar-nav-item ${activeClass}">`;
        html += `<span class="sidebar-nav-icon">${item.icon}</span>`;
        html += `<span>${item.label}</span>`;
        html += '</a>';
      }
      nav.innerHTML = html;
    },

    isPageAllowed: (role, page) => {
      if (permissions && typeof permissions.canAccessPage === 'function') {
        return permissions.canAccessPage(role, page);
      }
      return true;
    }
  };

  // actualizacion de la interfaz
  const uiUpdater = {
    updateShell: (user) => {
      const role = utils.getRole(user);
      state.currentRole = role;
      
      const badge = utils.getElement('sb-role-badge');
      const avatar = utils.getElement('sb-avatar');
      const nameEl = utils.getElement('sb-name');
      const roleEl = utils.getElement('sb-role');

      // Role badge
      if (badge) {
        badge.textContent = roleLabels[role] || 'Directivo';
      }
      
      // Avatar (iniciales)
      if (avatar && user) {
        const nombre = user.nombre || user.Nombre || '';
        const apellidos = user.apellidos || user.Apellidos || '';
        const iniciales = (nombre.charAt(0) || '') + (apellidos.charAt(0) || '');
        avatar.textContent = iniciales || 'U';
      }
      
      // ✅ NOMBRE COMPLETO DESDE LA BD
      if (nameEl) {
        const nombreCompleto = user?.NombreCompleto || user?.Empleado || user?.nombreCompleto || 'Usuario';
        nameEl.textContent = nombreCompleto;
      }
      
      // Role text
      if (roleEl) {
        roleEl.textContent = roleLabels[role] || 'Directivo';
      }

      const breadcrumb = utils.getElement('breadcrumb');
      if (breadcrumb) {
        const current = utils.querySelector('.current', breadcrumb);
        if (current) {
          const page = navigation.getCurrentPage();
          current.textContent = pageLabels[page] || 'Inicio';
        }
      }

      navigation.renderNav(role);
    },

    toggleSidebar: () => {
      const sidebar = utils.getElement('sidebar');
      const scrim = utils.getElement('sidebar-scrim');
      if (!sidebar || !scrim) return;
      
      const isOpen = sidebar.classList.toggle('open');
      scrim.style.display = isOpen ? 'block' : 'none';
    }
  };

  // sistema de notificaciones
  const toast = {
    container: null,

    getContainer: () => {
      if (toast.container) return toast.container;
      
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:400px;';
      document.body.appendChild(container);
      toast.container = container;
      return container;
    },

    show: (msg, type = 'info') => {
      const colors = {
        success: '#50A746',
        error: '#D94040',
        warn: '#E09B30',
        info: '#0F3B5C'
      };

      const container = toast.getContainer();
      const toastEl = document.createElement('div');
      toastEl.style.cssText = `background:white;padding:14px 18px;border-radius:8px;border-left:4px solid ${colors[type] || colors.info};box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:14px;color:#1a1a1a;`;
      toastEl.textContent = msg;
      
      container.appendChild(toastEl);
      
      setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (toastEl.parentNode) {
            toastEl.remove();
          }
        }, CONFIG.animationDelay);
      }, CONFIG.toastDuration);
    }
  };

  // sistema de modales
  const modal = {
    close: () => {
      const root = utils.getElement('modal-root');
      if (root) root.innerHTML = '';
    },

    render: (html) => {
      const root = utils.getElement('modal-root');
      if (!root) return;
      
      root.innerHTML = '';
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => {
        if (e.target === overlay) modal.close();
      };
      overlay.innerHTML = html;
      root.appendChild(overlay);
    },

    showAlertModal: () => {
      Promise.all([
        fetchApi('/clientes').catch(() => []),
        fetchApi('/contratos').catch(() => [])
      ])
      .then((results) => {
        const clientes = results[0];
        const contratos = results[1];
        const alertas = [];
        
        if (utils.isArray(clientes)) {
          const inactivos = clientes.filter(c => c.Estatus === 'Inactivo');
          if (inactivos.length > 0) {
            alertas.push({
              titulo: 'Clientes inactivos',
              descripcion: inactivos.length + ' cliente(s) con estatus inactivo',
              tipo: 'warn'
            });
          }
        }
        
        if (utils.isArray(contratos)) {
          const atrasados = contratos.filter(c => c.Estatus === 'Atrasado');
          if (atrasados.length > 0) {
            alertas.push({
              titulo: 'Contratos atrasados',
              descripcion: atrasados.length + ' contrato(s) con pagos atrasados',
              tipo: 'error'
            });
          }
        }
        
        if (alertas.length === 0) {
          alertas.push({
            titulo: 'Todo en orden',
            descripcion: 'No hay alertas pendientes',
            tipo: 'success'
          });
        }
        
        let html = '';
        html += '<div class="modal-box" style="max-width:600px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
        html += `<div class="modal-title">🔔 Alertas <span style="background:var(--c-error);color:#fff;border-radius:50%;padding:2px 8px;font-size:12px;margin-left:8px;">${alertas.length}</span></div>`;
        html += '<button onclick="window.modal.close()" style="font-size:20px;background:none;border:none;cursor:pointer;">✕</button>';
        html += '</div>';
        html += '<div style="display:flex;flex-direction:column;gap:10px;max-height:400px;overflow-y:auto;">';
        
        for (let i = 0; i < alertas.length; i++) {
          const a = alertas[i];
          const borderColor = a.tipo === 'error' ? 'var(--c-error)' : a.tipo === 'warn' ? 'var(--c-warn)' : 'var(--c-success)';
          const icon = a.tipo === 'error' ? '❗' : a.tipo === 'warn' ? '⚠️' : '✅';
          
          html += `<div class="alert-card ${a.tipo}" style="border-left:4px solid ${borderColor};">`;
          html += `<div class="alert-icon" style="font-size:18px;">${icon}</div>`;
          html += `<div class="alert-text"><strong>${a.titulo}</strong><span>${a.descripcion}</span></div>`;
          html += '</div>';
        }
        
        html += '</div>';
        html += '<div class="modal-actions" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--c-border);">';
        html += '<button class="btn-outline" onclick="window.modal.close()">Cerrar</button>';
        html += '</div>';
        html += '</div>';
        
        modal.render(html);
        
        const notif = utils.getElement('notif-count');
        if (notif) notif.textContent = alertas.length;
      })
      .catch((err) => {
        console.error('Error loading alerts:', err);
        toast.show('Error al cargar las alertas', 'error');
        const html = '<div class="modal-box"><div class="modal-title">🔔 Alertas</div><div class="modal-body">No se pudieron cargar las alertas.</div><div class="modal-actions"><button class="btn-outline" onclick="window.modal.close()">Cerrar</button></div></div>';
        modal.render(html);
      });
    },

    showConfirmModal: () => {
      const html = `<div class="modal-box"><div class="modal-title">⚠ Confirmar</div><div class="modal-body">¿Eliminar este registro?</div><div class="modal-actions"><button class="btn-outline" onclick="window.modal.close()">Cancelar</button><button class="btn-danger" onclick="window.toast.show('Eliminado','success');window.modal.close()">Eliminar</button></div></div>`;
      modal.render(html);
    },

    show: (id) => {
      const handlers = {
        'alertas-modal': modal.showAlertModal,
        'confirm-delete': modal.showConfirmModal
      };
      
      const handler = handlers[id];
      if (handler) handler();
    },

    open: (id) => {
      const modalEl = utils.getElement(id);
      if (modalEl) modalEl.style.display = 'flex';
    },

    closeGeneric: (id) => {
      const modalEl = utils.getElement(id);
      if (modalEl) modalEl.style.display = 'none';
    }
  };

  // manejo de autenticacion
  const auth = {
    login: () => {
      const email = utils.getElement('login-email');
      const password = utils.getElement('login-password');
      const error = utils.getElement('login-error');

      if (!email || !email.value.trim() || !password || !password.value.trim()) {
        if (error) {
          error.textContent = 'Ingresa tu correo y contraseña';
          error.classList.add('visible');
        }
        return;
      }

      fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({
          NombreUsuario: email.value.trim(),
          Contrasena: password.value.trim()
        })
      })
      .then((data) => {
        if (data.status === 'error') {
          throw new Error(data.mensaje || 'Credenciales incorrectas');
        }
        
        // ✅ GUARDAR DATOS DEL USUARIO (NOMBRE DESDE BD)
        const userData = {
          id: data.IdUsuario,
          username: data.NombreUsuario,
          role: (data.Rol || 'directivo').toLowerCase(),
          nombre: data.Nombre || '',
          apellidos: data.Apellidos || '',
          NombreCompleto: data.NombreCompleto || (data.Nombre || '') + ' ' + (data.Apellidos || ''),
          Empleado: data.NombreCompleto || (data.Nombre || '') + ' ' + (data.Apellidos || '')
        };
        
        saveUserToStorage(userData);
        window.location.href = 'dashboard.html';
      })
      .catch((err) => {
        console.error('Login error:', err);
        if (error) {
          error.textContent = err.message || 'Error al iniciar sesión';
          error.classList.add('visible');
        }
      });
    },

    logout: () => {
      clearUserFromStorage();
      window.location.href = 'login.html';
    }
  };

  // sistema de alertas
  const alerts = {
    markAsRead: () => {
      const notif = utils.getElement('notif-count');
      if (notif) {
        notif.textContent = '0';
        notif.style.background = 'var(--c-muted)';
      }
      toast.show('Alertas leídas', 'success');
      setTimeout(modal.close, 400);
    }
  };

  // carga de paginas
  const pageLoader = {
    loadPage: (page) => {
      const loaders = {
        'dashboard': 'cargarDashboard',
        'clientes': 'cargarClientes',
        'contratos': 'cargarContratos',
        'lotes': 'cargarLotes',
        'desarrollos': 'cargarDesarrollos',
        'detalle-desarrollo': 'cargarDetalleDesarrollo',
        'flujo': 'cargarFlujo',
        'usuarios': 'cargarUsuarios'
      };

      const loader = loaders[page];
      if (loader && typeof window[loader] === 'function') {
        try {
          window[loader]();
        } catch (err) {
          console.error('Error loading page ' + page + ':', err);
          toast.show('Error al cargar ' + (pageLabels[page] || 'la página'), 'error');
        }
      }
    }
  };

  // inicializacion de la aplicacion
  const app = {
    init: () => {
      const user = getUserFromStorage();
      const page = navigation.getCurrentPage();
      const isLogin = page === 'login';

      const loadingScreen = utils.getElement('loading-screen');
      const sessionError = utils.getElement('session-error');
      const loginScreen = utils.getElement('login-screen');
      const appShell = utils.getElement('app-shell');

      // Ocultar pantalla de carga
      if (loadingScreen) loadingScreen.style.display = 'none';

      // Si NO hay usuario y NO está en login → mostrar error de sesión
      if (!user && !isLogin) {
        if (sessionError) sessionError.style.display = 'flex';
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'none';
        return;
      }

      // Si hay usuario y está en login → redirigir a dashboard
      if (user && isLogin) {
        window.location.href = 'dashboard.html';
        return;
      }

      // Si no hay usuario y está en login → mostrar login
      if (!user && isLogin) {
        if (sessionError) sessionError.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (appShell) appShell.style.display = 'none';
        return;
      }

      // Si hay usuario → mostrar app
      if (user) {
        if (sessionError) sessionError.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';
        
        const role = utils.getRole(user);
        if (!navigation.isPageAllowed(role, page)) {
          toast.show('No tienes permiso para acceder a esta sección', 'error');
          window.location.href = 'dashboard.html';
          return;
        }

        state.user = user;
        uiUpdater.updateShell(user);
        applyActionPermissions();
        pageLoader.loadPage(page);
      }
    }
  };

  // exponer funciones necesarias globalmente
  window.app = app;
  window.navigate = navigation.navigateTo;
  window.doLogin = auth.login;
  window.doLogout = auth.logout;
  window.toggleSidebar = uiUpdater.toggleSidebar;
  window.showModal = modal.show;
  window.closeModal = modal.close;
  window.marcarLeidas = alerts.markAsRead;
  window.canPerformAction = canPerformAction;
  window.getCurrentUserRole = getCurrentUserRole;
  window.applyActionPermissions = applyActionPermissions;
  window.showToast = toast.show;
  window.abrirModal = modal.open;
  window.cerrarModal = modal.closeGeneric;
  window.modal = modal;
  window.toast = toast;
  window.fetchApi = fetchApi;
  window.navigateTo = navigation.navigateTo;

  // iniciar aplicacion
  document.addEventListener('DOMContentLoaded', app.init);

})();