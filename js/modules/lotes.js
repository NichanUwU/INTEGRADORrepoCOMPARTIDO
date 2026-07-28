/* ============================================================
   SOFI — MÓDULO LOTES
   CRUD completo de lotes
   ============================================================ */

function cargarLotes() {
  var data = JSON.parse(localStorage.getItem('sofi-lotes') || 'null');
  if (!data || !Array.isArray(data) || data.length === 0) {
    fetch('../json/lotes-data.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        localStorage.setItem('sofi-lotes', JSON.stringify(data));
        renderLotes(data);
      })
      .catch(function() {
        var tbody = document.getElementById('tabla-lotes-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--c-error)">Error cargando lotes</td></tr>';
      });
  } else {
    renderLotes(data);
  }
}

function renderLotes(data) {
  var tbody = document.getElementById('tabla-lotes-body');
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center">No hay lotes registrados.</td></tr>';
    return;
  }
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var l = data[i];
    var chipClass = 'chip ';
    if (l.estatus === 'Disponible') chipClass += 'chip-green';
    else if (l.estatus === 'Vendido') chipClass += 'chip-red';
    else chipClass += 'chip-warn';
    html += '<tr>';
    html += '<td style="font-weight:600">' + (l.id || '') + '</td>';
    html += '<td>' + (l.desarrollo || '') + '</td>';
    html += '<td>' + (l.numero || '') + '</td>';
    html += '<td>' + (l.medidas || '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(l.precio || 0) + '</td>';
    html += '<td>' + (l.norte || '') + '</td>';
    html += '<td>' + (l.sur || '') + '</td>';
    html += '<td>' + (l.este || '') + '</td>';
    html += '<td>' + (l.oeste || '') + '</td>';
    html += '<td><span class="' + chipClass + '">' + (l.estatus || 'Desconocido') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarLote(' + l.id + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarLote(' + l.id + ')">🗑 Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  var pag = document.getElementById('lotes-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' lotes';
}

function guardarLoteModal() {
  var desarrollo = document.getElementById('lote-desarrollo');
  var numero = document.getElementById('lote-numero');
  var medidas = document.getElementById('lote-medidas');
  var precio = document.getElementById('lote-precio');
  var estado = document.getElementById('lote-estado');

  if (!desarrollo || !desarrollo.value || !numero || !numero.value.trim() || !medidas || !medidas.value ||
      !precio || !precio.value || !estado || !estado.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var lotes = JSON.parse(localStorage.getItem('sofi-lotes') || '[]');
  var nuevoLote = {
    id: lotes.length + 1,
    desarrollo: desarrollo.value,
    numero: numero.value.trim(),
    medidas: medidas.value + ' m²',
    precio: parseFloat(precio.value) || 0,
    norte: document.getElementById('lote-norte')?.value.trim() || '',
    sur: document.getElementById('lote-sur')?.value.trim() || '',
    este: document.getElementById('lote-este')?.value.trim() || '',
    oeste: document.getElementById('lote-oeste')?.value.trim() || '',
    estatus: estado.value
  };

  lotes.push(nuevoLote);
  localStorage.setItem('sofi-lotes', JSON.stringify(lotes));
  cerrarModal('crear-lote-modal');
  showToast('✅ Lote creado exitosamente', 'success');
  cargarLotes();
}

function abrirModalEditarLote(id) {
  var lotes = JSON.parse(localStorage.getItem('sofi-lotes') || '[]');
  var lote = null;
  for (var i = 0; i < lotes.length; i++) {
    if (lotes[i].id === id) {
      lote = lotes[i];
      break;
    }
  }
  if (!lote) {
    showToast('Lote no encontrado', 'error');
    return;
  }

  document.getElementById('edit-lote-id').value = lote.id;
  document.getElementById('edit-lote-desarrollo').value = lote.desarrollo || '';
  document.getElementById('edit-lote-numero').value = lote.numero || '';
  document.getElementById('edit-lote-medidas').value = lote.medidas ? lote.medidas.replace(' m²', '') : '';
  document.getElementById('edit-lote-precio').value = lote.precio || '';
  document.getElementById('edit-lote-estado').value = lote.estatus || 'Disponible';
  document.getElementById('edit-lote-norte').value = lote.norte || '';
  document.getElementById('edit-lote-sur').value = lote.sur || '';
  document.getElementById('edit-lote-este').value = lote.este || '';
  document.getElementById('edit-lote-oeste').value = lote.oeste || '';
  abrirModal('editar-lote-modal');
}

function actualizarLoteModal() {
  var id = parseInt(document.getElementById('edit-lote-id').value);
  var desarrollo = document.getElementById('edit-lote-desarrollo');
  var numero = document.getElementById('edit-lote-numero');
  var medidas = document.getElementById('edit-lote-medidas');
  var precio = document.getElementById('edit-lote-precio');
  var estado = document.getElementById('edit-lote-estado');

  if (!desarrollo || !desarrollo.value || !numero || !numero.value.trim() || !medidas || !medidas.value ||
      !precio || !precio.value || !estado || !estado.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var lotes = JSON.parse(localStorage.getItem('sofi-lotes') || '[]');
  for (var i = 0; i < lotes.length; i++) {
    if (lotes[i].id === id) {
      lotes[i].desarrollo = desarrollo.value;
      lotes[i].numero = numero.value.trim();
      lotes[i].medidas = medidas.value + ' m²';
      lotes[i].precio = parseFloat(precio.value) || 0;
      lotes[i].estatus = estado.value;
      lotes[i].norte = document.getElementById('edit-lote-norte')?.value.trim() || '';
      lotes[i].sur = document.getElementById('edit-lote-sur')?.value.trim() || '';
      lotes[i].este = document.getElementById('edit-lote-este')?.value.trim() || '';
      lotes[i].oeste = document.getElementById('edit-lote-oeste')?.value.trim() || '';
      break;
    }
  }
  localStorage.setItem('sofi-lotes', JSON.stringify(lotes));
  cerrarModal('editar-lote-modal');
  showToast('✅ Lote actualizado', 'success');
  cargarLotes();
}

function eliminarLote(id) {
  if (!confirm('¿Eliminar este lote?')) return;
  var lotes = JSON.parse(localStorage.getItem('sofi-lotes') || '[]');
  var nuevos = [];
  for (var i = 0; i < lotes.length; i++) {
    if (lotes[i].id !== id) {
      nuevos.push(lotes[i]);
    }
  }// CRUD LOTES

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
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var l = data[i];
    var chipClass = 'chip ';
    if (l.Estado === 'Disponible') chipClass += 'chip-green';
    else if (l.Estado === 'Vendido') chipClass += 'chip-red';
    else if (l.Estado === 'Reservado') chipClass += 'chip-warn';
    else chipClass += 'chip-gray';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (l.IdLote || '') + '</td>';
    html += '<td>' + (l.DesarrolloNombre || l.Desarrollo || '') + '</td>';
    html += '<td>' + (l.Numero || '') + '</td>';
    html += '<td>' + (l.Medidas || '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(l.Precio || 0) + '</td>';
    html += '<td>' + (l.Norte || '') + '</td>';
    html += '<td>' + (l.Sur || '') + '</td>';
    html += '<td>' + (l.Este || '') + '</td>';
    html += '<td>' + (l.Oeste || '') + '</td>';
    html += '<td><span class="' + chipClass + '">' + (l.Estado || 'Disponible') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarLote(' + l.IdLote + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarLote(' + l.IdLote + ')">🗑 Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('lotes-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' lotes';
}

function guardarLoteModal() {
  showToast('Función en desarrollo', 'info');
}

function abrirModalEditarLote(id) {
  showToast('Función en desarrollo', 'info');
}

function actualizarLoteModal() {
  showToast('Función en desarrollo', 'info');
}

function eliminarLote(id) {
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
  localStorage.setItem('sofi-lotes', JSON.stringify(nuevos));
  showToast('✅ Lote eliminado', 'success');
  cargarLotes();
}

window.cargarLotes = cargarLotes;
window.guardarLoteModal = guardarLoteModal;
window.abrirModalEditarLote = abrirModalEditarLote;
window.actualizarLoteModal = actualizarLoteModal;
window.eliminarLote = eliminarLote;