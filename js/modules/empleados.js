document.addEventListener('DOMContentLoaded', function() {
  cargarEmpleados();
});

let currentPageEmpleados = 1;
const ITEMS_PER_PAGE_EMPLEADOS = 10;
let empleadosCache = [];
let empleadosFiltrados = [];

function cargarEmpleados() {
  const tbody = document.getElementById('tabla-empleados-body');
  if (!tbody) return;
  
  fetchApi('/empleados')
    .then(data => {
      empleadosCache = data;
      filtrarEmpleados();
    })
    .catch(err => {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Error al cargar empleados: ' + err.message + '</td></tr>';
    });
}

function renderEmpleadosTable(page) {
  const tbody = document.getElementById('tabla-empleados-body');
  if (!tbody) return;
  
  const data = empleadosFiltrados;
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">📇</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay empleados registrados</div></div></td></tr>';
    return;
  }
  
  const start = (page - 1) * ITEMS_PER_PAGE_EMPLEADOS;
  const end = start + ITEMS_PER_PAGE_EMPLEADOS;
  const paginated = data.slice(start, end);
  
  let html = '';
  paginated.forEach(u => {
    let chipRol = 'chip ';
    if (u.Cargo === 'Directivo' || u.Cargo === 'Director') chipRol += 'chip-blue';
    else if (u.Cargo === 'Vendedor') chipRol += 'chip-green';
    else chipRol += 'chip-warn';
    let chipEstatus = u.Estatus === 'Activo' ? 'chip-green' : 'chip-gray';
    
    html += `<tr>
      <td style="font-weight:600">${u.IdEmpleado || ''}</td>
      <td>${u.Nombre || ''} ${u.Apellidos || ''}</td>
      <td style="font-size:12px">${u.Email || ''}</td>
      <td><span class="${chipRol}">${u.Cargo || 'Desconocido'}</span></td>
      <td>${u.Direccion || ''}</td>
      <td>${u.Telefono || 'N/A'}</td>
      <td><span class="chip ${chipEstatus}">${u.Estatus || 'Activo'}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn-outline btn-sm" onclick="abrirModalEditarEmpleado(${u.IdEmpleado})">✏️ Editar</button>
      </td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

function renderEmpleadosPagination() {
  const container = document.getElementById('empleados-paginas');
  const info = document.getElementById('empleados-paginacion');
  if (!container || !info) return;

  const total = empleadosFiltrados.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE_EMPLEADOS);

  info.textContent = `Mostrando ${total} empleados`;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPageEmpleados ? 'background:var(--c-primary);color:#fff;' : 'background:var(--c-bg-alt);color:var(--c-text);';
    html += `<button style="border:none;padding:4px 8px;border-radius:4px;cursor:pointer;${active}" onclick="goToPageEmpleados(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

function goToPageEmpleados(p) {
  currentPageEmpleados = p;
  renderEmpleadosTable(p);
  renderEmpleadosPagination();
}

function filtrarEmpleados() {
  const q = (document.getElementById('emp-search')?.value || '').toLowerCase();
  const cargo = document.getElementById('emp-filter-cargo')?.value || '';
  const estatus = document.getElementById('emp-filter-estatus')?.value || '';

  empleadosFiltrados = empleadosCache.filter(e => {
    const text = `${e.Nombre || ''} ${e.Apellidos || ''} ${e.Email || ''} ${e.IdEmpleado || ''}`.toLowerCase();
    const matchQ = text.includes(q);
    const matchCargo = cargo === '' || e.Cargo === cargo;
    const matchEstatus = estatus === '' || e.Estatus === estatus;
    return matchQ && matchCargo && matchEstatus;
  });

  currentPageEmpleados = 1;
  renderEmpleadosTable(currentPageEmpleados);
  renderEmpleadosPagination();
}

function guardarEmpleadoModal() {
  const nombre = document.getElementById('emp-nombre').value.trim();
  const apellidos = document.getElementById('emp-apellidos').value.trim();
  const email = document.getElementById('emp-email').value.trim();
  const cargo = document.getElementById('emp-cargo').value;

  const direccion = document.getElementById('emp-direccion').value.trim();
  const casa = document.getElementById('emp-casa').value.trim();
  const cp = document.getElementById('emp-cp').value.trim();
  const ciudad = document.getElementById('emp-ciudad').value.trim();
  const estado = document.getElementById('emp-estado').value.trim();
  const telefono = document.getElementById('emp-telefono').value.trim();

  if (!nombre || !apellidos || !email || !cargo) {
    showToast('Nombre, apellidos, email y cargo son obligatorios', 'warning');
    return;
  }

  fetchApi('/empleados', {
    method: 'POST',
    body: JSON.stringify({
      Nombre: nombre,
      Apellidos: apellidos,
      Email: email,
      Cargo: cargo,
      Direccion: direccion,
      Casa_Apartamento: casa,
      Codigo_Postal: cp,
      Ciudad: ciudad,
      Estado: estado,
      Telefono: telefono
    })
  })
  .then(() => {
    cerrarModal('crear-empleado-modal');
    showToast('✅ Empleado registrado', 'success');
    document.getElementById('form-crear-empleado').reset();
    cargarEmpleados();
  })
  .catch(err => {
    showToast('Error: ' + err.message, 'error');
  });
}

function abrirModalEditarEmpleado(id) {
  const e = empleadosCache.find(x => x.IdEmpleado == id);
  if(e) {
    document.getElementById('edit-emp-id').value = e.IdEmpleado;
    document.getElementById('edit-emp-nombre').value = e.Nombre || '';
    document.getElementById('edit-emp-apellidos').value = e.Apellidos || '';
    document.getElementById('edit-emp-email').value = e.Email || '';
    document.getElementById('edit-emp-cargo').value = e.Cargo || '';
    document.getElementById('edit-emp-direccion').value = e.Direccion || '';
    document.getElementById('edit-emp-casa').value = e.Casa_Apartamento || '';
    document.getElementById('edit-emp-cp').value = e.Codigo_Postal || '';
    document.getElementById('edit-emp-ciudad').value = e.Ciudad || '';
    document.getElementById('edit-emp-estado').value = e.Estado || '';
    document.getElementById('edit-emp-telefono').value = e.Telefono || '';
    document.getElementById('edit-emp-estatus').value = e.Estatus || 'Activo';
    abrirModal('editar-empleado-modal');
  }
}

function actualizarEmpleadoModal() {
  const id = document.getElementById('edit-emp-id').value;
  const nombre = document.getElementById('edit-emp-nombre').value.trim();
  const apellidos = document.getElementById('edit-emp-apellidos').value.trim();
  const email = document.getElementById('edit-emp-email').value.trim();
  const cargo = document.getElementById('edit-emp-cargo').value;

  const direccion = document.getElementById('edit-emp-direccion').value.trim();
  const casa = document.getElementById('edit-emp-casa').value.trim();
  const cp = document.getElementById('edit-emp-cp').value.trim();
  const ciudad = document.getElementById('edit-emp-ciudad').value.trim();
  const estado = document.getElementById('edit-emp-estado').value.trim();
  const telefono = document.getElementById('edit-emp-telefono').value.trim();
  const estatus = document.getElementById('edit-emp-estatus').value;

  if (!nombre || !apellidos || !email || !cargo) {
    showToast('Nombre, apellidos, email y cargo son obligatorios', 'warning');
    return;
  }

  fetchApi('/empleados/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      Nombre: nombre,
      Apellidos: apellidos,
      Email: email,
      Cargo: cargo,
      Direccion: direccion,
      Casa_Apartamento: casa,
      Codigo_Postal: cp,
      Ciudad: ciudad,
      Estado: estado,
      Telefono: telefono,
      Estatus: estatus
    })
  })
  .then(() => {
    cerrarModal('editar-empleado-modal');
    showToast('✅ Empleado actualizado', 'success');
    cargarEmpleados();
  })
  .catch(err => {
    showToast('Error al actualizar: ' + err.message, 'error');
  });
}
