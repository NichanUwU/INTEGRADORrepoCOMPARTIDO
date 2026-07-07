function viewAsistenteDashboard(){
  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Pagos a Registrar Hoy</div><div class="kpi-value">8</div><div class="kpi-trend" style="color:var(--c-muted)">Pendientes de captura</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-warn)"><div class="kpi-label">Pagos Próximos (7 días)</div><div class="kpi-value">23</div><div class="kpi-trend" style="color:var(--c-muted)">Esta semana</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-error)"><div class="kpi-label">Pagos Atrasados</div><div class="kpi-value">17</div><div class="kpi-trend trend-down">Requieren seguimiento</div></div>
    <div class="kpi-card" style="border-left-color:var(--c-primary)"><div class="kpi-label">Clientes por Actualizar</div><div class="kpi-value">5</div><div class="kpi-trend trend-down">Documentos faltantes</div></div>
  </div>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Actividades del Día</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {t:'09:00','d':'Registrar pago CON-0051 · J. Hernández · $10,556',done:true},
          {t:'10:30','d':'Actualizar CURP de A. Torres',done:true},
          {t:'11:00','d':'Registrar pago CON-0052 · M. García · $8,194',done:false},
          {t:'14:00','d':'Verificar documentos R. Domínguez',done:false},
          {t:'15:30','d':'Actualizar testigos · L. Sánchez',done:false},
        ].map(a=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:6px;
          background:${a.done?'var(--c-light-bg)':'var(--c-white)'};border:1px solid var(--c-border)">
          <span style="font-size:11px;color:var(--c-muted);width:38px;flex-shrink:0">${a.t}</span>
          <span style="font-size:13px;${a.done?'text-decoration:line-through;color:var(--c-muted)':''}">${a.d}</span>
          ${a.done?'<span style="margin-left:auto;color:var(--c-accent)">✓</span>':''}
        </div>`).join('')}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Pagos Atrasados – Acción Requerida</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {n:'J. Hernández',c:'CON-0051',m:'$10,556',d:'12/Jun'},
          {n:'R. Domínguez',c:'CON-0053',m:'$14,167',d:'05/Jun'},
          {n:'L. Sánchez',  c:'CON-0055',m:'$8,500', d:'01/Jun'},
        ].map(p=>`
        <div class="alert-card error">
          <div class="alert-icon">❗</div>
          <div class="alert-text">
            <strong>${p.n} · ${p.c}</strong>
            <span>${p.m} – vencido ${p.d}</span>
          </div>
          <button class="btn-accent btn-sm" onclick="navigate('registrar-pago')">Registrar</button>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewAsistenteFlujo(){
  return `
  <div class="section-header">
    <div class="section-title">Flujo de Efectivo</div>
    <button class="btn-accent" onclick="navigate('registrar-pago')">＋ Registrar Pago</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar contrato, cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Ingreso</option><option>Egreso</option></select>
      <select class="filter-select"><option>Todos los estatus</option><option>Pagado</option><option>Atrasado</option></select>
    </div>
    <table>
      <thead><tr><th>Contrato</th><th>Cliente</th><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Tipo</th><th>Estatus</th><th></th></tr></thead>
    <tbody>
      ${[
        {c:'CON-0051',cli:'J. Hernández',f:'12/Jun',con:'Mensualidad Jun',m:'$10,556',t:'Ingreso',st:'Pagado'},
        {c:'CON-0052',cli:'M. García',   f:'18/Jun',con:'Mensualidad Jun',m:'$8,194', t:'Ingreso',st:'Pagado'},
        {c:'CON-0053',cli:'R. Domínguez',f:'05/Jun',con:'Mensualidad Jun',m:'$14,167',t:'Ingreso',st:'Atrasado'},
      ].map(f=>`<tr>
        <td style="font-weight:600">${f.c}</td><td>${f.cli}</td><td>${f.f}</td><td>${f.con}</td>
        <td style="font-weight:600">${f.m}</td>
        <td><span class="chip chip-green">${f.t}</span></td>
        <td><span class="chip ${f.st==='Pagado'?'chip-green':'chip-red'}">${f.st}</span></td>
        <td style="display:flex;gap:4px">
          <button class="btn-outline btn-sm" onclick="navigate('detalle-pago')">Ver</button>
          <button class="btn-accent btn-sm" onclick="navigate('registrar-pago')">✏</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 312</span></div>
  </div>`;
}

function viewRegistrarPago(){
  return `
  <div style="max-width:620px">
    <div class="section-header">
      <div class="section-title">Registrar Pago</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Contrato *</label>
          <select><option>Seleccionar…</option><option>CON-0051 · J. Hernández</option><option>CON-0052 · M. García</option></select></div>
        <div class="form-group"><label>Fecha de Pago *</label><input type="date"></div>
        <div class="form-group"><label>Monto Recibido *</label><input type="number" placeholder="0.00"></div>
        <div class="form-group"><label>Tipo *</label>
          <select><option>Ingreso</option><option>Egreso</option></select></div>
        <div class="form-group full"><label>Concepto *</label><input placeholder="Ej. Mensualidad Junio 2025"></div>
        <div class="form-group"><label>Estatus</label>
          <select><option>Pagado</option><option>Atrasado</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('flujo')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Pago registrado exitosamente','success');navigate('flujo')">Guardar Pago</button>
      </div>
    </div>
  </div>`;
}

function viewDetallePago(){
  return `
  <div style="max-width:580px">
    <div class="section-header">
      <div class="section-title">Detalle de Pago</div>
      <button class="btn-outline btn-sm" onclick="navigate('flujo')">← Regresar</button>
    </div>
    <div class="form-card">
      ${detailRow('Contrato','CON-0051')}
      ${detailRow('Cliente','Juan Hernández López')}
      ${detailRow('Fecha de Pago','12 de Junio, 2025')}
      ${detailRow('Monto','$10,556.00 MXN')}
      ${detailRow('Tipo','<span class="chip chip-green">Ingreso</span>')}
      ${detailRow('Concepto','Mensualidad Junio 2025')}
      ${detailRow('Estatus','<span class="chip chip-green">Pagado</span>')}
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('registrar-pago')">✏ Editar</button>
      </div>
    </div>
  </div>`;
}

function viewAsistenteClientes(){
  return `
  <div class="section-header">
    <div class="section-title">Clientes – Actualización</div>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar cliente…" style="max-width:240px">
      <select class="filter-select"><option>Todos</option><option>Documentos incompletos</option><option>Estado civil desactualizado</option></select>
    </div>
    <table>
      <thead><tr><th>Nombre</th><th>RFC</th><th>Estado Civil</th><th>Documentos</th><th>Última Actualización</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {n:'Juan Hernández',rfc:'HELJ801234AB1',ec:'Casado',docs:'Completo','upd':'10/Jun/2025'},
        {n:'Ana Torres',rfc:'TOAA910203CD5',ec:'Soltera',docs:'Falta CURP','upd':'01/May/2025'},
        {n:'L. Sánchez',rfc:'SAML940710IJ5',ec:'Soltero',docs:'Completo','upd':'20/May/2025'},
      ].map(c=>`<tr>
        <td style="font-weight:600">${c.n}</td>
        <td style="font-size:12px;font-family:monospace">${c.rfc}</td>
        <td>${c.ec}</td>
        <td><span class="chip ${c.docs==='Completo'?'chip-green':'chip-warn'}">${c.docs}</span></td>
        <td style="font-size:12px;color:var(--c-muted)">${c.upd}</td>
        <td style="display:flex;gap:6px">
          <button class="btn-outline btn-sm">✏ Editar</button>
          <button class="btn-outline btn-sm">📁 Documentos</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 248</span></div>
  </div>`;
}

function viewTestigos(){
  return `
  <div class="section-header">
    <div class="section-title">Testigos</div>
    <button class="btn-accent" onclick="navigate('crear-testigo')">＋ Nuevo Testigo</button>
  </div>
  <div class="table-wrap">
    <div class="table-toolbar">
      <input class="search-input" placeholder="Buscar testigo o cliente…" style="max-width:240px">
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nombre Testigo</th><th>Cliente Asociado</th><th>Relación</th><th>Domicilio</th><th>Acciones</th></tr></thead>
    <tbody>
      ${[
        {id:'T-001',n:'Laura Hernández',cli:'J. Hernández',rel:'Cónyuge',dom:'Av. Tecnológico 120, Qro.'},
        {id:'T-002',n:'Carlos Medina',  cli:'J. Hernández',rel:'Amigo',  dom:'Blvd. Bernardo 45, Qro.'},
        {id:'T-003',n:'Sandra López',   cli:'M. García',   rel:'Hermana',dom:'Av. López Mateos 300, GDL'},
      ].map(t=>`<tr>
        <td style="font-weight:600">${t.id}</td><td>${t.n}</td>
        <td><span class="chip chip-blue">${t.cli}</span></td>
        <td>${t.rel}</td>
        <td style="font-size:12px;color:var(--c-muted)">${t.dom}</td>
        <td style="display:flex;gap:6px">
          <button class="btn-outline btn-sm">Ver</button>
          <button class="btn-outline btn-sm">✏</button>
        </td>
      </tr>`).join('')}
    </tbody>
    </table>
    <div class="table-pagination"><span>Mostrando 1–3 de 47</span></div>
  </div>`;
}

function viewCrearTestigo(){
  return `
  <div style="max-width:620px">
    <div class="section-header">
      <div class="section-title">Nuevo Testigo</div>
      <button class="btn-outline btn-sm" onclick="navigate('testigos')">← Regresar</button>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <div class="form-group"><label>Cliente Asociado *</label>
          <select><option>Seleccionar…</option><option>Juan Hernández</option><option>María García</option></select></div>
        <div class="form-group"><label>Nombre Completo *</label><input placeholder="Nombre del testigo"></div>
        <div class="form-group full"><label>Domicilio *</label><input placeholder="Calle, Número, Colonia, CP, Ciudad, Estado"></div>
        <div class="form-group"><label>Relación con el Cliente *</label>
          <select><option>Seleccionar…</option><option>Cónyuge</option><option>Familiar</option><option>Amigo</option><option>Otro</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="navigate('testigos')">Cancelar</button>
        <button class="btn-accent" onclick="showToast('Testigo registrado','success');navigate('testigos')">Guardar Testigo</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   HELPERS
   ============================================================ */