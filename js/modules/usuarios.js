// CRUD USUARIOS

function cargarUsuarios() {
  fetchApi('/usuarios')
    .then(function(data) {
      renderUsuarios(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-usuarios-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando usuarios: ' + error.message, 'error');
    });
}

function renderUsuarios(data) {
  window.exportCurrentTable = () => window.exportToCSV ? window.exportToCSV(data, 'usuarios.csv') : null;
  var tbody = document.getElementById('tabla-usuarios-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">👤</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay usuarios registrados</div></div></td></tr>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var u = data[i];
    var chipRol = 'chip ';
    if (u.Rol === 'Directivo' || u.Rol === 'Director') chipRol += 'chip-blue';
    else if (u.Rol === 'Vendedor') chipRol += 'chip-green';
    else chipRol += 'chip-warn';
    var chipEstatus = u.Estatus === 'Activo' ? 'chip-green' : 'chip-gray';
    var empleadoNombre = u.Nombre ? (u.Nombre + ' ' + (u.Apellidos || '')) : 'Sin Empleado';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (u.IdUsuario || '') + '</td>';
    html += '<td style="font-weight:600; color:var(--c-primary)">' + (u.NombreUsuario || '') + '</td>';
    html += '<td><span class="' + chipRol + '">' + (u.Rol || 'Desconocido') + '</span></td>';
    html += '<td>' + empleadoNombre + '</td>';
    html += '<td><span class="chip ' + chipEstatus + '">' + (u.Estatus || 'Activo') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarUsuario(' + u.IdUsuario + ')">Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarUsuario(' + u.IdUsuario + ')">Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('usuarios-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' usuarios';
}

function abrirModalCrearUsuario() {
  const select = document.getElementById('usu-empleado-id');
  select.innerHTML = '<option value="">Cargando empleados...</option>';
  fetchApi('/empleados')
    .then(data => {
      let html = '<option value="">Seleccionar empleado...</option>';
      data.forEach(e => {
        // Podríamos filtrar si ya tienen usuario, pero por simplicidad mostramos todos por ahora
        html += `<option value="${e.IdEmpleado}">${e.Nombre} ${e.Apellidos || ''} (${e.Cargo})</option>`;
      });
      select.innerHTML = html;
      abrirModal('crear-usuario-modal');
    })
    .catch(err => {
      showToast('Error cargando empleados', 'error');
    });
}

function guardarUsuarioModal() {
  const idEmpleado = document.getElementById('usu-empleado-id').value;
  const email = document.getElementById('usu-email').value.trim();
  const password = document.getElementById('usu-password').value;
  const rol = document.getElementById('usu-rol').value;

  if (!idEmpleado || !email || !password || !rol) {
    showToast('Todos los campos son obligatorios', 'warning');
    return;
  }

  fetchApi('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      NombreUsuario: email,
      Contraseña: password,
      Rol: rol,
      IdEmpleado: idEmpleado.toString()
    })
  })
  .then(() => {
    cerrarModal('crear-usuario-modal');
    showToast('✅ Usuario creado', 'success');
    document.getElementById('form-crear-usuario').reset();
    cargarUsuarios();
  })
  .catch(err => {
    showToast('Error: ' + err.message, 'error');
  });
}

function abrirModalEditarUsuario(id) {
  fetchApi('/usuarios')
    .then(data => {
      const u = data.find(e => e.IdUsuario == id);
      if(u) {
        document.getElementById('edit-usuario-id').value = u.IdUsuario;
        document.getElementById('edit-usu-empleado').value = u.Nombre + ' ' + (u.Apellidos || '');
        document.getElementById('edit-usu-email').value = u.NombreUsuario || '';
        document.getElementById('edit-usu-rol').value = u.Rol || '';
        abrirModal('editar-usuario-modal');
      }
    })
    .catch(err => showToast('Error: ' + err.message, 'error'));
}

function actualizarUsuarioModal() {
  const id = document.getElementById('edit-usuario-id').value;
  const email = document.getElementById('edit-usu-email').value.trim();
  const rol = document.getElementById('edit-usu-rol').value;

  if (!email || !rol) {
    showToast('Campos obligatorios', 'warning');
    return;
  }

  fetchApi('/usuarios/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      NombreUsuario: email,
      Rol: rol
    })
  })
  .then(() => {
    cerrarModal('editar-usuario-modal');
    showToast('✅ Usuario actualizado', 'success');
    cargarUsuarios();
  })
  .catch(err => {
    showToast('Error: ' + err.message, 'error');
  });
}

function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  
  fetchApi('/usuarios/' + id, {
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
