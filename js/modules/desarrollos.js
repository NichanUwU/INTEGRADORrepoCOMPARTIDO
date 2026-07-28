// CRUD DESARROLLOS Y MANZANAS

function cargarDesarrollos() {
  var container = document.getElementById('desarrollos-container');
  if (!container) return;

  fetchApi('/desarrollos')
    .then(function(data) {
      renderDesarrollos(data);
    })
    .catch(function(error) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">⚠️</div><div class="empty-title">Error: ' + error.message + '</div></div>';
      showToast('Error cargando desarrollos: ' + error.message, 'error');
    });
}

function renderDesarrollos(data) {
  var container = document.getElementById('desarrollos-container');
  if (!container) return;

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🏗️</div><div class="empty-title">No hay desarrollos registrados</div></div>';
    return;
  }

  container.className = 'desarrollos-grid';

  var html = '';
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var chipClass = 'chip ';
    if (d.Estatus === 'Activo') chipClass += 'chip-green';
    else if (d.Estatus === 'Preventa') chipClass += 'chip-warn';
    else chipClass += 'chip-gray';

    html += '<div class="dev-card" onclick="navigateTo(\'detalle-desarrollo?id=' + d.IdDesarrollo + '\')" style="cursor:pointer;">';
    html += '<div class="dev-card-thumb">🏠</div>';
    html += '<div class="dev-card-body">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">';
    html += '<div class="dev-card-name">' + (d.Nombre || '') + '</div>';
    html += '<span class="' + chipClass + '">' + (d.Estatus || 'Activo') + '</span>';
    html += '</div>';
    html += '<div class="dev-card-meta">📍 ' + (d.Ubicacion || '') + '</div>';
    html += '<div style="font-size:12px;color:var(--c-muted);margin:4px 0;">' + (d.Descripcion || '') + '</div>';
    html += '<div class="dev-card-stats">';
    html += '<div class="dev-stat"><div class="dev-stat-num">-</div><div class="dev-stat-label">Lotes</div></div>';
    html += '<div class="dev-stat"><div class="dev-stat-num">-</div><div class="dev-stat-label">Disponibles</div></div>';
    html += '<div class="dev-stat"><div class="dev-stat-num">-</div><div class="dev-stat-label">Vendidos</div></div>';
    html += '<div class="dev-stat"><div class="dev-stat-num">-</div><div class="dev-stat-label">Manzanas</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="event.stopPropagation(); abrirModalEditarDesarrollo(' + d.IdDesarrollo + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="event.stopPropagation(); eliminarDesarrollo(' + d.IdDesarrollo + ')">🗑 Eliminar</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function cargarDetalleDesarrollo() {
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get('id')) || 1;

  fetchApi('/desarrollos/' + id)
    .then(function(desarrollo) {
      renderDetalleDesarrollo(desarrollo);
    })
    .catch(function(error) {
      var container = document.getElementById('manzanas-container');
      if (container) container.innerHTML = '<div class="alert-card error">Error: ' + error.message + '</div>';
      var infoContainer = document.getElementById('desarrollo-info');
      if (infoContainer) infoContainer.innerHTML = '<div class="alert-card error">Error cargando datos del desarrollo</div>';
      showToast('Error cargando detalle: ' + error.message, 'error');
    });
}

function renderDetalleDesarrollo(desarrollo) {
  var nombreEl = document.getElementById('detalle-nombre');
  var ubicacionEl = document.getElementById('detalle-ubicacion');
  var descripcionEl = document.getElementById('detalle-descripcion');

  if (nombreEl) nombreEl.textContent = desarrollo.Nombre || '';
  if (ubicacionEl) ubicacionEl.textContent = '📍 ' + (desarrollo.Ubicacion || '');
  if (descripcionEl) descripcionEl.textContent = desarrollo.Descripcion || '';

  fetchApi('/manzanas/desarrollo/' + desarrollo.IdDesarrollo)
    .then(function(manzanas) {
      renderManzanas(manzanas, desarrollo.IdDesarrollo);
    })
    .catch(function() {
      var container = document.getElementById('manzanas-container');
      if (container) container.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">No hay manzanas registradas</div></div>';
    });
}

function renderManzanas(manzanas, desarrolloId) {
  var container = document.getElementById('manzanas-container');
  if (!container) return;

  if (!Array.isArray(manzanas) || manzanas.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">No hay manzanas registradas</div></div>';
    return;
  }

  var html = '';
  for (var m = 0; m < manzanas.length; m++) {
    var manzana = manzanas[m];
    
    html += '<div class="chart-card" style="margin-bottom:16px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px;">';
    html += '<div class="chart-title" style="margin-bottom:0;">Manzana ' + (manzana.Numero || '') + ' <span style="font-size:12px;font-weight:400;color:var(--c-muted);">' + (manzana.Calles_Colindantes || '') + '</span></div>';
    html += '<div style="display:flex;gap:6px;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarManzana(' + desarrolloId + ', ' + manzana.IdManzana + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarManzana(' + desarrolloId + ', ' + manzana.IdManzana + ')">🗑 Eliminar</button>';
    html += '</div>';
    html += '</div>';

    html += '<div id="lotes-manzana-' + manzana.IdManzana + '" class="lot-grid">';
    html += '<div style="grid-column:1/-1;text-align:center;color:var(--c-muted);font-size:12px;">Cargando lotes...</div>';
    html += '</div>';
    html += '</div>';
  }
  container.innerHTML = html;

  for (var i = 0; i < manzanas.length; i++) {
    var manzana = manzanas[i];
    cargarLotesDeManzana(manzana.IdManzana);
  }
}

function cargarLotesDeManzana(manzanaId) {
  fetchApi('/lotes')
    .then(function(lotes) {
      var container = document.getElementById('lotes-manzana-' + manzanaId);
      if (!container) return;
      
      var lotesManzana = lotes.filter(function(l) { return l.IdManzana === manzanaId; });
      
      if (lotesManzana.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--c-muted);font-size:12px;">No hay lotes en esta manzana</div>';
        return;
      }
      
      var html = '';
      for (var i = 0; i < lotesManzana.length; i++) {
        var lote = lotesManzana[i];
        var estadoClass = '';
        if (lote.Estado === 'Disponible') estadoClass = 'disponible';
        else if (lote.Estado === 'Reservado') estadoClass = 'reservado';
        else if (lote.Estado === 'Vendido') estadoClass = 'vendido';
        else estadoClass = 'disponible';

        html += '<div class="lot-cell ' + estadoClass + '" onclick="navigateTo(\'detalle-lote?id=' + lote.IdLote + '\')">';
        html += '<div style="font-weight:600;font-size:13px;">' + (lote.Numero || '') + '</div>';
        html += '<div style="font-size:10px;color:var(--c-muted);">' + (lote.Medidas || '') + '</div>';
        html += '<div style="font-size:10px;font-weight:600;">' + (lote.Estado || 'Disponible') + '</div>';
        html += '</div>';
      }
      container.innerHTML = html;
    })
    .catch(function() {
      var container = document.getElementById('lotes-manzana-' + manzanaId);
      if (container) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--c-error);font-size:12px;">Error cargando lotes</div>';
      }
    });
}

function guardarDesarrolloModal() {
  var nombre = document.getElementById('dev-nombre');
  var ubicacion = document.getElementById('dev-ubicacion');
  var estatus = document.getElementById('dev-estatus');

  if (!nombre || !nombre.value.trim() || !ubicacion || !ubicacion.value.trim()) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Nombre: nombre.value.trim(),
    Ubicacion: ubicacion.value.trim(),
    Estatus: estatus ? estatus.value : 'Activo',
    Descripcion: document.getElementById('dev-descripcion')?.value.trim() || ''
  };

  fetchApi('/desarrollos', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('✅ Desarrollo creado exitosamente', 'success');
      cerrarModal('crear-desarrollo-modal');
      cargarDesarrollos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarDesarrollo(id) {
  fetchApi('/desarrollos/' + id)
    .then(function(desarrollo) {
      document.getElementById('edit-desarrollo-id').value = desarrollo.IdDesarrollo;
      document.getElementById('edit-dev-nombre').value = desarrollo.Nombre || '';
      document.getElementById('edit-dev-ubicacion').value = desarrollo.Ubicacion || '';
      document.getElementById('edit-dev-estatus').value = desarrollo.Estatus || 'Activo';
      document.getElementById('edit-dev-descripcion').value = desarrollo.Descripcion || '';
      abrirModal('editar-desarrollo-modal');
    })
    .catch(function(error) {
      showToast('Error cargando desarrollo: ' + error.message, 'error');
    });
}

function actualizarDesarrolloModal() {
  var id = parseInt(document.getElementById('edit-desarrollo-id').value);
  var nombre = document.getElementById('edit-dev-nombre');
  var ubicacion = document.getElementById('edit-dev-ubicacion');
  var estatus = document.getElementById('edit-dev-estatus');

  if (!nombre || !nombre.value.trim() || !ubicacion || !ubicacion.value.trim()) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Nombre: nombre.value.trim(),
    Ubicacion: ubicacion.value.trim(),
    Estatus: estatus ? estatus.value : 'Activo',
    Descripcion: document.getElementById('edit-dev-descripcion')?.value.trim() || ''
  };

  fetchApi('/desarrollos/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('✅ Desarrollo actualizado', 'success');
      cerrarModal('editar-desarrollo-modal');
      cargarDesarrollos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarDesarrollo(id) {
  if (!confirm('¿Eliminar este desarrollo y todas sus manzanas y lotes?')) return;
  
  fetchApi('/desarrollos/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Desarrollo eliminado', 'success');
      cargarDesarrollos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function guardarManzanaModal() {
  var desarrolloId = document.getElementById('manzana-desarrollo').value;
  var numero = document.getElementById('manzana-numero').value;
  var calles = document.getElementById('manzana-calles').value.trim();

  if (!desarrolloId || !numero) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Numero: parseInt(numero),
    Calles_Colindantes: calles,
    IdDesarrollo: parseInt(desarrolloId)
  };

  fetchApi('/manzanas', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('✅ Manzana creada exitosamente', 'success');
      cerrarModal('crear-manzana-modal');
      cargarDetalleDesarrollo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarManzana(desarrolloId, manzanaId) {
  fetchApi('/manzanas/' + manzanaId)
    .then(function(manzana) {
      document.getElementById('edit-desarrollo-nombre').value = manzana.DesarrolloNombre || '';
      document.getElementById('edit-manzana-numero').value = manzana.Numero || '';
      document.getElementById('edit-manzana-calles').value = manzana.Calles_Colindantes || '';
      document.getElementById('editar-titulo').textContent = 'Editar Manzana ' + (manzana.Numero || '') + ' - ' + (manzana.DesarrolloNombre || '');
      abrirModal('editar-manzana-modal');
    })
    .catch(function(error) {
      showToast('Error cargando manzana: ' + error.message, 'error');
    });
}

function actualizarManzanaModal() {
  var params = new URLSearchParams(window.location.search);
  var desarrolloId = parseInt(params.get('id')) || 1;
  var manzanaId = parseInt(document.getElementById('edit-manzana-id')?.value || 0);
  
  var numero = document.getElementById('edit-manzana-numero');
  var calles = document.getElementById('edit-manzana-calles');

  if (!numero || !numero.value) {
    showToast('El número de manzana es requerido', 'error');
    return;
  }

  var payload = {
    Numero: parseInt(numero.value),
    Calles_Colindantes: calles ? calles.value.trim() : '',
    IdDesarrollo: desarrolloId
  };

  fetchApi('/manzanas/' + manzanaId, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('✅ Manzana actualizada exitosamente', 'success');
      cerrarModal('editar-manzana-modal');
      cargarDetalleDesarrollo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarManzana(desarrolloId, manzanaId) {
  if (!confirm('¿Eliminar esta manzana y todos sus lotes?')) return;
  
  fetchApi('/manzanas/' + manzanaId, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Manzana eliminada', 'success');
      cargarDetalleDesarrollo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function cargarDesarrollosSelect() {
  var select = document.getElementById('manzana-desarrollo');
  if (!select) return;

  fetchApi('/desarrollos')
    .then(function(data) {
      var html = '<option value="">Seleccionar desarrollo…</option>';
      for (var i = 0; i < data.length; i++) {
        html += '<option value="' + data[i].IdDesarrollo + '">' + data[i].Nombre + ' (' + data[i].Ubicacion + ')</option>';
      }
      select.innerHTML = html;
    })
    .catch(function() {
      select.innerHTML = '<option value="">Error cargando desarrollos</option>';
    });
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('manzana-desarrollo')) {
    cargarDesarrollosSelect();
  }
});

window.cargarDesarrollos = cargarDesarrollos;
window.cargarDetalleDesarrollo = cargarDetalleDesarrollo;
window.guardarDesarrolloModal = guardarDesarrolloModal;
window.abrirModalEditarDesarrollo = abrirModalEditarDesarrollo;
window.actualizarDesarrolloModal = actualizarDesarrolloModal;
window.eliminarDesarrollo = eliminarDesarrollo;
window.guardarManzanaModal = guardarManzanaModal;
window.abrirModalEditarManzana = abrirModalEditarManzana;
window.actualizarManzanaModal = actualizarManzanaModal;
window.eliminarManzana = eliminarManzana;
window.cargarDesarrollosSelect = cargarDesarrollosSelect;