// CRUD DESARROLLOS Y MANZANAS

function cargarDesarrollos() {
  var container = document.getElementById('desarrollos-container');
  if (!container) return;

  fetchApi('/desarrollos')
    .then(function(data) {
      renderDesarrollos(data);
    })
    .catch(function(error) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">Ã¢Å¡Â Ã¯Â¸Â</div><div class="empty-title">Error: ' + error.message + '</div></div>';
      showToast('Error cargando desarrollos: ' + error.message, 'error');
    });
}

function renderDesarrollos(data) {
  var container = document.getElementById('desarrollos-container');
  if (!container) return;

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">ðŸ—ï¸</div><div class="empty-title">No hay desarrollos registrados</div></div>';
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
    if (d.ImagenBase64 && d.ImagenBase64.length > 10) {
      html += '<div class="dev-card-thumb" style="background-image: url(\'' + d.ImagenBase64 + '\'); background-size: cover; background-position: center;"></div>';
    } else {
      html += '<div class="dev-card-thumb"> </div>';
    }
    html += '<div class="dev-card-body">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">';
    html += '<div class="dev-card-name">' + (d.Nombre || '') + '</div>';
    html += '<span class="' + chipClass + '">' + (d.Estatus || 'Activo') + '</span>';
    html += '</div>';
    html += '<div class="dev-card-meta">📍 ' + (d.Ubicacion || '') + '</div>';
    html += '<div style="font-size:12px;color:var(--c-muted);margin:4px 0;">' + (d.Descripcion || '') + '</div>';
    html += '<div class="dev-card-stats">';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="event.stopPropagation(); abrirModalEditarDesarrollo(' + d.IdDesarrollo + ')">Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="event.stopPropagation(); eliminarDesarrollo(' + d.IdDesarrollo + ')">Eliminar</button>';
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

function renderDetalleDesarrolloSoloInfo(desarrollo) {
  var nombreEl = document.getElementById('detalle-nombre');
  var ubicacionEl = document.getElementById('detalle-ubicacion');
  var descripcionEl = document.getElementById('detalle-descripcion');

  if (nombreEl) nombreEl.textContent = desarrollo.Nombre || '';
  if (ubicacionEl) ubicacionEl.textContent = '📍 ' + (desarrollo.Ubicacion || '');
  if (descripcionEl) descripcionEl.textContent = desarrollo.Descripcion || '';
}

function abrirModalCrearLoteManzana(manzanaId) {
  document.getElementById('form-crear-lote-manzana').reset();
  document.getElementById('lote-manzana-id').value = manzanaId;
  abrirModal('crear-lote-manzana-modal');
}

function guardarLoteExtraManzana() {
  var idManzana = document.getElementById('lote-manzana-id').value;
  var numero = document.getElementById('lote-extra-numero').value;
  var medidas = document.getElementById('lote-extra-medidas').value;
  var precio = document.getElementById('lote-extra-precio').value;
  var estado = document.getElementById('lote-extra-estado').value;

  var payload = {
    Numero: parseInt(numero),
    Medidas: medidas ? medidas + ' m²' : '0x0 m²',
    Precio: parseFloat(precio || 0),
    Estado: estado || 'Disponible',
    IdManzana: parseInt(idManzana)
  };

  fetchApi('/lotes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function(res) {
      if (!res.IdLote) throw new Error("No se devolvió el IdLote");
      var cPayload = {
        Norte: document.getElementById('lote-extra-norte').value || '',
        Sur: document.getElementById('lote-extra-sur').value || '',
        Este: document.getElementById('lote-extra-este').value || '',
        Oeste: document.getElementById('lote-extra-oeste').value || '',
        IdLote: res.IdLote
      };
      return fetchApi('/colindancias', { method: 'POST', body: JSON.stringify(cPayload) });
    })
    .then(function() {
      showToast('✅ Lote y colindancias creados exitosamente', 'success');
      cerrarModal('crear-lote-manzana-modal');
      cargarDetalleDesarrollo();
    })
    .catch(function(err) {
      showToast('Error: ' + err.message, 'error');
    });
}

function renderDetalleDesarrollo(desarrollo) {
  renderDetalleDesarrolloSoloInfo(desarrollo);

  fetchApi('/manzanas/desarrollo/' + desarrollo.IdDesarrollo)
    .then(function(manzanas) {
      renderManzanas(manzanas, desarrollo.IdDesarrollo);
    })
    .catch(function() {
      var container = document.getElementById('manzanas-container');
      if (container) container.innerHTML = '<div class="empty-state"><div class="empty-icon">ðŸ“¦</div><div class="empty-title">No hay manzanas registradas</div></div>';
    });
}

function renderManzanas(manzanas, desarrolloId) {
  var container = document.getElementById('manzanas-container');
  if (!container) return;

  if (!Array.isArray(manzanas) || manzanas.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">ðŸ“¦</div><div class="empty-title">No hay manzanas registradas</div></div>';
    return;
  }

  var html = '';
  for (var m = 0; m < manzanas.length; m++) {
    var manzana = manzanas[m];
    
    html += '<div class="chart-card" style="margin-bottom:16px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px;">';
    html += '<div class="chart-title" style="margin-bottom:0;">Manzana ' + (manzana.Numero || '') + ' <span style="font-size:12px;font-weight:400;color:var(--c-muted);">' + (manzana.Calles_Colindantes || '') + '</span></div>';
    html += '<div style="display:flex;gap:6px;">';
    html += '<button class="btn-accent btn-sm" onclick="abrirModalCrearLoteManzana(' + manzana.IdManzana + ')">+ Lote</button>';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarManzana(' + desarrolloId + ', ' + manzana.IdManzana + ')">✏️ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarManzana(' + desarrolloId + ', ' + manzana.IdManzana + ')">🗑️ Eliminar</button>';
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

        html += '<div class="lot-cell ' + estadoClass + '">';
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

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Reduce quality to 0.7 to save space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => reject('Error loading image');
      img.src = e.target.result;
    };
    reader.onerror = () => reject('Error reading file');
    reader.readAsDataURL(file);
  });
}

function guardarDesarrolloModal() {
  var nombre = document.getElementById('dev-nombre');
  var ubicacion = document.getElementById('dev-ubicacion');
  var estatus = document.getElementById('dev-estatus');
  var fileInput = document.getElementById('dev-imagen');

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

  const file = fileInput.files[0];
  resizeImageFile(file).then(base64Str => {
    if(base64Str) payload.ImagenBase64 = base64Str;
    
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
  }).catch(err => {
    showToast('Error procesando imagen', 'error');
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
  var fileInput = document.getElementById('edit-dev-imagen');

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

  const file = fileInput.files[0];
  resizeImageFile(file).then(base64Str => {
    if(base64Str) {
      payload.ImagenBase64 = base64Str;
    } else {
      // If no file was uploaded, fetch current info to retain old image
      return fetchApi('/desarrollos/' + id).then(d => {
        if(d.ImagenBase64) payload.ImagenBase64 = d.ImagenBase64;
        return payload;
      });
    }
    return payload;
  })
  .then(finalPayload => {
    fetchApi('/desarrollos/' + id, {
      method: 'PUT',
      body: JSON.stringify(finalPayload)
    })
      .then(function() {
        showToast('✅ Desarrollo actualizado', 'success');
        cerrarModal('editar-desarrollo-modal');
        cargarDesarrollos();
      })
      .catch(function(error) {
        showToast('Error: ' + error.message, 'error');
      });
  }).catch(err => {
    showToast('Error procesando imagen', 'error');
  });
}

function eliminarDesarrollo(id) {
  if (!confirm('¿Eliminar este desarrollo y todas sus manzanas y lotes?')) return;
  
  fetchApi('/desarrollos/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('âœ… Desarrollo eliminado', 'success');
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
      showToast('âœ… Manzana creada exitosamente', 'success');
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
      var idEl = document.getElementById('edit-manzana-id');
      var devEl = document.getElementById('edit-desarrollo-nombre');
      var numEl = document.getElementById('edit-manzana-numero');
      var callesEl = document.getElementById('edit-manzana-calles');
      var tituloEl = document.getElementById('editar-titulo');

      if (!idEl) {
        showToast('Por favor recarga la página (Ctrl + F5). La interfaz está desactualizada.', 'warning');
        return;
      }

      idEl.value = manzanaId;
      if (devEl) devEl.value = manzana.DesarrolloNombre || '';
      if (numEl) numEl.value = manzana.Numero || '';
      if (callesEl) callesEl.value = manzana.Calles_Colindantes || '';
      if (tituloEl) tituloEl.textContent = 'Editar Manzana ' + (manzana.Numero || '');
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
    showToast('El nÃƒÂºmero de manzana es requerido', 'error');
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
      showToast('âœ… Manzana actualizada exitosamente', 'success');
      cerrarModal('editar-manzana-modal');
      cargarDetalleDesarrollo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarManzana(desarrolloId, manzanaId) {
  if (!confirm('Ã‚¿Eliminar esta manzana y todos sus lotes?')) return;
  
  fetchApi('/manzanas/' + manzanaId, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('âœ… Manzana eliminada', 'success');
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
      var html = '<option value="">Seleccionar desarrolloÃ¢â‚¬Â¦</option>';
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
