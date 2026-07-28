// CRUD USUARIOS

function cargarUsuarios() {
  fetchApi('/empleados')
    .then(function(data) {
      renderUsuarios(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-usuarios-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando usuarios: ' + error.message, 'error');
    });
}

function renderUsuarios(data) {
  var tbody = document.getElementById('tabla-usuarios-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay empleados registrados.</td></tr>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var u = data[i];
    var chipRol = 'chip ';
    if (u.Cargo === 'Directivo' || u.Cargo === 'Director') chipRol += 'chip-blue';
    else if (u.Cargo === 'Vendedor') chipRol += 'chip-green';
    else chipRol += 'chip-warn';
    var chipEstatus = u.Estatus === 'Activo' ? 'chip-green' : 'chip-gray';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (u.IdEmpleado || '') + '</td>';
    html += '<td>' + (u.Nombre || '') + '</td>';
    html += '<td>' + (u.Apellidos || '') + '</td>';
    html += '<td style="font-size:12px">' + (u.Email || '') + '</td>';
    html += '<td><span class="' + chipRol + '">' + (u.Cargo || 'Desconocido') + '</span></td>';
    html += '<td>' + (u.IdEmpleado || '') + '</td>';
    html += '<td><span class="chip ' + chipEstatus + '">' + (u.Estatus || 'Activo') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarUsuario(' + u.IdEmpleado + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarUsuario(' + u.IdEmpleado + ')">🗑 Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('usuarios-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' usuarios';
}

function guardarUsuarioModal() {
  showToast('Función en desarrollo', 'info');
}

function abrirModalEditarUsuario(id) {
  showToast('Función en desarrollo', 'info');
}

function actualizarUsuarioModal() {
  showToast('Función en desarrollo', 'info');
}

function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  
  fetchApi('/empleados/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Usuario eliminado', 'success');
      cargarUsuarios();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

window.cargarUsuarios = cargarUsuarios;
window.guardarUsuarioModal = guardarUsuarioModal;
window.abrirModalEditarUsuario = abrirModalEditarUsuario;
window.actualizarUsuarioModal = actualizarUsuarioModal;
window.eliminarUsuario = eliminarUsuario;