(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.SOFI_PERMISSIONS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const ROLE_ALIASES = {
    directivo: 'directivo',
    director: 'directivo',
    administrador: 'administrador',
    admin: 'administrador',
    vendedor: 'vendedor',
    asistente: 'asistente'
  };

  const ROLE_LABELS = {
    directivo: 'Directivo',
    administrador: 'Administrador',
    vendedor: 'Vendedor',
    asistente: 'Asistente'
  };

  const PAGE_ACCESS = {
    directivo: ['dashboard', 'clientes', 'contratos', 'lotes', 'desarrollos', 'flujo', 'usuarios', 'detalle-desarrollo', 'detalle-lote', 'login'],
    administrador: ['dashboard', 'clientes', 'contratos', 'lotes', 'desarrollos', 'flujo', 'usuarios', 'detalle-desarrollo', 'detalle-lote', 'login'],
    vendedor: ['dashboard', 'clientes', 'contratos', 'lotes', 'detalle-desarrollo', 'detalle-lote', 'login'],
    asistente: ['dashboard', 'clientes', 'contratos', 'lotes', 'desarrollos', 'flujo', 'detalle-desarrollo', 'detalle-lote', 'login']
  };

  const ACTION_ACCESS = {
    directivo: ['crear_cliente', 'editar_cliente', 'eliminar_cliente', 'crear_contrato', 'editar_contrato', 'eliminar_contrato', 'crear_lote', 'editar_lote', 'eliminar_lote', 'crear_desarrollo', 'editar_desarrollo', 'eliminar_desarrollo', 'gestionar_usuarios'],
    administrador: ['crear_cliente', 'editar_cliente', 'eliminar_cliente', 'crear_contrato', 'editar_contrato', 'eliminar_contrato', 'crear_lote', 'editar_lote', 'eliminar_lote', 'crear_desarrollo', 'editar_desarrollo', 'eliminar_desarrollo', 'gestionar_usuarios'],
    vendedor: ['crear_cliente', 'editar_cliente', 'crear_contrato', 'editar_contrato', 'crear_lote', 'editar_lote'],
    asistente: ['crear_cliente', 'editar_cliente', 'crear_contrato', 'editar_contrato', 'crear_desarrollo', 'editar_desarrollo']
  };

  function normalizarRol(role) {
    if (!role) return 'directivo';
    const normalized = String(role).trim().toLowerCase();
    return ROLE_ALIASES[normalized] || normalized;
  }

  function getRoleLabel(role) {
    return ROLE_LABELS[normalizarRol(role)] || ROLE_LABELS.directivo;
  }

  function getAllowedPages(role) {
    return PAGE_ACCESS[normalizarRol(role)] || PAGE_ACCESS.directivo;
  }

  function canAccessPage(role, page) {
    if (!page) return true;
    const normalizedPage = String(page).trim().toLowerCase();
    return getAllowedPages(role).includes(normalizedPage);
  }

  function canPerformAction(role, action) {
    if (!action) return true;
    return (ACTION_ACCESS[normalizarRol(role)] || ACTION_ACCESS.directivo).includes(action);
  }

  return {
    normalizarRol,
    getRoleLabel,
    getAllowedPages,
    canAccessPage,
    canPerformAction
  };
});
