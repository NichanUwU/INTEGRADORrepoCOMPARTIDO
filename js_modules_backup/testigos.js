/* ============================================================
   SOFI — MÓDULO DE TESTIGOS
   ============================================================ */

var globalClientes = [];

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  cargarClientesYTestigos();
});

function cargarClientesYTestigos() {
  // Primero cargamos los clientes para el select
  var urlClientes = '/clientes';
  try {
    var user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
    var role = (user.role || user.Rol || '').toLowerCase().trim();
    if (role === 'vendedor' && user.IdEmpleado) {
      urlClientes += '?IdEmpleado=' + user.IdEmpleado;
    }
  } catch(e) {}

  fetchApi(urlClientes)
    .then(function(data) {
      globalClientes = data || [];
      cargarTestigos(); // Una vez tenemos los clientes, cargamos los testigos
    })
    .catch(function(error) {
      console.error("Error al cargar clientes para testigos:", error);
      showToast('No se pudieron cargar los clientes', 'error');
      cargarTestigos(); // Intentar cargar testigos de todos modos
    });
}

function cargarTestigos() {
  var url = '/testigos';
  try {
    var user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
    var role = (user.role || user.Rol || '').toLowerCase().trim();
    if (role === 'vendedor' && user.IdEmpleado) {
      url += '?IdEmpleado=' + user.IdEmpleado;
    }
  } catch(e) {}

  fetchApi(url)
    .then(function(data) {
      window.allTestigos = data || [];
      filtrarTestigos();
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-testigos-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando testigos: ' + error.message, 'error');
    });
}

function filtrarTestigos() {
  if (!window.allTestigos) return;
  var q = (document.getElementById('search-testigo')?.value || '').toLowerCase();
  
  var filtrados = window.allTestigos.filter(function(t) {
    if (!q) return true;
    var searchStr = (t.Nombre + ' ' + t.Apellidos + ' ' + (t.Cliente || '')).toLowerCase();
    return searchStr.includes(q);
  });
  
  renderTestigos(filtrados);
}

function renderTestigos(data) {
  var tbody = document.getElementById('tabla-testigos-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">👥</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay testigos registrados</div><div style="font-size:14px;margin-top:8px;">Haz clic en Nuevo Testigo para comenzar.</div></div></td></tr>';
    var pag = document.getElementById('testigos-paginacion');
    if (pag) pag.textContent = 'Mostrando 0 testigos';
    return;
  }
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var t = data[i];
    html += '<tr>';
    html += '<td style="font-weight:600">' + (t.IdTestigo || '') + '</td>';
    html += '<td>' + (t.Nombre || '') + ' ' + (t.Apellidos || '') + '</td>';
    html += '<td>' + (t.Telefono || '') + '</td>';
    html += '<td>' + (t.Ciudad || '') + '</td>';
    html += '<td>' + (t.Estado || '') + '</td>';
    html += '<td><span class="chip chip-gray">' + (t.Cliente || '') + '</span></td>';
    
    var role = 'invitado';
    try { 
      var user = JSON.parse(localStorage.getItem('sofi-user') || '{}'); 
      role = (user.role || user.Rol || '').toLowerCase().trim(); 
    } catch(e) {}
    
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">';
    if (role === 'directivo' || role === 'vendedor' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarTestigo(' + t.IdTestigo + ')">Editar</button>';
    }
    // EL VENDEDOR NO PUEDE ELIMINAR TESTIGOS
    if (role === 'directivo' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-danger btn-sm" onclick="eliminarTestigo(' + t.IdTestigo + ')">Eliminar</button>';
    }
    html += '</td>';
    html += '</tr>';
  }
  
  tbody.innerHTML = html;
  
  var pag = document.getElementById('testigos-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' testigos';
}

function popularClientesSelect(selectId) {
  var sel = document.getElementById(selectId);
  if (!sel) return;
  
  var optionsHtml = '<option value="">Selecciona un cliente...</option>';
  for (var i = 0; i < globalClientes.length; i++) {
    var c = globalClientes[i];
    optionsHtml += '<option value="' + c.IdCliente + '">' + c.Nombre + ' ' + c.Apellidos + '</option>';
  }
  sel.innerHTML = optionsHtml;
}

function abrirModalCrearTestigo() {
  if (globalClientes.length === 0) {
      showToast('Necesitas tener al menos un cliente registrado primero', 'warn');
      return;
  }
  document.getElementById('form-crear-testigo').reset();
  popularClientesSelect('t-cliente');
  abrirModal('crear-testigo-modal');
}

function guardarTestigo() {
  var idCliente = document.getElementById('t-cliente').value;
  if (!idCliente) {
      showToast('Debes seleccionar un Cliente Asociado', 'warn');
      return;
  }

  var body = {
    Nombre: document.getElementById('t-nombre').value.trim(),
    Apellidos: document.getElementById('t-apellidos').value.trim(),
    Direccion: document.getElementById('t-direccion').value.trim(),
    Casa_Apartamento: document.getElementById('t-casa').value.trim(),
    Codigo_Postal: document.getElementById('t-cp').value.trim(),
    Ciudad: document.getElementById('t-ciudad').value.trim(),
    Estado: document.getElementById('t-estado').value.trim(),
    Telefono: document.getElementById('t-telefono').value.trim(),
    IdCliente: idCliente
  };

  fetchApi('/testigos', { method: 'POST', body: body })
    .then(function() {
      showToast('Testigo registrado exitosamente', 'success');
      cerrarModal('crear-testigo-modal');
      cargarTestigos();
    })
    .catch(function(err) {
      showToast(err.message, 'error');
    });
}

function abrirModalEditarTestigo(id) {
  var t = (window.allTestigos || []).find(x => x.IdTestigo === id);
  if (!t) return;

  popularClientesSelect('edit-t-cliente');

  document.getElementById('edit-t-id').value = t.IdTestigo;
  document.getElementById('edit-t-nombre').value = t.Nombre || '';
  document.getElementById('edit-t-apellidos').value = t.Apellidos || '';
  document.getElementById('edit-t-direccion').value = t.Direccion || '';
  document.getElementById('edit-t-casa').value = t.Casa_Apartamento || '';
  document.getElementById('edit-t-cp').value = t.Codigo_Postal || '';
  document.getElementById('edit-t-ciudad').value = t.Ciudad || '';
  document.getElementById('edit-t-estado').value = t.Estado || '';
  document.getElementById('edit-t-telefono').value = t.Telefono || '';
  document.getElementById('edit-t-cliente').value = t.IdCliente || '';

  abrirModal('editar-testigo-modal');
}

function actualizarTestigo() {
  var id = document.getElementById('edit-t-id').value;
  if (!id) return;

  var idCliente = document.getElementById('edit-t-cliente').value;
  if (!idCliente) {
      showToast('Debes seleccionar un Cliente Asociado', 'warn');
      return;
  }

  var body = {
    Nombre: document.getElementById('edit-t-nombre').value.trim(),
    Apellidos: document.getElementById('edit-t-apellidos').value.trim(),
    Direccion: document.getElementById('edit-t-direccion').value.trim(),
    Casa_Apartamento: document.getElementById('edit-t-casa').value.trim(),
    Codigo_Postal: document.getElementById('edit-t-cp').value.trim(),
    Ciudad: document.getElementById('edit-t-ciudad').value.trim(),
    Estado: document.getElementById('edit-t-estado').value.trim(),
    Telefono: document.getElementById('edit-t-telefono').value.trim(),
    IdCliente: idCliente
  };

  fetchApi('/testigos/' + id, { method: 'PUT', body: body })
    .then(function() {
      showToast('Testigo actualizado correctamente', 'success');
      cerrarModal('editar-testigo-modal');
      cargarTestigos();
    })
    .catch(function(err) {
      showToast(err.message, 'error');
    });
}

function eliminarTestigo(id) {
  if (!confirm('¿Estás seguro de eliminar este testigo? Esta acción no se puede deshacer.')) return;
  fetchApi('/testigos/' + id, { method: 'DELETE' })
    .then(function() {
      showToast('Testigo eliminado', 'success');
      cargarTestigos();
    })
    .catch(function(err) {
      showToast(err.message, 'error');
    });
}
