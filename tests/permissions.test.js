const assert = require('assert');
const permissions = require('../js/core/permissions.js');

assert.strictEqual(permissions.normalizarRol('DIRECTIVO '), 'directivo');
assert.strictEqual(permissions.normalizarRol('Admin'), 'administrador');
assert.strictEqual(permissions.normalizarRol('vendedor'), 'vendedor');
assert.strictEqual(permissions.canAccessPage('vendedor', 'usuarios'), false);
assert.strictEqual(permissions.canAccessPage('vendedor', 'clientes'), true);
assert.strictEqual(permissions.canAccessPage('administrador', 'usuarios'), true);
assert.strictEqual(permissions.canAccessPage('asistente', 'flujo'), true);
assert.strictEqual(permissions.canPerformAction('vendedor', 'crear_contrato'), true);
assert.strictEqual(permissions.canPerformAction('vendedor', 'crear_desarrollo'), false);

console.log('permissions tests passed');
