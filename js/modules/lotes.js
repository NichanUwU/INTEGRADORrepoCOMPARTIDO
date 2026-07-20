/* ============================================================
   SOFI MODULO LOTES (API)
   ============================================================ */

function cargarLotes() {
  fetchApi('/lotes')
    .then(function(data) {
      window.allLotes = data || [];
      filtrarLotes(); // This will apply initial empty filters and render
      
      try {
        var user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
        var role = (user.role || user.Rol || '').toLowerCase().trim();
        if (role === 'vendedor') {
          var btnNuevo = document.getElementById('btn-nuevo-lote');
          if (btnNuevo) btnNuevo.style.display = 'none';
        }
      } catch(e) {}
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-lotes-body');
      if (tbody) tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
    });
    
  // Populate Desarrollo Filter Dropdown
  var filterDesarrollo = document.getElementById('filter-desarrollo');
  if (filterDesarrollo && filterDesarrollo.options.length <= 1) {
    fetchApi('/desarrollos').then(function(desarrollos) {
      var html = '<option value="">Todos los Desarrollos</option>';
      for (var i = 0; i < desarrollos.length; i++) {
        html += '<option value="' + desarrollos[i].Nombre + '">' + desarrollos[i].Nombre + '</option>';
      }
      filterDesarrollo.innerHTML = html;
    });
  }
}

function filtrarLotes() {
  if (!window.allLotes) return;
  
  var searchQuery = (document.getElementById('search-lote')?.value || '').toLowerCase();
  var filterDev = document.getElementById('filter-desarrollo')?.value || '';
  var filterStatus = document.getElementById('filter-estatus')?.value || '';
  
  var filtrados = window.allLotes.filter(function(l) {
    var textMatch = true;
    if (searchQuery) {
      var searchStr = (l.Numero + ' ' + (l.DesarrolloNombre||'') + ' ' + (l.Medidas||'') + ' ' + l.IdLote).toLowerCase();
      textMatch = searchStr.includes(searchQuery);
    }
    
    var devMatch = true;
    if (filterDev) {
      devMatch = (l.DesarrolloNombre || l.Desarrollo) === filterDev;
    }
    
    var statusMatch = true;
    if (filterStatus) {
      statusMatch = l.Estado === filterStatus;
    }
    
    return textMatch && devMatch && statusMatch;
  });
  
  renderLotes(filtrados);
}

function renderLotes(data) {
  window.exportCurrentTable = () => window.exportToCSV ? window.exportToCSV(data, 'lotes.csv') : null;
  var tbody = document.getElementById('tabla-lotes-body');
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">ðŸ—‚</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay lotes registrados</div><div style="font-size:14px;margin-top:8px;">Haz clic en Nuevo Lote para comenzar.</div></div></td></tr>';
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
    
    var role = 'invitado';
    try { var user = JSON.parse(localStorage.getItem('sofi-user') || '{}'); role = (user.role || user.Rol || '').toLowerCase().trim(); } catch(e) {}
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    if (role === 'directivo' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarLote(' + l.IdLote + ')">✏️ Editar</button>';
        html += '<button class="btn-danger btn-sm" onclick="eliminarLote(' + l.IdLote + ')">🗑️ Eliminar</button>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

function cargarManzanasDesarrollo(idDesarrollo, selectId, manzanaIdToSelect = null) {
  var selectEl = document.getElementById(selectId);
  if (!selectEl) return Promise.resolve();

  if (!idDesarrollo) {
    selectEl.innerHTML = '<option value="">Seleccione un desarrollo primero</option>';
    return Promise.resolve();
  }

  return fetchApi('/manzanas/desarrollo/' + idDesarrollo)
    .then(function(manzanas) {
      if (!manzanas || manzanas.length === 0) {
        selectEl.innerHTML = '<option value="">No hay manzanas (crear en Desarrollos)</option>';
      } else {
        var html = '<option value="">Seleccionar manzana...</option>';
        for (var i = 0; i < manzanas.length; i++) {
          html += '<option value="' + manzanas[i].IdManzana + '">Manzana ' + manzanas[i].Numero + '</option>';
        }
        selectEl.innerHTML = html;
        if (manzanaIdToSelect) {
          selectEl.value = manzanaIdToSelect;
        }
      }
    })
    .catch(function() {
      selectEl.innerHTML = '<option value="">Error cargando manzanas</option>';
    });
}

function guardarLoteModal() {
  var idManzana = document.getElementById('lote-manzana').value;
  var numero = document.getElementById('lote-numero').value;
  var medidas = document.getElementById('lote-medidas').value;
  var precio = document.getElementById('lote-precio').value;
  var estado = document.getElementById('lote-estado').value;

  if (!idManzana || !numero || !medidas || !precio) {
    showToast('Completa todos los campos requeridos (incluyendo Manzana)', 'error');
    return;
  }

  crearLoteConManzana(idManzana, numero, medidas, precio, estado);
}

function crearLoteConManzana(idManzana, numero, medidas, precio, estado) {
  var payload = {
    Numero: numero,
    Medidas: medidas + ' m²',
    Precio: parseFloat(precio) || 0,
    Estado: estado,
    IdManzana: idManzana
  };
  fetchApi('/lotes', { method: 'POST', body: JSON.stringify(payload) })
    .then(function(res) {
      if (!res.IdLote) throw new Error("No se devolvió el IdLote del servidor");
      var cPayload = {
        Norte: document.getElementById('lote-norte').value || '',
        Sur: document.getElementById('lote-sur').value || '',
        Este: document.getElementById('lote-este').value || '',
        Oeste: document.getElementById('lote-oeste').value || '',
        IdLote: res.IdLote
      };
      return fetchApi('/colindancias', { method: 'POST', body: JSON.stringify(cPayload) });
    })
    .then(function() {
      cerrarModal('crear-lote-modal');
      showToast('Lote y colindancias creados exitosamente', 'success');
      cargarLotes();
    })
    .catch(function(e) { showToast(e.message, 'error'); });
}

function abrirModalEditarLote(id) {
  fetchApi('/lotes/' + id)
    .then(function(lote) {
      document.getElementById('edit-lote-id').value = lote.IdLote;
      
      // Determine Desarrollo from lote.DesarrolloNombre
      fetchApi('/desarrollos').then(function(desarrollos) {
         var idDesarrollo = '';
         for(var i=0; i<desarrollos.length; i++){ 
           if(desarrollos[i].Nombre === lote.DesarrolloNombre) {
             idDesarrollo = desarrollos[i].IdDesarrollo; 
             break;
           }
         }
         document.getElementById('edit-lote-desarrollo').value = idDesarrollo;
         
         // Load Manzanas and set the current one
         if (idDesarrollo) {
           cargarManzanasDesarrollo(idDesarrollo, 'edit-lote-manzana', lote.IdManzana);
         }
      });

      document.getElementById('edit-lote-numero').value = lote.Numero;
      document.getElementById('edit-lote-medidas').value = (lote.Medidas||'').replace(' m²', '');
      document.getElementById('edit-lote-precio').value = lote.Precio;
      document.getElementById('edit-lote-estado').value = lote.Estado;
      
      document.getElementById('edit-lote-norte').value = lote.Norte || '';
      document.getElementById('edit-lote-sur').value = lote.Sur || '';
      document.getElementById('edit-lote-este').value = lote.Este || '';
      document.getElementById('edit-lote-oeste').value = lote.Oeste || '';
      
      abrirModal('editar-lote-modal');
    });
}

function actualizarLoteModal() {
  var idLote = document.getElementById('edit-lote-id').value;
  var idManzana = document.getElementById('edit-lote-manzana').value;
  var numero = document.getElementById('edit-lote-numero').value;
  var medidas = document.getElementById('edit-lote-medidas').value;
  var precio = document.getElementById('edit-lote-precio').value;
  var estado = document.getElementById('edit-lote-estado').value;

  if (!idManzana) {
    showToast('Selecciona una manzana', 'error');
    return;
  }

  var payload = { Numero: numero, Medidas: medidas + ' m²', Precio: precio, Estado: estado, IdManzana: parseInt(idManzana) };
  fetchApi('/lotes/' + idLote, { method: 'PUT', body: JSON.stringify(payload) })
    .then(function() {
      var cPayload = {
        Norte: document.getElementById('edit-lote-norte').value || '',
        Sur: document.getElementById('edit-lote-sur').value || '',
        Este: document.getElementById('edit-lote-este').value || '',
        Oeste: document.getElementById('edit-lote-oeste').value || '',
        IdLote: idLote
      };
      return fetchApi('/colindancias', { method: 'POST', body: JSON.stringify(cPayload) })
        .catch(function() {
          return fetchApi('/colindancias/' + idLote, { method: 'PUT', body: JSON.stringify(cPayload) });
        });
    })
    .then(function() {
      cerrarModal('editar-lote-modal');
      showToast('Lote actualizado', 'success');
      cargarLotes();
    })
    .catch(function(e) { showToast('Error al actualizar', 'error'); });
}

function eliminarLote(id) {
  if (!confirm('Ã‚¿Eliminar este lote?')) return;
  fetchApi('/lotes/' + id, { method: 'DELETE' })
    .then(function() { showToast('Lote eliminado', 'success'); cargarLotes(); })
    .catch(function(e) { showToast(e.message, 'error'); });
}

function cargarDesarrollosSelect() {
  fetchApi('/desarrollos').then(function(data) {
     var html = '<option value="">SeleccionarÃ¢â‚¬Â¦</option>';
     data.forEach(function(d) {
       html += '<option value="'+d.IdDesarrollo+'">'+d.Nombre+'</option>';
     });
     if(document.getElementById('lote-desarrollo')) document.getElementById('lote-desarrollo').innerHTML = html;
     if(document.getElementById('edit-lote-desarrollo')) document.getElementById('edit-lote-desarrollo').innerHTML = html;
  });
}

window.cargarLotes = cargarLotes;
window.guardarLoteModal = guardarLoteModal;
window.abrirModalEditarLote = abrirModalEditarLote;
window.actualizarLoteModal = actualizarLoteModal;
window.eliminarLote = eliminarLote;

document.addEventListener('DOMContentLoaded', function() {
  cargarDesarrollosSelect();
});
