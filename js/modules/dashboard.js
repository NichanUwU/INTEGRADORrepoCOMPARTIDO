/* ============================================================
   SOFI — MÓDULO DASHBOARD
   KPIs, gráficos y ranking (100% Dinámico con Base de Datos)
   ============================================================ */

function cargarDashboard() {
  Promise.all([
    fetchApi('/clientes').catch(() => []),
    fetchApi('/lotes').catch(() => []),
    fetchApi('/contratos').catch(() => []),
    fetchApi('/desarrollos').catch(() => []),
    fetchApi('/empleados').catch(() => [])
  ]).then(function(results) {
    var clientes = results[0] || [];
    var lotes = results[1] || [];
    var contratos = results[2] || [];
    var desarrollos = results[3] || [];
    var empleados = results[4] || [];

    // ==============================================
    // 1. ACTUALIZAR KPIs
    // ==============================================
    var el = document.getElementById('total-clientes');
    if (el) el.textContent = clientes.length;
    el = document.getElementById('total-lotes');
    if (el) el.textContent = lotes.length;
    el = document.getElementById('total-contratos');
    if (el) el.textContent = contratos.length;
    el = document.getElementById('total-desarrollos');
    if (el) el.textContent = desarrollos.length;

    el = document.getElementById('trend-clientes');
    if (el) el.textContent = 'Actualizado';
    el = document.getElementById('trend-lotes');
    if (el) el.textContent = 'Actualizado';
    el = document.getElementById('trend-contratos');
    if (el) el.textContent = 'Actualizado';
    el = document.getElementById('trend-desarrollos');
    if (el) el.textContent = 'Actualizado';

    // ==============================================
    // 2. RANKING DE VENDEDORES
    // ==============================================
    var rankingContainer = document.getElementById('ranking-vendedores');
    if (rankingContainer) {
      // Contar contratos por empleado
      var ventasPorEmpleado = {};
      var maxVentas = 0;
      for (var i = 0; i < contratos.length; i++) {
        var c = contratos[i];
        if (!ventasPorEmpleado[c.IdEmpleado]) ventasPorEmpleado[c.IdEmpleado] = 0;
        ventasPorEmpleado[c.IdEmpleado]++;
        if (ventasPorEmpleado[c.IdEmpleado] > maxVentas) maxVentas = ventasPorEmpleado[c.IdEmpleado];
      }

      // Combinar con datos de empleado
      var metaGeneral = parseInt(localStorage.getItem('sofi-meta-general') || '5');
      var rankingList = [];
      for (var j = 0; j < empleados.length; j++) {
        var emp = empleados[j];
        if (ventasPorEmpleado[emp.IdEmpleado]) {
          rankingList.push({
            nombre: emp.Nombre + ' ' + emp.Apellidos,
            ventas: ventasPorEmpleado[emp.IdEmpleado],
            porcentaje: Math.min((ventasPorEmpleado[emp.IdEmpleado] / metaGeneral) * 100, 100)
          });
        }
      }

      // Ordenar mayor a menor
      rankingList.sort(function(a, b) { return b.ventas - a.ventas; });

      var rankingHtml = '';
      if (rankingList.length === 0) {
        rankingHtml = '<div style="color:var(--c-muted);font-size:13px;text-align:center;padding:20px;">No hay ventas registradas aún.</div>';
      }
      for (var k = 0; k < Math.min(rankingList.length, 5); k++) {
        var r = rankingList[k];
        var isWinner = (r.ventas >= metaGeneral);
        var iconHtml = isWinner ? ' <span title="Meta Lograda!" style="color:#FFD700">👑</span>' : '';
        rankingHtml += '<div class="ranking-item">';
        rankingHtml += '<div class="rank-num">' + (k + 1) + '</div>';
        rankingHtml += '<div class="rank-name">' + r.nombre + iconHtml + '</div>';
        rankingHtml += '<div class="rank-bar"><div class="rank-bar-fill" style="width:' + r.porcentaje + '%; ' + (isWinner ? 'background-color:#FFD700' : '') + '"></div></div>';
        rankingHtml += '<div class="rank-value" style="font-size:11px">' + r.ventas + '/' + metaGeneral + '</div>';
        rankingHtml += '</div>';
      }
      rankingContainer.innerHTML = rankingHtml;
    }

    // ==============================================
    // 4. GRÁFICO DE PASTEL (Lotes por Estado)
    // ==============================================
    var disp = lotes.filter(function(l) { return l.Estado === 'Disponible'; }).length;
    var vend = lotes.filter(function(l) { return l.Estado === 'Vendido'; }).length;
    var resv = lotes.filter(function(l) { return l.Estado === 'Reservado'; }).length;

    var distData = { labels: ["Disponibles", "Vendidos", "Reservados"], datos: [disp, vend, resv], colors: ["#50A746", "#D94040", "#E09B30"] };
    var totalDist = disp + vend + resv;

    var chartPastel = document.getElementById('chart-pastel');
    if (chartPastel) {
        chartPastel.innerHTML = '<canvas id="canvas-pastel" width="280" height="280"></canvas>';
        var ctx = document.getElementById('canvas-pastel').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: distData.labels,
                datasets: [{
                    data: distData.datos,
                    backgroundColor: distData.colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                }
            }
        });
      } else {
        chartPastel.innerHTML = '<div style="color:var(--c-muted);font-size:13px;text-align:center;padding:20px;">Sin lotes registrados</div>';
      }

    // ==============================================
    // 5. GRÁFICO DE ÁREA (Contratos Activos vs Atrasados por mes)
    // ==============================================
    var mesesMapActivos = {};
    var mesesMapAtrasados = {};
    for (var a1 = 0; a1 < contratos.length; a1++) {
      var cont = contratos[a1];
      if (cont.Fecha) {
        var mes = cont.Fecha.substring(0, 7); // YYYY-MM
        if (cont.Estatus === 'Activo') {
            if (!mesesMapActivos[mes]) mesesMapActivos[mes] = 0;
            mesesMapActivos[mes]++;
        } else if (cont.Estatus === 'Atrasado') {
            if (!mesesMapAtrasados[mes]) mesesMapAtrasados[mes] = 0;
            mesesMapAtrasados[mes]++;
        }
      }
    }
    
    var mesesKeys = Object.keys(mesesMapActivos).concat(Object.keys(mesesMapAtrasados));
    var mesesUnicos = mesesKeys.filter(function(item, pos) { return mesesKeys.indexOf(item) == pos; }).sort();
    
    if (mesesUnicos.length === 0) {
        mesesUnicos = ['Actual'];
        mesesMapActivos['Actual'] = 0;
        mesesMapAtrasados['Actual'] = 0;
    }
    
    var alDia = [];
    var morosos = [];
    for(var mu = 0; mu < mesesUnicos.length; mu++){
        alDia.push(mesesMapActivos[mesesUnicos[mu]] || 0);
        morosos.push(mesesMapAtrasados[mesesUnicos[mu]] || 0);
    }
    
    var chartArea = document.getElementById('chart-area');
    if (chartArea) {
      chartArea.innerHTML = '<canvas id="canvas-area" style="width:100%;height:100%;min-height:200px;"></canvas>';
      var ctxArea = document.getElementById('canvas-area').getContext('2d');
      new Chart(ctxArea, {
          type: 'line',
          data: {
              labels: mesesUnicos,
              datasets: [
                  {
                      label: 'Al día',
                      data: alDia,
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      fill: true,
                      tension: 0.4
                  },
                  {
                      label: 'Morosos',
                      data: morosos,
                      borderColor: '#EF4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      borderDash: [5, 5],
                      fill: true,
                      tension: 0.4
                  }
              ]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
              scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } } }
          }
      });
    }

    // ==============================================
    // 6. GRÁFICO DE LÍNEA (Ventas Totales Mensuales)
    // ==============================================
    var mesesMapVentas = {};
    for (var a2 = 0; a2 < contratos.length; a2++) {
      var cont2 = contratos[a2];
      if (cont2.Fecha) {
        var mes2 = cont2.Fecha.substring(0, 7); // YYYY-MM
        if (!mesesMapVentas[mes2]) mesesMapVentas[mes2] = 0;
        mesesMapVentas[mes2]++;
      }
    }
    var mesesUnicosVentas = Object.keys(mesesMapVentas).sort();
    if(mesesUnicosVentas.length === 0){ mesesUnicosVentas = ['Actual']; mesesMapVentas['Actual'] = 0; }
    
    var chartLinea = document.getElementById('chart-linea');
    if (chartLinea) {
      chartLinea.innerHTML = '<canvas id="canvas-linea" style="width:100%;height:100%;min-height:20px;"></canvas>';
      var ctxLinea = document.getElementById('canvas-linea').getContext('2d');
      var labelsVentas = mesesUnicosVentas.map(function(m) { return m.replace('2026-', ''); });
      var datosVentas = [];
      for(var m2=0; m2<mesesUnicosVentas.length; m2++) {
        datosVentas.push(mesesMapVentas[mesesUnicosVentas[m2]]);
      }

      new Chart(ctxLinea, {
          type: 'line',
          data: {
              labels: labelsVentas,
              datasets: [{
                  label: 'Ventas (Contratos)',
                  data: datosVentas,
                  borderColor: '#0F3B5C',
                  backgroundColor: 'rgba(15, 59, 92, 0.1)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#00D084',
                  pointBorderColor: '#0F3B5C',
                  pointRadius: 5
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } } }
          }
      });
    }

  }).catch(function(e) {
    console.error(e);
    showToast('Error cargando los datos reales del dashboard', 'error');
  });
}

window.cargarDashboard = cargarDashboard;