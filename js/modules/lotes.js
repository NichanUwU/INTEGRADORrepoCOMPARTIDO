/* ============================================================
   SOFI — MÓDULO LOTES
   CRUD de lotes usando API real
   ============================================================ */

function cargarLotes() {
  fetchApi('/lotes')
    .then(function(data) {
      renderLotes(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-lotes-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando lotes: ' + error.message, 'error');
    });
}

function renderLotes(data) {
  var tbody = document.getElementById('tabla-lotes-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center">No hay lotes registrados.</td></tr>';
    return;
  }
  
  var canEdit = typeof window.canPerformAction === 'function' ? window.canPerformAction('editar_lote') : true;
  var canDelete = typeof window.canPerformAction === 'function' ? window.canPerformAction('eliminar_lote') : true;

  var html = '';
  for (var i = 0; i < data.length; i++) {
    var l = data[i];
    var chipClass = 'chip ';
    if (l.Estado === 'Disponible') chipClass += 'chip-green';
    else if (l.Estado === 'Vendido') chipClass += 'chip-red';
    else if (l.Estado === 'Reservado' || l.Estado === 'Apartado') chipClass += 'chip-warn';
    else chipClass += 'chip-gray';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (l.IdLote || '') + '</td>';
    html += '<td>' + (l.DesarrolloNombre || '') + '</td>';
    html += '<td>' + (l.Numero || '') + '</td>';
    html += '<td>' + (l.Medidas || '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(l.Precio || 0) + '</td>';
    html += '<td>' + (l.Norte || '') + '</td>';
    html += '<td>' + (l.Sur || '') + '</td>';
    html += '<td>' + (l.Este || '') + '</td>';
    html += '<td>' + (l.Oeste || '') + '</td>';
    html += '<td><span class="' + chipClass + '">' + (l.Estado || 'Disponible') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    if (canEdit) {
      html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarLote(' + (l.IdLote || 0) + ')">✏ Editar</button>';
    }
    if (canDelete) {
      html += '<button class="btn-danger btn-sm" onclick="eliminarLote(' + (l.IdLote || 0) + ')">🗑 Eliminar</button>';
    }
    if (!canEdit && !canDelete) {
      html += '<span style="color:var(--c-muted);font-size:12px;">Sin permisos</span>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('lotes-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' lotes';
}

function cargarManzanasSelect() {
  var selects = [document.getElementById('lote-desarrollo'), document.getElementById('edit-lote-desarrollo')];
  if (!selects.some(function(el) { return el; })) return Promise.resolve();

  return fetchApi('/manzanas')
    .then(function(data) {
      var html = '<option value="">Seleccionar…</option>';
      data.forEach(function(manzana) {
        html += '<option value="' + manzana.IdManzana + '">';
        html += 'Manzana ' + manzana.Numero + ' · ' + (manzana.DesarrolloNombre || 'Sin desarrollo');
        html += '</option>';
      });
      selects.forEach(function(select) {
        if (select) select.innerHTML = html;
      });
    })
    .catch(function(error) {
      showToast('Error cargando manzanas: ' + error.message, 'error');
    });
}

function guardarLoteModal() {
  if (!window.canPerformAction || !window.canPerformAction('crear_lote')) {
    showToast('No tienes permiso para crear lotes', 'error');
    return;
  }

  var manzana = document.getElementById('lote-desarrollo');
  var numero = document.getElementById('lote-numero');
  var medidas = document.getElementById('lote-medidas');
  var precio = document.getElementById('lote-precio');
  var estado = document.getElementById('lote-estado');

  if (!manzana || !manzana.value || !numero || !numero.value.trim() || !medidas || !medidas.value ||
      !precio || !precio.value || !estado || !estado.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Numero: numero.value.trim(),
    Medidas: medidas.value.trim() + ' m²',
    Precio: precio.value.trim(),
    Estado: estado.value,
    IdManzana: parseInt(manzana.value, 10)
  };

  fetchApi('/lotes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Lote creado exitosamente', 'success');
      cerrarModal('crear-lote-modal');
      cargarLotes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarLote(id) {
  if (!window.canPerformAction || !window.canPerformAction('editar_lote')) {
    showToast('No tienes permiso para editar lotes', 'error');
    return;
  }

  Promise.all([fetchApi('/lotes/' + id), cargarManzanasSelect()])
    .then(function(results) {
      var lote = results[0];
      document.getElementById('edit-lote-id').value = lote.IdLote || '';
      document.getElementById('edit-lote-desarrollo').value = lote.IdManzana || '';
      document.getElementById('edit-lote-numero').value = lote.Numero || '';
      document.getElementById('edit-lote-medidas').value = (lote.Medidas || '').replace(' m²', '');
      document.getElementById('edit-lote-precio').value = lote.Precio || '';
      document.getElementById('edit-lote-estado').value = lote.Estado || 'Disponible';
      document.getElementById('edit-lote-norte').value = lote.Norte || '';
      document.getElementById('edit-lote-sur').value = lote.Sur || '';
      document.getElementById('edit-lote-este').value = lote.Este || '';
      document.getElementById('edit-lote-oeste').value = lote.Oeste || '';
      abrirModal('editar-lote-modal');
    })
    .catch(function(error) {
      showToast('Error cargando lote: ' + error.message, 'error');
    });
}

function actualizarLoteModal() {
  if (!window.canPerformAction || !window.canPerformAction('editar_lote')) {
    showToast('No tienes permiso para actualizar lotes', 'error');
    return;
  }

  var id = parseInt(document.getElementById('edit-lote-id').value, 10);
  var manzana = document.getElementById('edit-lote-desarrollo');
  var numero = document.getElementById('edit-lote-numero');
  var medidas = document.getElementById('edit-lote-medidas');
  var precio = document.getElementById('edit-lote-precio');
  var estado = document.getElementById('edit-lote-estado');

  if (!manzana || !manzana.value || !numero || !numero.value.trim() || !medidas || !medidas.value ||
      !precio || !precio.value || !estado || !estado.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    Numero: numero.value.trim(),
    Medidas: medidas.value.trim() + ' m²',
    Precio: precio.value.trim(),
    Estado: estado.value,
    IdManzana: parseInt(manzana.value, 10)
  };

  fetchApi('/lotes/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Lote actualizado', 'success');
      cerrarModal('editar-lote-modal');
      cargarLotes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarLote(id) {  if (!window.canPerformAction || !window.canPerformAction('eliminar_lote')) {
    showToast('No tienes permiso para eliminar lotes', 'error');
    return;
  }
  if (!confirm('¿Eliminar este lote?')) return;

  fetchApi('/lotes/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Lote eliminado', 'success');
      cargarLotes();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

window.cargarLotes = cargarLotes;
window.guardarLoteModal = guardarLoteModal;
window.abrirModalEditarLote = abrirModalEditarLote;
window.actualizarLoteModal = actualizarLoteModal;
window.eliminarLote = eliminarLote;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('lote-desarrollo') || document.getElementById('edit-lote-desarrollo')) {
    cargarManzanasSelect();
  }
});