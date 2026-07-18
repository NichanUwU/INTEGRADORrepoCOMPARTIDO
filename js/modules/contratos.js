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
  
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var c = data[i];
    var chipClass = 'chip ';
    if (c.Estatus === 'Activo') chipClass += 'chip-green';
    else if (c.Estatus === 'Atrasado') chipClass += 'chip-red';
    else if (c.Estatus === 'Liquidado') chipClass += 'chip-blue';
    else chipClass += 'chip-gray';
    
    html += '<tr>';
    html += '<td style="font-weight:600">' + (c.IdContrato || c.Folio || '') + '</td>';
    html += '<td>' + (c.Cliente || '') + '</td>';
    html += '<td>' + (c.Lote || '') + '</td>';
    html += '<td>' + (c.Vendedor || '') + '</td>';
    html += '<td>' + (c.Fecha || '') + '</td>';
    html += '<td>' + (c.Hora || '') + '</td>';
    html += '<td>' + (c.TipoPago || '') + '</td>';
    html += '<td style="font-weight:600">$' + new Intl.NumberFormat('es-MX').format(c.MontoTotal || 0) + '</td>';
    html += '<td><span class="' + chipClass + '">' + (c.Estatus || 'Activo') + '</span></td>';
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarContrato(' + (c.IdContrato || 0) + ')">✏ Editar</button>';
    html += '<button class="btn-danger btn-sm" onclick="eliminarContrato(' + (c.IdContrato || 0) + ')">🗑 Eliminar</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('contratos-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' contratos';
}

function guardarContratoModal() {
  showToast('Función en desarrollo', 'info');
}

function abrirModalEditarContrato(id) {
  showToast('Función en desarrollo', 'info');
}

function actualizarContratoModal() {
  showToast('Función en desarrollo', 'info');
}

function eliminarContrato(id) {
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