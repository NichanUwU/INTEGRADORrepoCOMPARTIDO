// CRUD PAGOS Y FLUJO DE EFECTIVO

function cargarFlujo() {
  fetchApi('/pagos')
    .then(function(data) {
      renderFlujo(data);
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-flujo-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando pagos: ' + error.message, 'error');
    });

  cargarKPIs();
}

function renderFlujo(pagos) {
  var tbody = document.getElementById('tabla-flujo-body');
  if (!tbody) return;

  if (!Array.isArray(pagos) || pagos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay movimientos registrados.</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < pagos.length; i++) {
    var f = pagos[i];
    var chipTipo = f.Tipo === 'Ingreso' ? 'chip-green' : 'chip-red';
    var chipEstatus = f.Estatus === 'Pagado' ? 'chip-green' : (f.Estatus === 'Atrasado' ? 'chip-red' : 'chip-warn');
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (f.IdPago || '') + '</td>';
    html += '<td>' + (f.Cliente || f.ClienteNombre || '') + '</td>';
    html += '<td>' + (f.Concepto || '') + '</td>';
    html += '<td>' + (f.FechaPago ? new Date(f.FechaPago).toLocaleDateString('es-MX') : '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(f.Monto || 0) + '</td>';
    html += '<td><span class="chip ' + chipTipo + '">' + (f.Tipo || 'Ingreso') + '</span></td>';
    html += '<td><span class="chip ' + chipEstatus + '">' + (f.Estatus || 'Desconocido') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-danger btn-sm" onclick="eliminarPago(' + f.IdPago + ')">🗑 Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('flujo-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + pagos.length + ' movimientos';
}

function cargarKPIs() {
  fetchApi('/pagos')
    .then(function(pagos) {
      var ingresos = 0, egresos = 0, atrasados = 0;
      for (var i = 0; i < pagos.length; i++) {
        var p = pagos[i];
        if (p.Tipo === 'Ingreso') ingresos += p.Monto || 0;
        else if (p.Tipo === 'Egreso') egresos += p.Monto || 0;
        if (p.Estatus === 'Atrasado') atrasados += p.Monto || 0;
      }
      
      var el = document.getElementById('ingresos-mes');
      if (el) el.textContent = '$' + new Intl.NumberFormat('es-MX').format(ingresos);
      el = document.getElementById('egresos-mes');
      if (el) el.textContent = '$' + new Intl.NumberFormat('es-MX').format(egresos);
      el = document.getElementById('flujo-neto');
      if (el) el.textContent = '$' + new Intl.NumberFormat('es-MX').format(ingresos - egresos);
      el = document.getElementById('pagos-atrasados');
      if (el) el.textContent = '$' + new Intl.NumberFormat('es-MX').format(atrasados);
    })
    .catch(function() {
      var el = document.getElementById('ingresos-mes');
      if (el) el.textContent = '$0';
      el = document.getElementById('egresos-mes');
      if (el) el.textContent = '$0';
      el = document.getElementById('flujo-neto');
      if (el) el.textContent = '$0';
      el = document.getElementById('pagos-atrasados');
      if (el) el.textContent = '$0';
    });
}

function cargarClientesSelect() {
  var select = document.getElementById('pago-cliente');
  if (!select) return;

  fetchApi('/clientes')
    .then(function(data) {
      var html = '<option value="">Seleccionar cliente…</option>';
      for (var i = 0; i < data.length; i++) {
        html += '<option value="' + data[i].IdCliente + '">' + data[i].Nombre + ' ' + data[i].Apellidos + '</option>';
      }
      select.innerHTML = html;
    })
    .catch(function() {
      select.innerHTML = '<option value="">Error cargando clientes</option>';
    });
}

function confirmarPago() {
  var clienteSelect = document.getElementById('pago-cliente');
  var montoInput = document.getElementById('pago-monto');
  var conceptoInput = document.getElementById('pago-concepto');

  if (!clienteSelect.value) {
    showToast('Selecciona un cliente', 'error');
    return;
  }
  if (!montoInput.value || parseFloat(montoInput.value) <= 0) {
    showToast('Ingresa un monto válido', 'error');
    return;
  }

  var clienteNombre = clienteSelect.options[clienteSelect.selectedIndex].text;
  
  document.getElementById('confirm-cliente').textContent = clienteNombre;
  document.getElementById('confirm-monto').textContent = '$' + new Intl.NumberFormat('es-MX').format(parseFloat(montoInput.value));
  document.getElementById('confirm-concepto').textContent = conceptoInput.value.trim() || 'Pago registrado';
  
  cerrarModal('registrar-pago-modal');
  abrirModal('confirmar-pago-modal');
}

function registrarPagoConfirmado() {
  var clienteSelect = document.getElementById('pago-cliente');
  var montoInput = document.getElementById('pago-monto');
  var conceptoInput = document.getElementById('pago-concepto');

  var payload = {
    Monto: parseFloat(montoInput.value),
    FechaPago: new Date().toISOString().split('T')[0],
    FechaCompromiso: new Date().toISOString().split('T')[0],
    MetodoPago: 'Efectivo',
    Estatus: 'Pagado',
    IdCliente: parseInt(clienteSelect.value),
    IdContrato: 1,
    Concepto: conceptoInput.value.trim() || 'Pago registrado'
  };

  fetchApi('/pagos', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      cerrarModal('confirmar-pago-modal');
      showToast('✅ Pago registrado exitosamente', 'success');
      cargarFlujo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function eliminarPago(id) {
  if (!confirm('¿Eliminar este pago?')) return;
  
  fetchApi('/pagos/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('✅ Pago eliminado', 'success');
      cargarFlujo();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('pago-cliente')) {
    cargarClientesSelect();
  }
});

window.cargarFlujo = cargarFlujo;
window.confirmarPago = confirmarPago;
window.registrarPagoConfirmado = registrarPagoConfirmado;
window.eliminarPago = eliminarPago;
window.cargarClientesSelect = cargarClientesSelect;