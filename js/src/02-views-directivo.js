function viewDirectivoDashboard(){
  return `
  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Ingresos del Mes</div>
      <div class="kpi-value">$2.4M</div>
      <div class="kpi-trend trend-up">▲ 18% vs mes anterior</div>
    </div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)">
      <div class="kpi-label">Contratos Activos</div>
      <div class="kpi-value">142</div>
      <div class="kpi-trend trend-up">▲ 6 nuevos esta semana</div>
    </div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)">
      <div class="kpi-label">Pagos Atrasados</div>
      <div class="kpi-value">17</div>
      <div class="kpi-trend trend-down">▼ requieren atención</div>
    </div>
    <div class="kpi-card" style="border-left-color:#9C27B0">
      <div class="kpi-label">Lotes Disponibles</div>
      <div class="kpi-value">84</div>
      <div class="kpi-trend" style="color:var(--c-muted)">de 260 totales</div>
    </div>
  </div>

  <!-- Charts row -->
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Ingresos vs Egresos (últimos 6 meses)</div>
      <div class="chart-area" id="chart-ie">
        ${barChart([
          {label:'Ene',a:180,b:90},{label:'Feb',a:220,b:110},
          {label:'Mar',a:195,b:85},{label:'Abr',a:260,b:120},
          {label:'May',a:240,b:105},{label:'Jun',a:310,b:95}
        ])}
      </div>
      <div style="display:flex;gap:16px;margin-top:28px">
        <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--c-muted)">
          <span style="width:10px;height:10px;background:var(--c-accent);border-radius:2px;display:inline-block"></span>Ingresos
        </span>
        <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--c-muted)">
          <span style="width:10px;height:10px;background:var(--c-error);border-radius:2px;display:inline-block"></span>Egresos
        </span>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Ranking de Vendedores (mes actual)</div>
      <div class="ranking-list">
        ${[
          {n:'M. Rodríguez',v:'$580K',pct:95},
          {n:'L. García',   v:'$430K',pct:70},
          {n:'R. Sánchez',  v:'$390K',pct:63},
          {n:'P. Torres',   v:'$310K',pct:50},
          {n:'A. Mendoza',  v:'$220K',pct:36},
        ].map((r,i)=>`
        <div class="ranking-item">
          <div class="rank-num">${i+1}</div>
          <div class="rank-name">${r.n}</div>
          <div class="rank-bar"><div class="rank-bar-fill" style="width:${r.pct}%"></div></div>
          <div class="rank-value">${r.v}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Alerts + Desarrollos -->
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Alertas Recientes</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {t:'Pago atrasado',d:'Cliente: J. Hernández · $8,500 vencido el 01/Jun',type:'error'},
          {t:'Contrato por vencer',d:'C-0241 · L. Pérez vence en 5 días',type:'warn'},
          {t:'Pago atrasado',d:'Cliente: R. Domínguez · $12,200 vencido',type:'error'},
          {t:'Documento faltante',d:'Expediente incompleto: CURP de A. Torres',type:'warn'},
        ].map(a=>`
        <div class="alert-card ${a.type}">
          <div class="alert-icon"></div>
          <div class="alert-text"><strong>${a.t}</strong><span>${a.d}</span></div>
        </div>`).join('')}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Mapa de Desarrollos</div>
      <div class="dev-map">
        ${[
          {name:'Las Palmas Residencial',loc:'Querétaro',disp:32,vend:68,icon:'🏡'},
          {name:'Vista del Lago',        loc:'Guadalajara',disp:20,vend:40,icon:'🌊'},
          {name:'El Encino',             loc:'CDMX',disp:15,vend:25,icon:'🌳'},
        ].map(d=>`
        <div class="dev-card" onclick="navigate('detalle-desarrollo')">
          <div class="dev-card-thumb">${d.icon}</div>
          <div class="dev-card-body">
            <div class="dev-card-name">${d.name}</div>
          <div class="dev-card-meta">${d.loc}</div>
            <div class="dev-card-stats">
              <div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-accent)">${d.disp}</div><div class="dev-stat-label">Disponibles</div></div>
              <div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-error)">${d.vend}</div><div class="dev-stat-label">Vendidos</div></div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewDesarrollos(){
  setTimeout(() => fetchDesarrollos(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Desarrollos Inmobiliarios</div>
    <button class="btn-accent" onclick="navigate('crear-desarrollo')">Nuevo Desarrollo</button>
  </div>
  <div class="dev-map" id="cards-desarrollos-body" style="margin-bottom:24px">
    <div class="alert-card" style="width:100%;text-align:center;">Cargando desarrollos...</div>
  </div>`;
}

function viewCrearDesarrollo(){
  return `
  <div style="max-width:680px">
    <div class="section-header">
      <div class="section-title">Nuevo Desarrollo</div>
      <button class="btn-outline btn-sm" onclick="navigate('desarrollos')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre del Proyecto *</label>
          <input type="text" placeholder="Ej. Las Palmas Residencial"></div>
        <div class="form-group"><label>Ubicación *</label>
          <input type="text" placeholder="Ciudad, Estado"></div>
        <div class="form-group"><label>Total de Lotes *</label>
          <input type="number" placeholder="0" min="1"></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Activo</option><option>Preventa</option><option>Cerrado</option></select></div>
        <div class="form-group full"><label>Descripción</label>
          <textarea rows="3" placeholder="Describe el desarrollo…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('desarrollos')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Desarrollo creado exitosamente','success');navigate('desarrollos')">Guardar Desarrollo</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleDesarrollo(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Las Palmas Residencial</div>
      <p style="font-size:12px;color:var(--c-muted)">Querétaro, Qro. · 100 lotes totales</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('desarrollos')">← Regresar</button>
      <button class="btn-accent btn-sm">Editar</button>
    </div>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card"><div class="kpi-label">Total Lotes</div><div class="kpi-value">100</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Disponibles</div><div class="kpi-value">32</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Vendidos</div><div class="kpi-value">68</div></div>
  </div>
  <div class="chart-card" style="margin-bottom:16px">
    <div class="chart-title">Disponibilidad de Lotes</div>
    <p style="font-size:12px;color:var(--c-muted);margin-bottom:12px">
      <span style="color:var(--c-accent)">■</span> Disponible &nbsp;
      <span style="color:var(--c-error)">■</span> Vendido &nbsp;
      <span style="color:var(--c-warn)">■</span> Reservado
    </p>
    <div class="lot-grid">
      ${Array.from({length:40},(_,i)=>{
        const s=i<25?'sold':i<28?'reserved':'available';
        const n=(i+1).toString().padStart(2,'0');
        return `<div class="lot-cell ${s}" onclick="navigate('detalle-lote')">L-${n}</div>`;
      }).join('')}
    </div>
  </div>`;
}

function viewLotes(){
  setTimeout(() => fetchLotes(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Gestión de Lotes</div>
    <button class="btn-accent" onclick="navigate('crear-lote')">Nuevo Lote</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar lote…" style="max-width:240px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option><option>Vista del Lago</option></select>
      <select class="filter-select"><option>Todos los Estatus</option><option>Disponible</option><option>Vendido</option><option>Reservado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Desarrollo</th><th>Núm. Lote</th><th>Superficie (m²)</th><th>Precio de Lista</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-lotes-body">
        <tr><td colspan="7">Cargando lotes...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando lotes reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button>
        <button class="pag-btn">3</button><button class="pag-btn">…</button><button class="pag-btn">14</button>
      </div>
    </div>
  </div>`;
}

function viewCrearLote(){
  return `
  <div style="max-width:760px">
    <div class="section-header">
      <div class="section-title">Nuevo Lote</div>
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Desarrollo *</label>
          <select><option>Seleccionar…</option><option>Las Palmas</option><option>Vista del Lago</option></select></div>
        <div class="form-group"><label>Número de Lote *</label>
          <input id="lote-numero" type="text" placeholder="Ej. A-12"></div>
        <div class="form-group"><label>Superficie (m²) *</label>
          <input id="lote-medidas" type="number" placeholder="120" min="1"></div>
        <div class="form-group"><label>Precio de Lista *</label>
          <input id="lote-precio" type="number" placeholder="350000" min="0"></div>
        <div class="form-group"><label>Estatus *</label>
          <select id="lote-estado"><option>Disponible</option><option>Vendido</option><option>Reservado</option></select></div>
        <div class="form-group full"><label>Colindancias</label></div>
        <div class="form-group"><label>Norte</label><input id="lote-norte" placeholder="Descripción del colindante"></div>
        <div class="form-group"><label>Sur</label><input id="lote-sur" placeholder="Descripción del colindante"></div>
        <div class="form-group"><label>Este</label><input id="lote-este" placeholder="Descripción del colindante"></div>
        <div class="form-group"><label>Oeste</label><input id="lote-oeste" placeholder="Descripción del colindante"></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('lotes')">Cancelar</button>
        <button class="btn-accent" onclick="guardarLote()">Guardar Lote</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleLote(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Lote A-01 · Las Palmas Residencial</div>
      <p style="font-size:12px;color:var(--c-muted)">ID: L-001 · 120 m²</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">← Regresar</button>
      <button class="btn-accent btn-sm">Editar</button>
    </div>
  </div>
  <div class="two-col">
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Datos del Lote</div>
      ${detailRow('ID Lote','L-001')}
      ${detailRow('Desarrollo','Las Palmas Residencial')}
      ${detailRow('Número','A-01')}
      ${detailRow('Superficie','120 m²')}
      ${detailRow('Precio de Lista','$380,000 MXN')}
      ${detailRow('Estatus','<span class="chip chip-green">Disponible</span>')}
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Acciones</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn-accent" onclick="navigate('crear-contrato')">Generar Contrato</button>
        <button class="btn-outline">Simular Financiamiento</button>
        <button class="btn-outline">Ver Plano</button>
      </div>
    </div>
  </div>`;
}

function viewClientes(){
  setTimeout(() => fetchClientes(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Clientes</div>
    <button class="btn-accent" onclick="navigate('crear-cliente')">Nuevo Cliente</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar por nombre, ciudad o estado…" style="max-width:280px">
      <select class="filter-select"><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre Completo</th><th>Teléfono</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-clientes-body">
        <tr><td colspan="6">Cargando clientes...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando clientes reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button>
      </div>
    </div>
  </div>`;
}

function viewCrearCliente(){
  return `
  <div style="max-width:760px">
    <div class="section-header">
      <div class="section-title">Nuevo Cliente</div>
      <button class="btn-outline btn-sm" onclick="navigate('clientes')">Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Nombre *</label><input id="cliente-nombre" placeholder="Juan"></div>
        <div class="form-group"><label>Apellidos *</label><input id="cliente-apellidos" placeholder="Hernández López"></div>
        <div class="form-group full"><label>Dirección *</label><input id="cliente-direccion" placeholder="Calle y número"></div>
        <div class="form-group"><label>Casa / Apartamento</label><input id="cliente-casa-apartamento" placeholder="Casa 12 o Apto 3B"></div>
        <div class="form-group"><label>Código Postal *</label><input id="cliente-cp" placeholder="76000"></div>
        <div class="form-group"><label>Ciudad *</label><input id="cliente-ciudad" placeholder="Querétaro"></div>
        <div class="form-group"><label>Estado *</label><input id="cliente-estado" placeholder="Querétaro"></div>
        <div class="form-group"><label>Teléfono *</label><input id="cliente-telefono" type="tel" placeholder="442-100-0000"></div>
        <div class="form-group"><label>INE</label><input id="cliente-ine" placeholder="1234567890"></div>
        <div class="form-group"><label>CURP *</label><input id="cliente-curp" placeholder="HELG000101HQRNPN05"></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('clientes')">Cancelar</button>
        <button class="btn-accent" onclick="guardarCliente()">Guardar Cliente</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleCliente(){
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Juan Hernández López</div>
      <p style="font-size:12px;color:var(--c-muted)">ID: C-001 · RFC: HELJ801234AB1</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('clientes')">← Regresar</button>
      <button class="btn-accent btn-sm">Editar</button>
    </div>
  </div>
  <div class="two-col" style="align-items:start">
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Datos Personales</div>
        ${detailRow('Nombre','Juan Hernández López')}
        ${detailRow('RFC','HELJ801234AB1')}
        ${detailRow('CURP','HELJ801234HQRNPN03')}
        ${detailRow('Teléfono','442-100-2000')}
        ${detailRow('Estado Civil','Casado')}
        ${detailRow('Dirección','Av. Tecnológico 120, Col. Centro, Querétaro, Qro.')}
      </div>
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Testigos Registrados</div>
        ${[{n:'Laura Hernández (Esposa)',r:'Cónyuge'},{n:'Carlos Medina (Amigo)',r:'Amigo'}]
          .map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--c-border)">
            <span style="font-size:13px">${t.n}</span><span class="chip chip-gray">${t.r}</span>
          </div>`).join('')}
        <button class="btn-outline btn-sm" style="margin-top:10px">Agregar Testigo</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Contratos</div>
        ${[{id:'CON-0051',lot:'A-01',dev:'Las Palmas',monto:'$380K',st:'Activo'},
           {id:'CON-0062',lot:'B-01',dev:'Vista del Lago',monto:'$295K',st:'Activo'}]
          .map(c=>`<div class="alert-card success" style="margin-bottom:8px;cursor:pointer" onclick="navigate('detalle-contrato')">
            <div class="alert-icon"></div>
            <div class="alert-text">
              <strong>${c.id} · Lote ${c.lot}</strong>
              <span>${c.dev} · ${c.monto}</span>
            </div>
            <span class="chip chip-green">${c.st}</span>
          </div>`).join('')}
      </div>
      <div class="form-card">
        <div class="chart-title" style="margin-bottom:12px">Documentos Adjuntos</div>
        <div class="doc-zone" onclick="showToast('Seleccionar archivo…','')">
          <br><span style="font-size:12px;color:var(--c-muted)">Clic para subir documento</span>
        </div>
        <div class="doc-list" style="margin-top:10px">
          ${[{n:'INE_Frente.pdf',s:'1.2 MB'},{n:'Comprobante_Domicilio.pdf',s:'890 KB'}]
            .map(d=>`<div class="doc-item"><div class="doc-icon"></div>
              <div class="doc-name">${d.n}</div><div class="doc-size">${d.s}</div>
              <button class="btn-outline btn-sm">Descargar</button></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function viewContratos(){
  setTimeout(() => fetchContratos(), 0);
  return `
  <div class="section-header">
    <div class="section-title">Contratos</div>
    <button class="btn-accent" onclick="navigate('crear-contrato')">Nuevo Contrato</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar contrato…" style="max-width:240px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option></select>
      <select class="filter-select"><option>Todos los estados</option><option>Activo</option><option>Vencido</option><option>Liquidado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Cliente</th><th>Lote</th><th>Vendedor</th><th>Fecha</th><th>Monto Total</th><th>Plazo</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-contratos-body">
        <tr><td colspan="9">Cargando contratos...</td></tr>
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando contratos reales desde backend</span>
      <div style="display:flex;gap:4px">
        <button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button>
      </div>
    </div>
  </div>`;
}

function formatCurrency(value) {
  if (value == null || value === '') return '—';
  const normalized = Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(normalized)) return String(value);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(normalized);
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return isNaN(date) ? String(value) : date.toLocaleDateString('es-MX');
}

async function fetchDesarrollos() {
  try {
    const res = await fetch(`${API_URL}/desarrollos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const container = document.getElementById('cards-desarrollos-body');
    if (!container) return;
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<div class="alert-card" style="width:100%;text-align:center;">No hay desarrollos registrados.</div>';
      return;
    }
    container.innerHTML = data.map(d => `
      <div class="dev-card" onclick="navigate('detalle-desarrollo')">
        <div class="dev-card-thumb">🏡</div>
        <div class="dev-card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div class="dev-card-name">${d.Nombre ?? 'Sin nombre'}</div>
            <span class="chip chip-green">Activo</span>
          </div>
          <div class="dev-card-meta">${d.Ubicacion ?? 'Ubicación no disponible'}</div>
          <div class="dev-card-stats">
            <div class="dev-stat"><div class="dev-stat-num">ID ${d.IdDesarrollo ?? '—'}</div><div class="dev-stat-label">ID</div></div>
            <div class="dev-stat"><div class="dev-stat-num">${formatDate(d.Fecha_inicio)}</div><div class="dev-stat-label">Inicio</div></div>
            <div class="dev-stat"><div class="dev-stat-num">—</div><div class="dev-stat-label">Lotes</div></div>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    const container = document.getElementById('cards-desarrollos-body');
    if (container) container.innerHTML = `<div class="alert-card" style="width:100%;text-align:center;">Error: ${err.message}</div>`;
  }
}

async function fetchLotes() {
  try {
    const res = await fetch(`${API_URL}/lotes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-lotes-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay lotes registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(l => `
      <tr>
        <td style="font-weight:600">${l.IdLote ?? ''}</td>
        <td>${l.IdManzana != null ? `Mzn. ${l.IdManzana}` : 'N/A'}</td>
        <td>${l.Numero ?? ''}</td>
        <td>${l.Medidas ?? ''}</td>
        <td style="font-weight:600">${formatCurrency(l.Precio)}</td>
        <td><span class="chip ${l.Estado === 'Disponible' ? 'chip-green' : l.Estado === 'Vendido' ? 'chip-red' : 'chip-warn'}">${l.Estado ?? 'Desconocido'}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-lote')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-lotes-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7">Error: ${err.message}</td></tr>`;
  }
}

async function fetchClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-clientes-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay clientes registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td style="font-weight:600">${c.IdCliente ?? ''}</td>
        <td>${[c.Nombre, c.Apellidos].filter(Boolean).join(' ')}</td>
        <td>${c.Telefono ?? ''}</td>
        <td>${c.Ciudad ?? ''}</td>
        <td>${c.Estado ?? ''}</td>
        <td style="display:flex;gap:6px"><button class="btn-outline btn-sm" onclick="navigate('detalle-cliente')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-clientes-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7">Error: ${err.message}</td></tr>`;
  }
}

async function fetchContratos() {
  try {
    const res = await fetch(`${API_URL}/contratos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tbody = document.getElementById('tabla-contratos-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">No hay contratos registrados.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td style="font-weight:600">${c.IdContrato ?? ''}</td>
        <td>${c.Cliente ?? ''}</td>
        <td>${c.Lote != null ? `Lote ${c.Lote}` : ''}</td>
        <td>${c.Vendedor ?? ''}</td>
        <td>${formatDate(c.Fecha)}</td>
        <td style="font-weight:600">—</td>
        <td>—</td>
        <td><span class="chip chip-blue">${c.Estatus ?? 'Activo'}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-contrato')">Ver</button></td>
      </tr>`).join('');
  } catch (err) {
    const tbody = document.getElementById('tabla-contratos-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9">Error: ${err.message}</td></tr>`;
  }
}

async function guardarCliente() {
  const payload = {
    Nombre: document.getElementById('cliente-nombre')?.value?.trim() || '',
    Apellidos: document.getElementById('cliente-apellidos')?.value?.trim() || '',
    Direccion: document.getElementById('cliente-direccion')?.value?.trim() || '',
    Casa_Apartamento: document.getElementById('cliente-casa-apartamento')?.value?.trim() || '',
    Codigo_Postal: document.getElementById('cliente-cp')?.value?.trim() || '',
    Ciudad: document.getElementById('cliente-ciudad')?.value?.trim() || '',
    Estado: document.getElementById('cliente-estado')?.value?.trim() || '',
    Telefono: document.getElementById('cliente-telefono')?.value?.trim() || '',
    INE: document.getElementById('cliente-ine')?.value?.trim() || '',
    CURP: document.getElementById('cliente-curp')?.value?.trim() || '',
  };

  try {
    const res = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'No se pudo registrar el cliente');
    showToast('Cliente registrado correctamente', 'success');
    navigate('clientes');
  } catch (err) {
    showToast(err.message || 'No se pudo registrar el cliente', 'error');
  }
}

async function guardarLote() {
  const payload = {
    Numero: document.getElementById('lote-numero')?.value?.trim() || '',
    Medidas: document.getElementById('lote-medidas')?.value?.trim() || '',
    Precio: document.getElementById('lote-precio')?.value?.trim() || '',
    Estado: document.getElementById('lote-estado')?.value || 'Disponible',
    IdManzana: 1,
    Norte: document.getElementById('lote-norte')?.value?.trim() || '',
    Sur: document.getElementById('lote-sur')?.value?.trim() || '',
    Este: document.getElementById('lote-este')?.value?.trim() || '',
    Oeste: document.getElementById('lote-oeste')?.value?.trim() || ''
  };

  try {
    const res = await fetch(`${API_URL}/lotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'No se pudo registrar el lote');
    showToast('Lote registrado correctamente', 'success');
    navigate('lotes');
  } catch (err) {
    showToast(err.message || 'No se pudo registrar el lote', 'error');
  }
}

async function guardarContrato() {
  const payload = {
    Cliente: document.getElementById('contrato-cliente')?.value || '',
    Lote: document.getElementById('contrato-lote')?.value || '',
    Vendedor: document.getElementById('contrato-vendedor')?.value || '',
    Fecha: document.getElementById('contrato-fecha')?.value || '',
    TipoPago: document.getElementById('contrato-tipopago')?.value || '',
    MontoFijo: document.getElementById('contrato-montofijo')?.value || '',
    Notas: document.getElementById('contrato-notas')?.value?.trim() || ''
  };

  try {
    const res = await fetch(`${API_URL}/contratos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'No se pudo registrar el contrato');
    showToast('Contrato registrado correctamente', 'success');
    navigate('contratos');
  } catch (err) {
    showToast(err.message || 'No se pudo registrar el contrato', 'error');
  }
}

function viewCrearContrato(){
  return `
  <div style="max-width:760px">
    <div class="section-header">
      <div class="section-title">Nuevo Contrato</div>
      <button class="btn-outline btn-sm" onclick="navigate('contratos')">Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Cliente *</label>
          <select id="contrato-cliente"><option>Seleccionar…</option><option>Juan Hernández</option><option>María García</option></select></div>
        <div class="form-group"><label>Lote *</label>
          <select id="contrato-lote"><option>Seleccionar…</option><option>A-01 · Las Palmas · $380K</option><option>D-01 · Bosques · $510K</option></select></div>
        <div class="form-group"><label>Vendedor *</label>
          <select id="contrato-vendedor"><option>Seleccionar…</option><option>M. Rodríguez</option><option>L. García</option></select></div>
        <div class="form-group"><label>Fecha de Emisión *</label><input id="contrato-fecha" type="date"></div>
        <div class="form-group"><label>Tipo de Pago *</label>
          <select id="contrato-tipopago"><option>Contado</option><option>Parcial</option><option>Financiamiento</option></select></div>
        <div class="form-group"><label>Monto Fijo *</label><input id="contrato-montofijo" type="number" placeholder="0.00"></div>
        <div class="form-group full"><label>Notas / Observaciones</label>
          <textarea id="contrato-notas" rows="3" placeholder="Observaciones adicionales…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('contratos')">Cancelar</button>
        <button class="btn-accent" onclick="guardarContrato()">Crear Contrato</button>
      </div>
    </div>
  </div>`;
}

function viewDetalleContrato(){
  const pagos=[
    {mes:'Ene 2025',monto:'$10,556',fecha:'12/Jan',st:'paid'},
    {mes:'Feb 2025',monto:'$10,556',fecha:'12/Feb',st:'paid'},
    {mes:'Mar 2025',monto:'$10,556',fecha:'12/Mar',st:'paid'},
    {mes:'Abr 2025',monto:'$10,556',fecha:'12/Apr',st:'late'},
    {mes:'May 2025',monto:'$10,556',fecha:'12/May',st:'pending'},
    {mes:'Jun 2025',monto:'$10,556',fecha:'12/Jun',st:'pending'},
  ];
  return `
  <div class="section-header">
    <div>
      <div class="section-title">Contrato CON-0051</div>
      <p style="font-size:12px;color:var(--c-muted)">Juan Hernández · Lote A-01 · Las Palmas Residencial</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="navigate('contratos')">← Regresar</button>
      <button class="btn-outline btn-sm">Imprimir</button>
      <button class="btn-accent btn-sm">Editar</button>
    </div>
  </div>
  <div class="two-col" style="align-items:start">
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Datos del Contrato</div>
      ${detailRow('ID Contrato','CON-0051')}
      ${detailRow('Cliente','Juan Hernández López')}
      ${detailRow('Lote','A-01 – Las Palmas Residencial')}
      ${detailRow('Vendedor','M. Rodríguez')}
      ${detailRow('Fecha de Emisión','12 de Enero, 2025')}
      ${detailRow('Monto Total','$380,000 MXN')}
      ${detailRow('Plazo','36 meses')}
      ${detailRow('Pago mensual','$10,556 MXN')}
      ${detailRow('Estatus','<span class="chip chip-green">Activo</span>')}
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Línea de Tiempo de Pagos</div>
      <div class="timeline">
        ${pagos.map((p,i)=>`
        <div class="tl-item">
          ${i<pagos.length-1?'<div class="tl-line"></div>':''}
          <div class="tl-dot ${p.st}"></div>
          <div class="tl-content">
            <div class="tl-label">${p.mes} · ${p.monto}</div>
            <div class="tl-meta">Vence: ${p.fecha} ·
              <span class="${p.st==='paid'?'trend-up':p.st==='late'?'trend-down':''}">
                ${p.st==='paid'?'Pagado':p.st==='late'?'Atrasado':'Pendiente'}
              </span>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewFlujo(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Ingresos del Mes</div><div class="kpi-value">$2.4M</div><div class="kpi-trend trend-up">▲ 18% vs mes anterior</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Egresos del Mes</div><div class="kpi-value">$810K</div><div class="kpi-trend trend-down">▲ 5% vs mes anterior</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Flujo Neto</div><div class="kpi-value">$1.59M</div><div class="kpi-trend trend-up">Balance positivo</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">$284K</div><div class="kpi-trend trend-down">17 contratos</div></div>
  </div>
  <div class="section-header" style="margin-top:8px">
    <div class="section-title">Movimientos de Flujo</div>
    <button class="btn-accent" onclick="navigate('registrar-pago')">Registrar Movimiento</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar movimiento…" style="max-width:220px">
      <select class="filter-select"><option>Todos los tipos</option><option>Ingreso</option><option>Egreso</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Pagado</option><option>Atrasado</option></select>
      <input type="date" class="filter-select">
    </div>
    <table>
      <thead><tr><th>ID</th><th>Contrato</th><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>Monto</th><th>Estatus</th><th></th></tr></thead>
      <tbody>
        ${[
          {id:'F-001',c:'CON-0051',f:'12/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$10,556',st:'Pagado'},
          {id:'F-002',c:'CON-0052',f:'18/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$8,194',st:'Pagado'},
          {id:'F-003',c:'CON-0053',f:'05/Jun/2025',con:'Mensualidad Junio',t:'Ingreso',m:'$14,167',st:'Atrasado'},
          {id:'F-004',c:'GASTO',   f:'10/Jun/2025',con:'Mantenimiento Las Palmas',t:'Egreso', m:'$25,000',st:'Pagado'},
          {id:'F-005',c:'CON-0054',f:'22/Jun/2025',con:'Enganche',t:'Ingreso',m:'$42,000',st:'Pagado'},
        ].map(f=>`<tr>
          <td style="font-weight:600">${f.id}</td><td>${f.c}</td><td>${f.f}</td><td>${f.con}</td>
          <td><span class="chip ${f.t==='Ingreso'?'chip-green':'chip-red'}">${f.t}</span></td>
          <td style="font-weight:600">${f.m}</td>
          <td><span class="chip ${f.st==='Pagado'?'chip-green':'chip-red'}">${f.st}</span></td>
          <td><button class="btn-outline btn-sm" onclick="navigate('detalle-flujo')">Ver</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando 1–5 de 312 movimientos</span>
      <div style="display:flex;gap:4px"><button class="pag-btn active">1</button><button class="pag-btn">2</button><button class="pag-btn">…</button></div>
    </div>
  </div>`;
}

function viewDetalleFlujo(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Movimiento F-001</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="chart-title" style="margin-bottom:12px">Detalle del Movimiento</div>
      ${detailRow('ID Flujo','F-001')}
      ${detailRow('Contrato','CON-0051 · Juan Hernández')}
      ${detailRow('Fecha de Pago','12 de Junio, 2025')}
      ${detailRow('Monto Recibido','$10,556.00 MXN')}
      ${detailRow('Tipo','<span class="chip chip-green">Ingreso</span>')}
      ${detailRow('Concepto','Mensualidad Junio 2025')}
      ${detailRow('Estatus','<span class="chip chip-green">Pagado</span>')}
      <div class="form-actions">
        <button class="btn-outline">Editar</button>
        <button class="btn-danger btn-sm" onclick="showModal('confirm-delete')">Eliminar</button>
      </div>
    </div>
  </div>`;
}

function viewAnalisis(){
  return `
  <div class="section-header"><div class="section-title">Análisis Financiero</div></div>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Ingresos Anuales</div><div class="kpi-value">$18.4M</div><div class="kpi-trend trend-up">▲ 23% YoY</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Egresos Anuales</div><div class="kpi-value">$7.2M</div><div class="kpi-trend trend-down">▲ 8% YoY</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Margen Neto</div><div class="kpi-value">60.8%</div><div class="kpi-trend trend-up">▲ 4.2 pp YoY</div></div>
    <div class="kpi-card" style="border-left-color:#9C27B0"><div class="kpi-label">Cartera Total</div><div class="kpi-value">$54.2M</div><div class="kpi-trend" style="color:var(--c-muted)">142 contratos</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Ingresos por Desarrollo (anual)</div>
      <div class="chart-area">
        ${barChart([
          {label:'Las Palmas',a:720,b:0},{label:'Vista Lago',a:430,b:0},
          {label:'El Encino',a:380,b:0},{label:'Bosques',a:290,b:0},{label:'Jardines',a:180,b:0}
        ],['var(--c-accent)','var(--c-accent)'])}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Tendencia Mensual de Ventas</div>
      <div class="chart-area">
        ${lineChart([42,38,55,61,48,72,58,80,66,74,85,92])}
      </div>
    </div>
  </div>`;
}

function viewUsuarios(){
  return `
  <div class="section-header">
    <div class="section-title">Usuarios del Sistema</div>
    <button class="btn-accent" onclick="navigate('crear-usuario')">Nuevo Usuario</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar usuario…" style="max-width:240px">
      <select class="filter-select"><option>Todos los roles</option><option>Directivo</option><option>Vendedor</option><option>Asistente</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Activo</option><option>Inactivo</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estatus</th><th>Acciones</th></tr></thead>
      <tbody>
        ${[
          {id:'U-001',n:'Dir. González',e:'gonzalez@sofi.mx',rol:'Directivo',st:'Activo'},
          {id:'U-002',n:'M. Rodríguez',e:'rodriguez@sofi.mx',rol:'Vendedor',st:'Activo'},
          {id:'U-003',n:'L. García',e:'garcia@sofi.mx',rol:'Vendedor',st:'Activo'},
          {id:'U-004',n:'A. Pérez',e:'aperez@sofi.mx',rol:'Asistente',st:'Activo'},
          {id:'U-005',n:'R. Sánchez',e:'rsanchez@sofi.mx',rol:'Vendedor',st:'Inactivo'},
        ].map(u=>`<tr>
          <td style="font-weight:600">${u.id}</td><td>${u.n}</td><td style="font-size:12px">${u.e}</td>
          <td><span class="chip ${u.rol==='Directivo'?'chip-blue':u.rol==='Vendedor'?'chip-green':'chip-warn'}">${u.rol}</span></td>
          <td><span class="chip ${u.st==='Activo'?'chip-green':'chip-gray'}">${u.st}</span></td>
          <td style="display:flex;gap:6px">
            <button class="btn-outline btn-sm">Editar</button>
            <button class="btn-outline btn-sm" onclick="showModal('confirm-delete')">Eliminar</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination">
      <span>Mostrando 1–5 de 12 usuarios</span>
      <div style="display:flex;gap:4px"><button class="pag-btn active">1</button><button class="pag-btn">2</button></div>
    </div>
  </div>`;
}

function viewCrearUsuario(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Nuevo Usuario</div>
      <button class="btn-outline btn-sm" onclick="navigate('usuarios')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre Completo *</label><input placeholder="Nombre completo"></div>
        <div class="form-group"><label>Correo Electrónico *</label><input type="email" placeholder="correo@sofi.mx"></div>
        <div class="form-group"><label>Contraseña *</label><input type="password" placeholder="Mín. 8 caracteres"></div>
        <div class="form-group"><label>Confirmar Contraseña *</label><input type="password" placeholder="Repetir contraseña"></div>
        <div class="form-group"><label>Rol *</label>
          <select><option>Seleccionar…</option><option>Directivo</option><option>Vendedor</option><option>Asistente</option></select></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Activo</option><option>Inactivo</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('usuarios')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Usuario creado','success');navigate('usuarios')">Crear Usuario</button>
      </div>
    </div>
  </div>`;
}

function viewRoles(){
  return `
  <div class="section-header">
    <div class="section-title">Roles del Sistema</div>
    <button class="btn-accent" onclick="navigate('crear-rol')">Nuevo Rol</button>
  </div>
  <div class="three-col">
    ${[
      {id:'R-001',n:'Directivo',d:'Acceso total al sistema. Dashboard avanzado, reportes, usuarios y configuración.',u:2,color:'chip-blue'},
      {id:'R-002',n:'Vendedor',d:'Gestión de clientes, lotes disponibles, y generación de contratos propios.',u:8,color:'chip-green'},
      {id:'R-003',n:'Asistente',d:'Apoyo administrativo: flujo de efectivo, actualización de clientes y testigos.',u:3,color:'chip-warn'},
    ].map(r=>`
    <div class="form-card" style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="section-title">${r.n}</div>
        <span class="chip ${r.color}">${r.id}</span>
      </div>
      <p style="font-size:13px;color:var(--c-muted);line-height:1.5">${r.d}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--c-muted)">${r.u} usuarios asignados</span>
        <button class="btn-outline btn-sm">Editar</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function viewCrearRol(){
  return `
  <div style="max-width:580px">
    <div class="section-header">
      <div class="section-title">Nuevo Rol</div>
      <button class="btn-outline btn-sm" onclick="navigate('roles')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group full"><label>Nombre del Rol *</label><input placeholder="Ej. Supervisor"></div>
        <div class="form-group full"><label>Descripción</label>
          <textarea rows="3" placeholder="Describe los permisos de este rol…" style="resize:vertical"></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('roles')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Rol creado','success');navigate('roles')">Guardar Rol</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   VIEWS – VENDEDOR
   ============================================================ */