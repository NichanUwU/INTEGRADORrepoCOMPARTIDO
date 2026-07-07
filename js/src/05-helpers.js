/* ============================================================
   SOFI · UTILIDADES COMPARTIDAS
   Filas de detalle, gráficas, modales, toasts y el cálculo
   del simulador de financiamiento.
   ============================================================ */

/* ---- FILA DE DETALLE DE SOLO LECTURA ---- */
function detailRow(label, value) {
  return `<div class="detail-row">
    <span class="dr-label">${label}</span>
    <span class="dr-value">${value}</span>
  </div>`;
}

/* ---- GRÁFICA DE BARRAS (ingresos vs egresos, por desarrollo, etc.) ---- */
function barChart(data, colors) {
  const max = Math.max(...data.map(d => Math.max(d.a, d.b || 0)));
  const c1 = (colors && colors[0]) || 'var(--c-accent)';
  const c2 = (colors && colors[1]) || 'var(--c-error)';
  return data.map(d => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative">
      <div style="display:flex;gap:2px;align-items:flex-end;width:100%">
        <div class="bar" style="background:${c1};height:${Math.round(d.a / max * 160)}px;flex:1" title="${d.label}: ${d.a}"></div>
        ${d.b ? `<div class="bar" style="background:${c2};height:${Math.round(d.b / max * 160)}px;flex:1" title="${d.label}: ${d.b}"></div>` : ''}
      </div>
      <div style="font-size:10px;color:var(--c-muted);margin-top:4px">${d.label}</div>
    </div>`).join('');
}

/* ---- GRÁFICA DE LÍNEA (tendencias mensuales) ---- */
function lineChart(values) {
  const max = Math.max(...values), min = Math.min(...values);
  const w = 600, h = 150, pad = 20;
  const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const ptFor = (v, i) => {
    const x = pad + (i * (w - 2 * pad) / (values.length - 1));
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    return { x, y };
  };
  const pts = values.map((v, i) => { const p = ptFor(v, i); return `${p.x},${p.y}`; }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px" role="img" aria-label="Tendencia mensual">
    <polyline fill="none" stroke="var(--c-accent)" stroke-width="2.5" points="${pts}"/>
    ${values.map((v, i) => {
      const p = ptFor(v, i);
      return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--c-accent)"/>
              <text x="${p.x}" y="${h}" text-anchor="middle" font-size="10" fill="#6B8FAF">${months[i] || ''}</text>`;
    }).join('')}
  </svg>`;
}

/* ---- MODAL ---- */
function showModal(id) {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  if (id === 'alertas-modal') {
    overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="Alertas del sistema">
      <div class="modal-title">🔔 Alertas del Sistema</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="alert-card error"><div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · J. Hernández</strong><span>$10,556 – vencido 12/Jun</span></div></div>
        <div class="alert-card"><div class="alert-icon">⚠</div>
          <div class="alert-text"><strong>Contrato próximo a vencer</strong><span>CON-0241 – vence en 5 días</span></div></div>
        <div class="alert-card error"><div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · R. Domínguez</strong><span>$14,167 – vencido 05/Jun</span></div></div>
      </div>
      <div class="modal-actions"><button class="btn-outline" onclick="closeModal()">Cerrar</button></div>
    </div>`;
  } else if (id === 'confirm-delete') {
    overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
      <div class="modal-title">⚠ Confirmar Eliminación</div>
      <div class="modal-body">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</div>
      <div class="modal-actions">
        <button class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn-danger" onclick="showToast('Registro eliminado','success');closeModal()">🗑 Eliminar</button>
      </div>
    </div>`;
  }
  root.appendChild(overlay);

  // Cierra el modal con tecla Escape
  document.addEventListener('keydown', escCloseModal);
}
function escCloseModal(e) {
  if (e.key === 'Escape') closeModal();
}
function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  document.removeEventListener('keydown', escCloseModal);
}

/* ---- TOAST ---- */
function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = `toast toast-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
  t.setAttribute('role', 'status');
  t.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : '') + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ---- CÁLCULO DEL SIMULADOR DE FINANCIAMIENTO ---- */
function calcSim() {
  const elPrecio = document.getElementById('sim-precio');
  const elEng = document.getElementById('sim-eng');
  const elPlazo = document.getElementById('sim-plazo');
  const elTasa = document.getElementById('sim-tasa');
  const p = parseFloat(elPrecio ? elPrecio.value : null) || 380000;
  const e = parseFloat(elEng ? elEng.value : null) / 100 || 0.2;
  const n = parseInt(elPlazo ? elPlazo.value : null) || 36;
  const r = parseFloat(elTasa ? elTasa.value : null) / 100 / 12 || 0.01;
  const eng = p * e;
  const fin = p - eng;
  const mensual = r ? fin * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : fin / n;
  const total = mensual * n + eng;
  const res = document.getElementById('sim-result');
  if (res) res.innerHTML = `
    <div class="sim-item"><div class="sim-label">Monto a Financiar</div><div class="sim-val">$${Math.round(fin).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Enganche</div><div class="sim-val">$${Math.round(eng).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Mensualidad</div><div class="sim-val">$${Math.round(mensual).toLocaleString()}</div></div>
    <div class="sim-item"><div class="sim-label">Total a Pagar</div><div class="sim-val">$${Math.round(total).toLocaleString()}</div></div>`;
}
