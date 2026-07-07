/* ============================================================
   SOFI · VISTA: SISTEMA DE DISEÑO
   Documentación viva de los tokens y componentes de la marca.
   Accesible desde cualquier rol vía navigate('design-system').
   ============================================================ */
function viewDesignSystem() {
  const colors = [
    { name: 'Primary',  code: '#0F3B5C', css: '--c-primary' },
    { name: 'Accent',   code: '#50A746', css: '--c-accent' },
    { name: 'Light BG', code: '#EEF5E6', css: '--c-light-bg' },
    { name: 'Muted',    code: '#6B8FAF', css: '--c-muted' },
    { name: 'Error',    code: '#D94040', css: '--c-error' },
    { name: 'Warning',  code: '#E09B30', css: '--c-warn' },
    { name: 'Border',   code: '#D6E4F0', css: '--c-border' },
    { name: 'Surface',  code: '#F5F8FC', css: '--c-surface' },
  ];

  return `
  <div style="max-width:980px">
    <div style="margin-bottom:32px">
      <div class="login-logo" style="font-size:30px">SOFI<span class="s2">.</span></div>
      <p style="font-size:13px;color:var(--c-muted);margin-top:4px">
        Software Operativo para Fincas e Inmuebles — Tokens de diseño y componentes reutilizables.
      </p>
    </div>

    <!-- COLOR -->
    <div class="ds-section">
      <div class="ds-section-title">Paleta de color</div>
      <div class="ds-swatches">
        ${colors.map(c => `
          <div class="ds-swatch">
            <div class="ds-swatch-color" style="background:${c.code}"></div>
            <div class="ds-swatch-name">${c.name}</div>
            <div class="ds-swatch-code">${c.code} · var(${c.css})</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- TIPOGRAFÍA -->
    <div class="ds-section">
      <div class="ds-section-title">Tipografía</div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--c-primary)">Istok Web — Display 28px Bold</div>
        <div class="ds-type-meta">Usada en cifras KPI, logotipo y títulos de sección destacados.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:16px;font-weight:600;color:var(--c-primary)">Inter — Heading 16px SemiBold</div>
        <div class="ds-type-meta">Títulos de tarjeta y encabezados de sección.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:13px;color:var(--c-primary)">Inter — Body 13px Regular — para contenido general del sistema</div>
        <div class="ds-type-meta">Texto de tablas, formularios y párrafos.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:11px;color:var(--c-muted)">Inter — Small 11px — para etiquetas y metadatos</div>
        <div class="ds-type-meta">Subtítulos, ayudas de formulario, leyendas.</div>
      </div>
      <div class="ds-type-row">
        <div style="font-family:var(--font-ui);font-size:10px;font-weight:600;color:var(--c-muted);text-transform:uppercase;letter-spacing:.5px">Inter 10px 600 · Caps labels</div>
        <div class="ds-type-meta">Encabezados de tabla y secciones del menú lateral.</div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="ds-section">
      <div class="ds-section-title">Botones</div>
      <div class="ds-row" style="margin-bottom:12px">
        <button class="btn-accent">＋ Nuevo</button>
        <button class="btn-outline">← Regresar</button>
        <button class="btn-danger">🗑 Eliminar</button>
        <button class="btn-accent" disabled>Deshabilitado</button>
      </div>
      <div style="max-width:300px">
        <button class="btn-primary">Botón Primario (ancho completo)</button>
      </div>
    </div>

    <!-- CHIPS -->
    <div class="ds-section">
      <div class="ds-section-title">Chips de estado</div>
      <div class="ds-row">
        <span class="chip chip-green">Activo</span>
        <span class="chip chip-red">Atrasado</span>
        <span class="chip chip-blue">Liquidado</span>
        <span class="chip chip-warn">Preventa</span>
        <span class="chip chip-gray">Inactivo</span>
      </div>
    </div>

    <!-- KPI + ALERTAS -->
    <div class="ds-section">
      <div class="ds-section-title">Tarjetas KPI y alertas</div>
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
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;max-width:600px">
        <div class="alert-card error">
          <div class="alert-icon">❗</div>
          <div class="alert-text"><strong>Pago atrasado · J. Hernández</strong><span>$8,500 vencido el 01/Jun</span></div>
        </div>
        <div class="alert-card">
          <div class="alert-icon">⚠</div>
          <div class="alert-text"><strong>Contrato próximo a vencer</strong><span>C-0241 · L. Pérez vence en 5 días</span></div>
        </div>
      </div>
    </div>

    <!-- FORM ELEMENTS -->
    <div class="ds-section">
      <div class="ds-section-title">Elementos de formulario</div>
      <div class="form-card ds-card-demo">
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input type="text" placeholder="Ej. Juan Hernández López">
          </div>
          <div class="form-group">
            <label>RFC *</label>
            <input type="text" placeholder="HELJ801234AB1">
          </div>
          <div class="form-group">
            <label>Rol *</label>
            <select><option>Vendedor</option><option>Directivo</option><option>Asistente</option></select>
          </div>
          <div class="form-group">
            <label>Estatus</label>
            <select><option>Activo</option><option>Inactivo</option></select>
          </div>
        </div>
      </div>
    </div>

    <!-- ESPACIADO -->
    <div class="ds-section">
      <div class="ds-section-title">Espaciado y radio</div>
      <div class="ds-row">
        ${[4, 8, 12, 16, 24, 28].map(n => `
          <div class="ds-spacing-item">
            <div class="ds-spacing-box" style="width:${n}px;height:${n}px"></div>
            <span class="ds-spacing-label">${n}px</span>
          </div>`).join('')}
        <span class="ds-spacing-label" style="margin-left:16px">Radio: 6px · 8px · 12px · 16px</span>
      </div>
    </div>

    <p style="font-size:11px;color:var(--c-muted);margin-top:24px">
      SOFI v2.4.1 · Inter + Istok Web · Navy #0F3B5C · Verde #50A746 · © 2025
    </p>
  </div>`;
}
