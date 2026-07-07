function viewVendedorDashboard(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Mis Ventas del Mes</div><div class="kpi-value">$580K</div><div class="kpi-trend trend-up">▲ 3 contratos</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)"><div class="kpi-label">Clientes Asignados</div><div class="kpi-value">34</div><div class="kpi-trend" style="color:var(--c-muted)">+5 este mes</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">4</div><div class="kpi-trend trend-down">de mis clientes</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-accent)"><div class="kpi-label">Meta del Mes</div><div class="kpi-value">74%</div><div class="kpi-trend trend-up">$580K / $780K</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Mis Contratos Activos</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {cli:'J. Hernández',lot:'A-01',monto:'$380K',prox:'12/Jul'},
          {cli:'M. García',   lot:'B-01',monto:'$295K',prox:'18/Jul'},
          {cli:'A. Pérez',    lot:'A-02',monto:'$420K',prox:'22/Jul'},
        ].map(c=>`
        <div class="alert-card success" style="cursor:pointer" onclick="navigate('detalle-contrato')">
          <div class="alert-icon">📄</div>
          <div class="alert-text">
            <strong>${c.cli} · Lote ${c.lot}</strong>
            <span>${c.monto} · Próximo pago: ${c.prox}</span>
          </div>
        </div>`).join('')}
        <button class="btn-outline btn-sm" onclick="navigate('contratos')">Ver todos mis contratos →</button>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Alertas de mis Clientes</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {t:'Pago atrasado',d:'R. Domínguez · $14,167 · vencido 05/Jun',type:'error'},
          {t:'Documento faltante',d:'L. Sánchez · Falta CURP actualizado',type:'warn'},
          {t:'Contrato próximo',d:'M. García · Finaliza en 2 meses',type:'warn'},
        ].map(a=>`
        <div class="alert-card ${a.type}">
          <div class="alert-icon">${a.type==='error'?'❗':'⚠'}</div>
          <div class="alert-text"><strong>${a.t}</strong><span>${a.d}</span></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewVendedorClientes(){
  return `
  <div class="section-header">
    <div class="section-title">Mis Clientes</div>
    <button class="btn-accent" onclick="navigate('crear-cliente')">＋ Nuevo Cliente</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Con contrato</option><option>Sin contrato</option></select>
    </div>
    <table>
      <thead><tr><th>Nombre</th><th>RFC</th><th>Teléfono</th><th>Contratos</th><th>Testigos</th><th>Acciones</th></tr></thead>
      <tbody>
        ${[
          {n:'Juan Hernández',rfc:'HELJ801234AB1',tel:'442-100-2000',ctrs:2,test:1},
          {n:'María García',  rfc:'GATM920315CD2',tel:'33-9000-1234', ctrs:1,test:2},
          {n:'Roberto Domínguez',rfc:'DORR780501EF3',tel:'55-4000-5678',ctrs:1,test:0},
        ].map(c=>`<tr>
          <td style="font-weight:600">${c.n}</td>
          <td style="font-size:12px;font-family:monospace">${c.rfc}</td>
          <td>${c.tel}</td>
          <td><span class="chip chip-blue">${c.ctrs}</span></td>
          <td><span class="chip ${c.test?'chip-green':'chip-red'}">${c.test} registrado${c.test!==1?'s':''}</span></td>
          <td style="display:flex;gap:6px">
            <button class="btn-outline btn-sm" onclick="navigate('detalle-cliente')">Ver</button>
            <button class="btn-accent btn-sm" onclick="navigate('crear-contrato')">Contrato</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 34</span></div>
  </div>`;
}

function viewCrearClienteVend(){return viewCrearCliente();}

function viewVendedorLotes(){
  return `
  <div class="section-header">
    <div class="section-title">Lotes Disponibles</div>
    <div style="display:flex;gap:8px">
      <select class="filter-select"><option>Todos los Desarrollos</option><option>Las Palmas</option><option>Vista del Lago</option></select>
      <button class="btn-outline btn-sm" onclick="navigate('simulador')">💲 Simulador</button>
    </div>
  </div>
  ${['Las Palmas Residencial','Vista del Lago'].map(dev=>`
  <div class="chart-card" style="margin-bottom:16px">
    <div class="chart-title">${dev}</div>
    <p style="font-size:12px;color:var(--c-muted);margin-bottom:10px">
      <span style="color:var(--c-accent)">■</span> Disponible &nbsp;<span style="color:var(--c-error)">■</span> Vendido &nbsp;<span style="color:var(--c-warn)">■</span> Reservado
    </p>
    <div class="lot-grid">
      ${Array.from({length:20},(_,i)=>{
        const s=i<12?'sold':i<14?'reserved':'available';
        return `<div class="lot-cell ${s}" onclick="navigate('detalle-lote')">L-${(i+1).toString().padStart(2,'0')}</div>`;
      }).join('')}
    </div>
  </div>`).join('')}`;
}

function viewSimulador(){
  return `
  <div style="max-width:600px">
    <div class="section-header">
      <div class="section-title">Simulador de Financiamiento</div>
      <button class="btn-outline btn-sm" onclick="navigate('lotes')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Precio del Lote</label>
          <input type="number" id="sim-precio" value="380000" oninput="calcSim()"></div>
        <div class="form-group"><label>Enganche (%)</label>
          <input type="number" id="sim-eng" value="20" min="10" max="50" oninput="calcSim()"></div>
        <div class="form-group"><label>Plazo (meses)</label>
          <input type="number" id="sim-plazo" value="36" min="12" max="120" oninput="calcSim()"></div>
        <div class="form-group"><label>Tasa de Interés Anual (%)</label>
          <input type="number" id="sim-tasa" value="12" min="0" step="0.5" oninput="calcSim()"></div>
      </div>
      <div class="sim-result" id="sim-result">
        <div class="sim-item"><div class="sim-label">Monto a Financiar</div><div class="sim-val">$304,000</div></div>
        <div class="sim-item"><div class="sim-label">Enganche</div><div class="sim-val">$76,000</div></div>
        <div class="sim-item"><div class="sim-label">Mensualidad</div><div class="sim-val">$10,084</div></div>
        <div class="sim-item"><div class="sim-label">Total a Pagar</div><div class="sim-val">$439,024</div></div>
      </div>
      <div class="form-actions">
        <button class="btn-accent" onclick="navigate('crear-contrato')">📄 Generar Contrato con estos datos</button>
      </div>
    </div>
  </div>`;
}

function viewVendedorContratos(){
  return `
  <div class="section-header">
    <div class="section-title">Mis Contratos</div>
    <button class="btn-accent" onclick="navigate('crear-contrato')">＋ Nuevo Contrato</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar…" style="max-width:220px">
      <select class="filter-select"><option>Todos</option><option>Activo</option><option>Atrasado</option><option>Liquidado</option></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Cliente</th><th>Lote</th><th>Fecha</th><th>Monto</th><th>Plazo</th><th>Estatus</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {id:'CON-0051',cli:'J. Hernández',lote:'A-01',f:'12/Jan',m:'$380K',p:'36m',st:'Activo'},
        {id:'CON-0052',cli:'M. García',lote:'B-01',f:'18/Feb',m:'$295K',p:'24m',st:'Activo'},
        {id:'CON-0053',cli:'R. Domínguez',lote:'C-01',f:'05/Mar',m:'$680K',p:'48m',st:'Atrasado'},
      ].map(c=>`<tr>
        <td style="font-weight:600">${c.id}</td><td>${c.cli}</td><td>${c.lote}</td>
        <td>${c.f}</td><td style="font-weight:600">${c.m}</td><td>${c.p}</td>
        <td><span class="chip ${c.st==='Activo'?'chip-green':'chip-red'}">${c.st}</span></td>
        <td><button class="btn-outline btn-sm" onclick="navigate('detalle-contrato')">Ver</button></td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 18</span></div>
  </div>`;
}

function viewCrearContratoVend(){return viewCrearContrato();}

/* ============================================================
   VIEWS – ASISTENTE
   ============================================================ */