// CRUD CLIENTES

function cargarClientes() {
  let url = '/clientes';
  try {
    const user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
    if ((user.Rol || user.role || '').toLowerCase().trim() === 'vendedor' && user.IdEmpleado) {
      url += '?IdEmpleado=' + user.IdEmpleado;
    }
  } catch(e) {}

  fetchApi(url)
    .then(function(data) {
      renderClientes(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-clientes-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando clientes: ' + error.message, 'error');
    });
}

function renderClientes(data) {
  window.exportCurrentTable = () => window.exportToCSV ? window.exportToCSV(data, 'clientes.csv') : null;
  var tbody = document.getElementById('tabla-clientes-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">ðŸ‘¥</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay clientes registrados</div><div style="font-size:14px;margin-top:8px;">Haz clic en Nuevo Cliente para comenzar.</div></div></td></tr>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var c = data[i];
    html += '<tr>';
    html += '<td style="font-weight:600">' + (c.IdCliente || '') + '</td>';
    html += '<td>' + (c.Nombre || '') + '</td>';
    html += '<td>' + (c.Apellidos || '') + '</td>';
    html += '<td>' + (c.Telefono || '') + '</td>';
    html += '<td>' + (c.Ciudad || '') + '</td>';
    html += '<td>' + (c.Estado || '') + '</td>';
    html += '<td style="font-size:12px;font-family:monospace">' + (c.INE || '') + '</td>';
    html += '<td style="font-size:12px;font-family:monospace">' + (c.CURP || '') + '</td>';
    var role = 'invitado';
    try { var user = JSON.parse(localStorage.getItem('sofi-user') || '{}'); role = (user.role || user.Rol || '').toLowerCase().trim(); } catch(e) {}
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    if (role === 'directivo' || role === 'vendedor' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarCliente(' + c.IdCliente + ')">✏️ Editar</button>';
    }
    if (role === 'directivo' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-danger btn-sm" onclick="eliminarCliente(' + c.IdCliente + ')">🗑️ Eliminar</button>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('clientes-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' clientes';
}

function guardarClienteModal() {
  var nombre = document.getElementById('cli-nombre');
  var apellidos = document.getElementById('cli-apellidos');
  var direccion = document.getElementById('cli-direccion');
  var cp = document.getElementById('cli-cp');
  var ciudad = document.getElementById('cli-ciudad');
  var estado = document.getElementById('cli-estado');
  var telefono = document.getElementById('cli-telefono');
  var ine = document.getElementById('cli-ine');
  var curp = document.getElementById('cli-curp');

  if (!nombre || !nombre.value.trim() || !apellidos || !apellidos.value.trim() || !direccion || !direccion.value.trim() ||
      !cp || !cp.value.trim() || !ciudad || !ciudad.value.trim() || !estado || !estado.value.trim() ||
      !telefono || !telefono.value.trim() || !ine || !ine.value.trim() || !curp || !curp.value.trim()) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Nombre: nombre.value.trim(),
    Apellidos: apellidos.value.trim(),
    Direccion: direccion.value.trim(),
    Casa_Apartamento: document.getElementById('cli-casa')?.value.trim() || '',
    Codigo_Postal: cp.value.trim(),
    Ciudad: ciudad.value.trim(),
    Estado: estado.value.trim(),
    Telefono: telefono.value.trim(),
    Email: document.getElementById('cli-email')?.value.trim() || '',
    INE: ine.value.trim(),
    CURP: curp.value.trim()
  };

  try {
    const user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
    if (user.IdEmpleado) {
      payload.IdEmpleado = user.IdEmpleado;
    }
  } catch(e) {}

  fetchApi('/clientes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Cliente registrado exitosamente', 'success');
      cerrarModal('crear-cliente-modal');
      cargarClientes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarCliente(id) {
  fetchApi('/clientes/' + id)
    .then(function(cliente) {
      document.getElementById('edit-cliente-id').value = cliente.IdCliente;
      document.getElementById('edit-cli-nombre').value = cliente.Nombre || '';
      document.getElementById('edit-cli-apellidos').value = cliente.Apellidos || '';
      document.getElementById('edit-cli-direccion').value = cliente.Direccion || '';
      document.getElementById('edit-cli-casa').value = cliente.Casa_Apartamento || '';
      document.getElementById('edit-cli-cp').value = cliente.Codigo_Postal || '';
      document.getElementById('edit-cli-ciudad').value = cliente.Ciudad || '';
      document.getElementById('edit-cli-estado').value = cliente.Estado || '';
      document.getElementById('edit-cli-telefono').value = cliente.Telefono || '';
      document.getElementById('edit-cli-ine').value = cliente.INE || '';
      document.getElementById('edit-cli-curp').value = cliente.CURP || '';
      abrirModal('editar-cliente-modal');
    })
    .catch(function(error) {
      showToast('Error cargando cliente: ' + error.message, 'error');
    });
}

function actualizarClienteModal() {
  var id = parseInt(document.getElementById('edit-cliente-id').value);
  var nombre = document.getElementById('edit-cli-nombre');
  var apellidos = document.getElementById('edit-cli-apellidos');
  var direccion = document.getElementById('edit-cli-direccion');
  var cp = document.getElementById('edit-cli-cp');
  var ciudad = document.getElementById('edit-cli-ciudad');
  var estado = document.getElementById('edit-cli-estado');
  var telefono = document.getElementById('edit-cli-telefono');
  var ine = document.getElementById('edit-cli-ine');
  var curp = document.getElementById('edit-cli-curp');

  if (!nombre || !nombre.value.trim() || !apellidos || !apellidos.value.trim() || !direccion || !direccion.value.trim() ||
      !cp || !cp.value.trim() || !ciudad || !ciudad.value.trim() || !estado || !estado.value.trim() ||
      !telefono || !telefono.value.trim() || !ine || !ine.value.trim() || !curp || !curp.value.trim()) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Nombre: nombre.value.trim(),
    Apellidos: apellidos.value.trim(),
    Direccion: direccion.value.trim(),
    Casa_Apartamento: document.getElementById('edit-cli-casa')?.value.trim() || '',
    Codigo_Postal: cp.value.trim(),
    Ciudad: ciudad.value.trim(),
    Estado: estado.value.trim(),
    Telefono: telefono.value.trim(),
    Email: document.getElementById('edit-cli-email')?.value.trim() || '',
    INE: ine.value.trim(),
    CURP: curp.value.trim()
  };

  fetchApi('/clientes/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Cliente actualizado', 'success');
      cerrarModal('editar-cliente-modal');
      cargarClientes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarCliente(id) {
  if (!confirm('Ã‚¿Eliminar este cliente?')) return;
  
  fetchApi('/clientes/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('âœ… Cliente eliminado', 'success');
      cargarClientes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

window.cargarClientes = cargarClientes;
window.guardarClienteModal = guardarClienteModal;
window.abrirModalEditarCliente = abrirModalEditarCliente;
window.actualizarClienteModal = actualizarClienteModal;
window.eliminarCliente = eliminarCliente;
