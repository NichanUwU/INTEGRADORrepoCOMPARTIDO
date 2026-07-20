// CRUD CONTRATOS

function cargarContratos() {
  fetchApi('/contratos')
    .then(function(data) {
      renderContratos(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-contratos-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando contratos: ' + error.message, 'error');
    });
}

function renderContratos(data) {
  var tbody = document.getElementById('tabla-contratos-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center">No hay contratos registrados.</td></tr>';
    return;
  }
  
  var canEdit = typeof window.canPerformAction === 'function' ? window.canPerformAction('editar_contrato') : true;
  var canDelete = typeof window.canPerformAction === 'function' ? window.canPerformAction('eliminar_contrato') : true;

  var html = '';
  for (var i = 0; i < data.length; i++) {
    var c = data[i];
    var chipClass = 'chip ';
    if (c.Estatus === 'Activo') chipClass += 'chip-green';
    else if (c.Estatus === 'Vencido' || c.Estatus === 'Atrasado') chipClass += 'chip-red';
    else if (c.Estatus === 'Liquidado') chipClass += 'chip-blue';
    else chipClass += 'chip-gray';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (c.Folio || c.IdContrato || '') + '</td>';
    html += '<td>' + (c.Cliente || '') + '</td>';
    html += '<td>' + (c.Lote || '') + '</td>';
    html += '<td>' + (c.Vendedor || '') + '</td>';
    html += '<td>' + (c.Fecha || '') + '</td>';
    html += '<td>' + (c.Hora || '') + '</td>';
    html += '<td>' + (c.TipoPago || '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(c.MontoTotal || 0) + '</td>';
    html += '<td><span class="' + chipClass + '">' + (c.Estatus || 'Activo') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    if (canEdit) {
      html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarContrato(' + (c.IdContrato || 0) + ')">✏ Editar</button>';
    }
    if (canDelete) {
      html += '<button class="btn-danger btn-sm" onclick="eliminarContrato(' + (c.IdContrato || 0) + ')">🗑 Eliminar</button>';
    }
    if (!canEdit && !canDelete) {
      html += '<span style="color:var(--c-muted);font-size:12px;">Sin permisos</span>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('contratos-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' contratos';
}

function cargarOpcionesContratoFormulario() {
  cargarClientesSelect();
  cargarVendedoresSelect();
  cargarLotesSelect();
}

function cargarClientesSelect() {
  var selects = [document.getElementById('ctr-cliente'), document.getElementById('edit-ctr-cliente')];
  if (!selects.some(function(el) { return el; })) return Promise.resolve();

  return fetchApi('/clientes')
    .then(function(data) {
      var html = '<option value="">Seleccionar…</option>';
      data.forEach(function(cliente) {
        html += '<option value="' + cliente.IdCliente + '">';
        html += (cliente.Nombre || '') + ' ' + (cliente.Apellidos || '') + ' - ' + (cliente.Ciudad || '');
        html += '</option>';
      });
      selects.forEach(function(select) {
        if (select) select.innerHTML = html;
      });
    })
    .catch(function() {
      // mantener opciones existentes
    });
}

function cargarVendedoresSelect() {
  var selects = [document.getElementById('ctr-vendedor'), document.getElementById('edit-ctr-vendedor')];
  if (!selects.some(function(el) { return el; })) return Promise.resolve();

  return fetchApi('/empleados')
    .then(function(data) {
      var html = '<option value="">Seleccionar…</option>';
      data.forEach(function(empleado) {
        html += '<option value="' + empleado.IdEmpleado + '">';
        html += (empleado.Nombre || '') + ' ' + (empleado.Apellidos || '') + ' - ' + (empleado.Cargo || '');
        html += '</option>';
      });
      selects.forEach(function(select) {
        if (select) select.innerHTML = html;
      });
    })
    .catch(function() {
      // mantener opciones existentes
    });
}

function cargarLotesSelect() {
  var selects = [document.getElementById('ctr-lote'), document.getElementById('edit-ctr-lote')];
  if (!selects.some(function(el) { return el; })) return Promise.resolve();

  return fetchApi('/lotes')
    .then(function(data) {
      var html = '<option value="">Seleccionar…</option>';
      data.forEach(function(lote) {
        html += '<option value="' + lote.IdLote + '">';
        html += (lote.Numero || '') + ' · ' + (lote.DesarrolloNombre || '') + ' · $' + new Intl.NumberFormat('es-MX').format(lote.Precio || 0);
        html += '</option>';
      });
      selects.forEach(function(select) {
        if (select) select.innerHTML = html;
      });
    })
    .catch(function() {
      // mantener opciones existentes
    });
}

function guardarContratoModal() {
  if (!window.canPerformAction || !window.canPerformAction('crear_contrato')) {
    showToast('No tienes permiso para crear contratos', 'error');
    return;
  }

  var cliente = document.getElementById('ctr-cliente');
  var lote = document.getElementById('ctr-lote');
  var vendedor = document.getElementById('ctr-vendedor');
  var fecha = document.getElementById('ctr-fecha');
  var hora = document.getElementById('ctr-hora');
  var tipoPago = document.getElementById('ctr-tipopago');
  var monto = document.getElementById('ctr-monto');

  if (!cliente || !cliente.value || !lote || !lote.value || !vendedor || !vendedor.value ||
      !fecha || !fecha.value || !hora || !hora.value || !tipoPago || !tipoPago.value ||
      !monto || !monto.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    IdCliente: parseInt(cliente.value, 10),
    IdLote: parseInt(lote.value, 10),
    IdEmpleado: parseInt(vendedor.value, 10),
    Fecha: fecha.value,
    Hora: hora.value,
    TipoPago: tipoPago.value,
    MontoTotal: monto.value
  };

  fetchApi('/contratos', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Contrato registrado exitosamente', 'success');
      cerrarModal('crear-contrato-modal');
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarContrato(id) {
  if (!window.canPerformAction || !window.canPerformAction('editar_contrato')) {
    showToast('No tienes permiso para editar contratos', 'error');
    return;
  }

  Promise.all([fetchApi('/contratos/' + id), cargarClientesSelect(), cargarVendedoresSelect(), cargarLotesSelect()])
    .then(function(results) {
      var contrato = results[0];
      document.getElementById('edit-contrato-id').value = contrato.IdContrato;
      document.getElementById('edit-ctr-cliente').value = contrato.IdCliente || '';
      document.getElementById('edit-ctr-lote').value = contrato.IdLote || '';
      document.getElementById('edit-ctr-vendedor').value = contrato.IdEmpleado || '';
      document.getElementById('edit-ctr-fecha').value = contrato.Fecha || '';
      document.getElementById('edit-ctr-hora').value = contrato.Hora || '';
      document.getElementById('edit-ctr-tipopago').value = contrato.TipoPago || '';
      document.getElementById('edit-ctr-monto').value = contrato.MontoTotal || '';
      abrirModal('editar-contrato-modal');
    })
    .catch(function(error) {
      showToast('Error cargando contrato: ' + error.message, 'error');
    });
}

function actualizarContratoModal() {
  if (!window.canPerformAction || !window.canPerformAction('editar_contrato')) {
    showToast('No tienes permiso para actualizar contratos', 'error');
    return;
  }

  var id = parseInt(document.getElementById('edit-contrato-id').value, 10);
  var cliente = document.getElementById('edit-ctr-cliente');
  var lote = document.getElementById('edit-ctr-lote');
  var vendedor = document.getElementById('edit-ctr-vendedor');
  var fecha = document.getElementById('edit-ctr-fecha');
  var hora = document.getElementById('edit-ctr-hora');
  var tipoPago = document.getElementById('edit-ctr-tipopago');
  var monto = document.getElementById('edit-ctr-monto');

  if (!cliente || !cliente.value || !lote || !lote.value || !vendedor || !vendedor.value ||
      !fecha || !fecha.value || !hora || !hora.value || !tipoPago || !tipoPago.value ||
      !monto || !monto.value) {
    showToast('Completa todos los campos requeridos (*)', 'error');
    return;
  }

  var payload = {
    IdCliente: parseInt(cliente.value, 10),
    IdLote: parseInt(lote.value, 10),
    IdEmpleado: parseInt(vendedor.value, 10),
    Fecha: fecha.value,
    Hora: hora.value,
    TipoPago: tipoPago.value,
    MontoTotal: monto.value
  };

  fetchApi('/contratos/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('Contrato actualizado', 'success');
      cerrarModal('editar-contrato-modal');
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarContrato(id) {
  if (!window.canPerformAction || !window.canPerformAction('eliminar_contrato')) {
    showToast('No tienes permiso para eliminar contratos', 'error');
    return;
  }

  if (!confirm('¿Eliminar este contrato?')) return;
  
  fetchApi('/contratos/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Contrato eliminado', 'success');
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

window.cargarContratos = cargarContratos;
window.guardarContratoModal = guardarContratoModal;
window.abrirModalEditarContrato = abrirModalEditarContrato;
window.actualizarContratoModal = actualizarContratoModal;
window.eliminarContrato = eliminarContrato;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('ctr-cliente') || document.getElementById('edit-ctr-cliente')) {
    cargarOpcionesContratoFormulario();
  }
});