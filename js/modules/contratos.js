// CRUD CONTRATOS CON SOPORTE COMPLETO DE DERECHOS Y PLANTILLAS
var globalClientes = [];
var globalLotes = [];
var globalVendedores = [];

function cargarContratos() {
  fetchApi('/contratos')
    .then(function(data) {
      window.allContratos = data || [];
      filtrarContratos(); // Applies filters and calls renderContratos
    })
    .catch(function(error) {
      var tbody = document.getElementById('tabla-contratos-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--c-error)">Error: ' + error.message + '</td></tr>';
      }
      showToast('Error cargando contratos: ' + error.message, 'error');
    });

  // Cargar listas en paralelo una sola vez al cargar la secciÃƒÂ³n
  Promise.all([
    fetchApi('/clientes').catch(function() { return []; }),
    fetchApi('/lotes').catch(function() { return []; }),
    fetchApi('/empleados').catch(function() { return []; })
  ]).then(function(results) {
    globalClientes = results[0];
    globalLotes = results[1];
    globalVendedores = results[2];
    populateDropdowns(null);
    
    // Populate Desarrollo Filter Dropdown
    var filterDesarrollo = document.getElementById('filter-contrato-desarrollo');
    if (filterDesarrollo && filterDesarrollo.options.length <= 1) {
      fetchApi('/desarrollos').then(function(desarrollos) {
        var html = '<option value="">Todos los Desarrollos</option>';
        for (var i = 0; i < desarrollos.length; i++) {
          html += '<option value="' + desarrollos[i].Nombre + '">' + desarrollos[i].Nombre + '</option>';
        }
        filterDesarrollo.innerHTML = html;
      }).catch(function(){});
    }
  });
}

function filtrarContratos() {
  if (!window.allContratos) return;
  
  var searchQuery = (document.getElementById('search-contrato')?.value || '').toLowerCase();
  var filterDev = document.getElementById('filter-contrato-desarrollo')?.value || '';
  var filterStatus = document.getElementById('filter-contrato-estatus')?.value || '';
  
  var filtrados = window.allContratos.filter(function(c) {
    var textMatch = true;
    if (searchQuery) {
      var searchStr = (c.IdContrato + ' ' + (c.Cliente||'') + ' ' + (c.Vendedor||'') + ' ' + (c.Lote||'') + ' ' + (c.Desarrollo||'')).toLowerCase();
      textMatch = searchStr.includes(searchQuery);
    }
    
    var devMatch = true;
    if (filterDev) {
      devMatch = (c.Desarrollo === filterDev);
    }
    
    var statusMatch = true;
    if (filterStatus) {
      statusMatch = (c.Estado === filterStatus);
    }
    
    return textMatch && devMatch && statusMatch;
  });
  
  renderContratos(filtrados);
}

function populateDropdowns(selectedLoteId) {
  // Clientes
  var selCrear = document.getElementById('ctr-cliente');
  var selEdit = document.getElementById('edit-ctr-cliente');
  var optionsHtml = '<option value="">SeleccionarÃ¢â‚¬Â¦</option>';
  for (var i = 0; i < globalClientes.length; i++) {
    var c = globalClientes[i];
    optionsHtml += '<option value="' + c.IdCliente + '">' + c.Nombre + ' ' + c.Apellidos + '</option>';
  }
  if (selCrear) selCrear.innerHTML = optionsHtml;
  if (selEdit) selEdit.innerHTML = optionsHtml;

  // Lotes
  selCrear = document.getElementById('ctr-lote');
  selEdit = document.getElementById('edit-ctr-lote');
  
  var optionsCrear = '<option value="">SeleccionarÃ¢â‚¬Â¦</option>';
  for (var i = 0; i < globalLotes.length; i++) {
    var l = globalLotes[i];
    if (l.Estado === 'Disponible') {
      optionsCrear += '<option value="' + l.IdLote + '">' + l.Numero + ' Ã‚Â· ' + l.DesarrolloNombre + ' Ã‚Â· $' + new Intl.NumberFormat('es-MX').format(l.Precio) + '</option>';
    }
  }
  if (selCrear) selCrear.innerHTML = optionsCrear;

  var optionsEdit = '<option value="">SeleccionarÃ¢â‚¬Â¦</option>';
  for (var i = 0; i < globalLotes.length; i++) {
    var l = globalLotes[i];
    if (l.Estado === 'Disponible' || l.IdLote === selectedLoteId) {
      optionsEdit += '<option value="' + l.IdLote + '">' + l.Numero + ' Ã‚Â· ' + l.DesarrolloNombre + ' Ã‚Â· $' + new Intl.NumberFormat('es-MX').format(l.Precio) + '</option>';
    }
  }
  if (selEdit) selEdit.innerHTML = optionsEdit;

  // Vendedores
  selCrear = document.getElementById('ctr-vendedor');
  selEdit = document.getElementById('edit-ctr-vendedor');
  optionsHtml = '<option value="">SeleccionarÃ¢â‚¬Â¦</option>';
  for (var i = 0; i < globalVendedores.length; i++) {
    var e = globalVendedores[i];
    optionsHtml += '<option value="' + e.IdEmpleado + '">' + e.Nombre + ' ' + e.Apellidos + ' (' + e.Cargo + ')</option>';
  }
  if (selCrear) selCrear.innerHTML = optionsHtml;
  if (selEdit) selEdit.innerHTML = optionsHtml;
}

function renderContratos(data) {
  window.exportCurrentTable = () => window.exportToCSV ? window.exportToCSV(data, 'contratos.csv') : null;
  var tbody = document.getElementById('tabla-contratos-body');
  if (!tbody) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;color:var(--c-muted);"><div style="font-size:48px;margin-bottom:16px;">ðŸ“„</div><div style="font-size:16px;font-weight:600;color:var(--c-primary);">No hay contratos registrados</div><div style="font-size:14px;margin-top:8px;">Haz clic en Nuevo Contrato para comenzar.</div></div></td></tr>';
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
    var role = 'invitado';
    try { var user = JSON.parse(localStorage.getItem('sofi-user') || '{}'); role = (user.role || user.Rol || '').toLowerCase().trim(); } catch(e) {}
    html += '<td style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button class="btn-accent btn-sm" onclick="generarDocumentoContrato(' + (c.IdContrato || 0) + ')">📄 Generar</button>';
    if (role === 'directivo' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-outline btn-sm" onclick="abrirModalEditarContrato(' + c.IdContrato + ')">✏️ Editar</button>';
    }
    if (role === 'directivo' || role === 'admin' || role === 'administrador') {
        html += '<button class="btn-danger btn-sm" onclick="eliminarContrato(' + c.IdContrato + ')">🗑️ Eliminar</button>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  
  var pag = document.getElementById('contratos-paginacion');
  if (pag) pag.textContent = 'Mostrando ' + data.length + ' contratos';
}

function seleccionarLotePrecio(modo) {
  var selectId = modo === 'crear' ? 'ctr-lote' : 'edit-ctr-lote';
  var inputId = modo === 'crear' ? 'ctr-monto' : 'edit-ctr-monto';
  
  var select = document.getElementById(selectId);
  var input = document.getElementById(inputId);
  if (!select || !input) return;
  
  var loteId = parseInt(select.value);
  if (isNaN(loteId)) return;
  
  for (var i = 0; i < globalLotes.length; i++) {
    if (globalLotes[i].IdLote === loteId) {
      input.value = globalLotes[i].Precio;
      recalcularMensualidad(modo);
      break;
    }
  }
}

function toggleFinanciamientoFields(modo) {
  var tipopagoId = modo === 'crear' ? 'ctr-tipopago' : 'edit-ctr-tipopago';
  var classFields = modo === 'crear' ? 'financiamiento-field' : 'edit-financiamiento-field';
  
  var select = document.getElementById(tipopagoId);
  if (!select) return;
  
  var fields = document.getElementsByClassName(classFields);
  var show = (select.value === 'Financiamiento' || select.value === 'Parcial');
  
  for (var i = 0; i < fields.length; i++) {
    fields[i].style.display = show ? 'block' : 'none';
  }
  
  if (!show) {
    var prefix = modo === 'crear' ? 'ctr-' : 'edit-ctr-';
    var enganche = document.getElementById(prefix + 'enganche');
    var plazo = document.getElementById(prefix + 'plazo');
    var mensualidad = document.getElementById(prefix + 'mensualidad');
    if (enganche) enganche.value = 0;
    if (plazo) plazo.value = 0;
    if (mensualidad) mensualidad.value = 0;
  } else {
    recalcularMensualidad(modo);
  }
}

function recalcularMensualidad(modo) {
  var prefix = modo === 'crear' ? 'ctr-' : 'edit-ctr-';
  var montoInput = document.getElementById(prefix + 'monto');
  var engancheInput = document.getElementById(prefix + 'enganche');
  var plazoInput = document.getElementById(prefix + 'plazo');
  var mensualidadInput = document.getElementById(prefix + 'mensualidad');
  
  if (!montoInput || !engancheInput || !plazoInput || !mensualidadInput) return;
  
  var monto = parseFloat(montoInput.value) || 0;
  var enganche = parseFloat(engancheInput.value) || 0;
  var plazo = parseInt(plazoInput.value) || 0;
  
  var saldo = monto - enganche;
  var mensualidad = 0;
  if (plazo > 0 && saldo > 0) {
    mensualidad = Math.round((saldo / plazo) * 100) / 100;
  }
  
  mensualidadInput.value = mensualidad.toFixed(2);
}

function guardarContratoModal() {
  var idCliente = document.getElementById('ctr-cliente').value;
  var idLote = document.getElementById('ctr-lote').value;
  var idEmpleado = document.getElementById('ctr-vendedor').value;
  var fecha = document.getElementById('ctr-fecha').value;
  var hora = document.getElementById('ctr-hora').value;
  var tipopago = document.getElementById('ctr-tipopago').value;
  var monto = document.getElementById('ctr-monto').value;
  var enganche = document.getElementById('ctr-enganche').value || 0;
  var plazo = document.getElementById('ctr-plazo').value || 0;
  var mensualidad = document.getElementById('ctr-mensualidad').value || 0;
  
  if (!idCliente || !idLote || !idEmpleado || !fecha || !hora || !tipopago || !monto) {
    showToast('Por favor completa todos los campos requeridos (*)', 'warning');
    return;
  }
  
  var folio = 'CON-' + Math.floor(1000 + Math.random() * 9000);
  
  var payload = {
    Folio: folio,
    Fecha: fecha,
    Hora: hora,
    TipoPago: tipopago,
    MontoTotal: monto,
    Enganche: enganche,
    PlazoMeses: plazo,
    Mensualidad: mensualidad,
    IdCliente: idCliente,
    IdEmpleado: idEmpleado,
    IdLote: idLote
  };
  
  fetchApi('/contratos', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('âœ… Contrato creado con Ã©xito', 'success');
      cerrarModal('crear-contrato-modal');
      document.getElementById('form-crear-contrato').reset();
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function abrirModalEditarContrato(id) {
  fetchApi('/contratos/' + id)
    .then(function(c) {
      populateDropdowns(c.IdLote);
      
      document.getElementById('edit-contrato-id').value = c.IdContrato;
      document.getElementById('edit-ctr-cliente').value = c.IdCliente;
      document.getElementById('edit-ctr-lote').value = c.IdLote;
      document.getElementById('edit-ctr-vendedor').value = c.IdEmpleado;
      document.getElementById('edit-ctr-fecha').value = c.Fecha;
      document.getElementById('edit-ctr-hora').value = c.Hora;
      document.getElementById('edit-ctr-tipopago').value = c.TipoPago;
      document.getElementById('edit-ctr-monto').value = c.MontoTotal;
      document.getElementById('edit-ctr-enganche').value = c.Enganche || 0;
      document.getElementById('edit-ctr-plazo').value = c.PlazoMeses || 0;
      document.getElementById('edit-ctr-mensualidad').value = c.Mensualidad || 0;
      
      toggleFinanciamientoFields('editar');
      
      abrirModal('editar-contrato-modal');
    })
    .catch(function(error) {
      showToast('Error cargando detalles del contrato: ' + error.message, 'error');
    });
}

function actualizarContratoModal() {
  var id = document.getElementById('edit-contrato-id').value;
  var idCliente = document.getElementById('edit-ctr-cliente').value;
  var idLote = document.getElementById('edit-ctr-lote').value;
  var idEmpleado = document.getElementById('edit-ctr-vendedor').value;
  var fecha = document.getElementById('edit-ctr-fecha').value;
  var hora = document.getElementById('edit-ctr-hora').value;
  var tipopago = document.getElementById('edit-ctr-tipopago').value;
  var monto = document.getElementById('edit-ctr-monto').value;
  var enganche = document.getElementById('edit-ctr-enganche').value || 0;
  var plazo = document.getElementById('edit-ctr-plazo').value || 0;
  var mensualidad = document.getElementById('edit-ctr-mensualidad').value || 0;
  
  if (!idCliente || !idLote || !idEmpleado || !fecha || !hora || !tipopago || !monto) {
    showToast('Por favor completa todos los campos requeridos (*)', 'warning');
    return;
  }
  
  var payload = {
    Fecha: fecha,
    Hora: hora,
    TipoPago: tipopago,
    MontoTotal: monto,
    Enganche: enganche,
    PlazoMeses: plazo,
    Mensualidad: mensualidad,
    IdCliente: idCliente,
    IdEmpleado: idEmpleado,
    IdLote: idLote,
    Estatus: 'Activo'
  };
  
  fetchApi('/contratos/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(function() {
      showToast('âœ… Contrato actualizado con Ã©xito', 'success');
      cerrarModal('editar-contrato-modal');
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error al actualizar contrato: ' + error.message, 'error');
    });
}

function eliminarContrato(id) {
  if (!confirm('Ã‚¿Eliminar este contrato?')) return;
  
  fetchApi('/contratos/' + id, {
    method: 'DELETE'
  })
    .then(function() {
      showToast('âœ… Contrato eliminado', 'success');
      cargarContratos();
    })
    .catch(function(error) {
      showToast('Error: ' + error.message, 'error');
    });
}

function generarDocumentoContrato(id) {
  var url = 'imprimir-contrato.html?id=' + id;
  window.open(url, '_blank');
}

// Exponer funciones al objeto global window para permitir llamadas desde atributos HTML onclick/onchange/oninput
window.cargarContratos = cargarContratos;
window.guardarContratoModal = guardarContratoModal;
window.abrirModalEditarContrato = abrirModalEditarContrato;
window.actualizarContratoModal = actualizarContratoModal;
window.eliminarContrato = eliminarContrato;
window.seleccionarLotePrecio = seleccionarLotePrecio;
window.toggleFinanciamientoFields = toggleFinanciamientoFields;
window.recalcularMensualidad = recalcularMensualidad;
window.generarDocumentoContrato = generarDocumentoContrato;
