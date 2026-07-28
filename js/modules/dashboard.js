/* ============================================================
   SOFI — MÓDULO DASHBOARD
   KPIs, gráficos y ranking
   ============================================================ */

function cargarDashboard() {
  fetch('../json/dashboard-data.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      // KPIs
      var el = document.getElementById('total-clientes');
      if (el) el.textContent = (data.kpis && data.kpis.clientes) || 0;
      el = document.getElementById('total-lotes');
      if (el) el.textContent = (data.kpis && data.kpis.lotes) || 0;
      el = document.getElementById('total-contratos');
      if (el) el.textContent = (data.kpis && data.kpis.contratos) || 0;
      el = document.getElementById('total-desarrollos');
      if (el) el.textContent = (data.kpis && data.kpis.desarrollos) || 0;

      el = document.getElementById('trend-clientes');
      if (el) el.textContent = (data.tendencias && data.tendencias.clientes) || '';
      el = document.getElementById('trend-lotes');
      if (el) el.textContent = (data.tendencias && data.tendencias.lotes) || '';
      el = document.getElementById('trend-contratos');
      if (el) el.textContent = (data.tendencias && data.tendencias.contratos) || '';
      el = document.getElementById('trend-desarrollos');
      if (el) el.textContent = (data.tendencias && data.tendencias.desarrollos) || '';

      // Ranking de Vendedores
      var rankingContainer = document.getElementById('ranking-vendedores');
      if (rankingContainer) {
        var vendedores = data.vendedores || [];
        var rankingHtml = '';
        for (var i = 0; i < vendedores.length; i++) {
          var r = vendedores[i];
          rankingHtml += '<div class="ranking-item">';
          rankingHtml += '<div class="rank-num">' + (i + 1) + '</div>';
          rankingHtml += '<div class="rank-name">' + r.nombre + '</div>';
          rankingHtml += '<div class="rank-bar"><div class="rank-bar-fill" style="width:' + r.porcentaje + '%"></div></div>';
          rankingHtml += '<div class="rank-value">' + r.ventas + '</div>';
          rankingHtml += '</div>';
        }
        rankingContainer.innerHTML = rankingHtml;
      }

      // Mapa de Desarrollos (dashboard)
      var desarrollosContainer = document.getElementById('mapa-desarrollos');
      if (desarrollosContainer) {
        var desarrollos = data.desarrollos || [];
        var devHtml = '';
        for (var j = 0; j < desarrollos.length; j++) {
          var d = desarrollos[j];
          devHtml += '<div class="dev-card" onclick="navigateTo(\'detalle-desarrollo?id=' + d.id + '\')">';
          devHtml += '<div class="dev-card-thumb">🏠</div>';
          devHtml += '<div class="dev-card-body">';
          devHtml += '<div class="dev-card-name">' + d.nombre + '</div>';
          devHtml += '<div class="dev-card-meta">📍 ' + d.ubicacion + '</div>';
          devHtml += '<div class="dev-card-stats">';
          devHtml += '<div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-accent)">' + d.disponibles + '</div><div class="dev-stat-label">Disponibles</div></div>';
          devHtml += '<div class="dev-stat"><div class="dev-stat-num" style="color:var(--c-error)">' + d.vendidos + '</div><div class="dev-stat-label">Vendidos</div></div>';
          devHtml += '</div>';
          devHtml += '</div>';
          devHtml += '</div>';
        }
        desarrollosContainer.innerHTML = devHtml;
      }

      // GRÁFICO DE PASTEL
      var distData = data.distribucionLotes || { labels: ["Disponibles", "Vendidos", "Reservados"], datos: [150, 80, 30], colors: ["#50A746", "#D94040", "#E09B30"] };
      var totalDist = 0;
      for (var k = 0; k < distData.datos.length; k++) {
        totalDist += distData.datos[k];
      }
      var coloresDist = distData.colors || ["#50A746", "#D94040", "#E09B30"];

      var chartPastel = document.getElementById('chart-pastel');
      if (chartPastel && totalDist > 0) {
        var acumulado = 0;
        var segmentos = [];
        for (var m = 0; m < distData.datos.length; m++) {
          var valor = distData.datos[m];
          var pct = (valor / totalDist) * 100;
          var dashArray = pct * 3.6;
          var dashOffset = -acumulado * 3.6;
          var color = coloresDist[m] || '#CCCCCC';
          acumulado += pct;
          segmentos.push({ label: distData.labels[m] || 'Sin nombre', valor: valor, pct: pct, dashArray: dashArray, dashOffset: dashOffset, color: color });
        }

        var html = '';
        html += '<div style="display:flex;flex-direction:column;align-items:center;width:100%;">';
        html += '<svg viewBox="0 0 280 280" style="width:100%;max-width:280px;height:auto;">';
        for (var s = 0; s < segmentos.length; s++) {
          var seg = segmentos[s];
          html += '<circle cx="140" cy="140" r="100" fill="transparent" stroke="' + seg.color + '" stroke-width="50"';
          html += ' stroke-dasharray="' + seg.dashArray + ' ' + ((100 - seg.pct) * 3.6) + '"';
          html += ' stroke-dashoffset="' + seg.dashOffset + '"';
          html += ' transform="rotate(-90 140 140)"';
          html += ' title="' + seg.label + ': ' + seg.valor + ' lotes (' + seg.pct.toFixed(1) + '%)"/>';
        }
        html += '<text x="140" y="135" class="chart-center-text" font-size="22">' + totalDist + '</text>';
        html += '<text x="140" y="162" class="chart-center-label" font-size="13">Total Lotes</text>';
        html += '</svg>';
        html += '<div class="chart-legend-row" style="margin-top:10px;gap:16px;flex-wrap:wrap;justify-content:center;">';
        for (var l = 0; l < segmentos.length; l++) {
          var seg2 = segmentos[l];
          html += '<span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--c-muted);">';
          html += '<span style="width:14px;height:14px;background:' + seg2.color + ';border-radius:3px;display:inline-block;"></span>';
          html += seg2.label + ' (' + seg2.valor + ')';
          html += '</span>';
        }
        html += '</div>';
        html += '</div>';
        chartPastel.innerHTML = html;
      }

      // GRÁFICO DE ÁREA
      var areaData = data.clientesVsMorosos || { meses: [], alDia: [], morosos: [] };
      var meses = areaData.meses || [];
      var alDia = areaData.alDia || [];
      var morosos = areaData.morosos || [];
      var maxVal = 1;
      for (var a = 0; a < alDia.length; a++) { if (alDia[a] > maxVal) maxVal = alDia[a]; }
      for (var b = 0; b < morosos.length; b++) { if (morosos[b] > maxVal) maxVal = morosos[b]; }

      var chartArea = document.getElementById('chart-area');
      if (chartArea && meses.length > 0) {
        var width = 380, height = 200, pad = 30;

        var puntosAlDia = [];
        for (var i1 = 0; i1 < alDia.length; i1++) {
          var x = pad + (i1 / (meses.length - 1)) * (width - 2 * pad);
          var y = height - pad - (alDia[i1] / maxVal) * (height - 2 * pad);
          puntosAlDia.push({ x: x, y: y, v: alDia[i1] });
        }

        var puntosMorosos = [];
        for (var i2 = 0; i2 < morosos.length; i2++) {
          var x2 = pad + (i2 / (meses.length - 1)) * (width - 2 * pad);
          var y2 = height - pad - (morosos[i2] / maxVal) * (height - 2 * pad);
          puntosMorosos.push({ x: x2, y: y2, v: morosos[i2] });
        }

        var puntosAlDiaStr = '';
        for (var p1 = 0; p1 < puntosAlDia.length; p1++) {
          if (p1 > 0) puntosAlDiaStr += ' ';
          puntosAlDiaStr += puntosAlDia[p1].x + ',' + puntosAlDia[p1].y;
        }

        var puntosMorososStr = '';
        for (var p2 = 0; p2 < puntosMorosos.length; p2++) {
          if (p2 > 0) puntosMorososStr += ' ';
          puntosMorososStr += puntosMorosos[p2].x + ',' + puntosMorosos[p2].y;
        }

        var lastAlDia = puntosAlDia[puntosAlDia.length - 1];
        var firstAlDia = puntosAlDia[0];
        var areaAlDia = puntosAlDiaStr + ',' + lastAlDia.x + ',' + height + ' ' + firstAlDia.x + ',' + height;

        var lastMorosos = puntosMorosos[puntosMorosos.length - 1];
        var firstMorosos = puntosMorosos[0];
        var areaMorosos = puntosMorososStr + ',' + lastMorosos.x + ',' + height + ' ' + firstMorosos.x + ',' + height;

        var areaHtml = '';
        areaHtml += '<div style="width:100%;">';
        areaHtml += '<svg viewBox="0 0 ' + width + ' ' + height + '" style="width:100%;height:' + height + 'px;">';
        areaHtml += '<line x1="' + pad + '" y1="' + pad + '" x2="' + (width - pad) + '" y2="' + pad + '" stroke="#E8ECF0" stroke-width="1" stroke-dasharray="4,4"/>';
        areaHtml += '<line x1="' + pad + '" y1="' + (height/2) + '" x2="' + (width - pad) + '" y2="' + (height/2) + '" stroke="#E8ECF0" stroke-width="1" stroke-dasharray="4,4"/>';
        areaHtml += '<polygon fill="rgba(80,167,70,0.25)" points="' + areaAlDia + '" />';
        areaHtml += '<polyline fill="none" stroke="#50A746" stroke-width="3" points="' + puntosAlDiaStr + '" />';
        areaHtml += '<polygon fill="rgba(217,64,64,0.15)" points="' + areaMorosos + '" />';
        areaHtml += '<polyline fill="none" stroke="#D94040" stroke-width="2.5" stroke-dasharray="6,4" points="' + puntosMorososStr + '" />';

        for (var pt1 = 0; pt1 < puntosAlDia.length; pt1++) {
          var p = puntosAlDia[pt1];
          areaHtml += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="#50A746" stroke="white" stroke-width="2"/>';
          areaHtml += '<text x="' + p.x + '" y="' + (height - 4) + '" class="chart-label" font-size="11" fill="#6B8FAF">' + (meses[pt1] || '') + '</text>';
        }
        for (var pt2 = 0; pt2 < puntosMorosos.length; pt2++) {
          var p2 = puntosMorosos[pt2];
          areaHtml += '<circle cx="' + p2.x + '" cy="' + p2.y + '" r="4" fill="#D94040" stroke="white" stroke-width="1.5"/>';
        }

        areaHtml += '</svg>';
        areaHtml += '<div class="chart-legend-row" style="margin-top:6px;gap:20px;justify-content:center;">';
        areaHtml += '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--c-muted);">';
        areaHtml += '<span style="width:20px;height:3px;background:#50A746;border-radius:2px;display:inline-block;"></span>';
        areaHtml += 'Al día (' + alDia[alDia.length - 1] + ')';
        areaHtml += '</span>';
        areaHtml += '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--c-muted);">';
        areaHtml += '<span style="width:20px;height:3px;background:#D94040;border-radius:2px;display:inline-block;border:1px dashed #D94040;"></span>';
        areaHtml += 'Morosos (' + morosos[morosos.length - 1] + ')';
        areaHtml += '</span>';
        areaHtml += '</div>';
        areaHtml += '</div>';
        chartArea.innerHTML = areaHtml;
      }

      // GRÁFICO DE LÍNEA
      var lineaData = data.ventasMensuales || { meses: [], datos: [] };
      var mesesLinea = lineaData.meses || [];
      var datosLinea = lineaData.datos || [];
      var maxLinea = 1;
      for (var d1 = 0; d1 < datosLinea.length; d1++) {
        if (datosLinea[d1] > maxLinea) maxLinea = datosLinea[d1];
      }

      var chartLinea = document.getElementById('chart-linea');
      if (chartLinea && mesesLinea.length > 0) {
        var widthL = 380, heightL = 200, padL = 30;

        var puntosLinea = [];
        for (var iL = 0; iL < datosLinea.length; iL++) {
          var xL = padL + (iL / (mesesLinea.length - 1)) * (widthL - 2 * padL);
          var yL = heightL - padL - (datosLinea[iL] / maxLinea) * (heightL - 2 * padL);
          puntosLinea.push({ x: xL, y: yL, v: datosLinea[iL] });
        }

        var puntosStr = '';
        for (var pL = 0; pL < puntosLinea.length; pL++) {
          if (pL > 0) puntosStr += ' ';
          puntosStr += puntosLinea[pL].x + ',' + puntosLinea[pL].y;
        }

        var lineaHtml = '';
        lineaHtml += '<div style="width:100%;">';
        lineaHtml += '<svg viewBox="0 0 ' + widthL + ' ' + heightL + '" style="width:100%;height:' + heightL + 'px;">';
        lineaHtml += '<line x1="' + padL + '" y1="' + padL + '" x2="' + (widthL - padL) + '" y2="' + padL + '" stroke="#E8ECF0" stroke-width="1" stroke-dasharray="4,4"/>';
        lineaHtml += '<line x1="' + padL + '" y1="' + (heightL/2) + '" x2="' + (widthL - padL) + '" y2="' + (heightL/2) + '" stroke="#E8ECF0" stroke-width="1" stroke-dasharray="4,4"/>';
        lineaHtml += '<polyline fill="none" stroke="#0F3B5C" stroke-width="3" points="' + puntosStr + '" />';

        for (var pL2 = 0; pL2 < puntosLinea.length; pL2++) {
          var p = puntosLinea[pL2];
          lineaHtml += '<circle cx="' + p.x + '" cy="' + p.y + '" r="6" fill="#0F3B5C" stroke="white" stroke-width="2"/>';
          lineaHtml += '<text x="' + p.x + '" y="' + (p.y - 12) + '" class="chart-value" font-size="12" font-weight="700" fill="#0F3B5C" text-anchor="middle">' + p.v + '</text>';
          lineaHtml += '<text x="' + p.x + '" y="' + (heightL - 4) + '" class="chart-label" font-size="11" fill="#6B8FAF" text-anchor="middle">' + (mesesLinea[pL2] || '') + '</text>';
        }

        lineaHtml += '</svg>';
        lineaHtml += '<div class="chart-legend-row" style="margin-top:6px;gap:20px;justify-content:center;">';
        lineaHtml += '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--c-muted);">';
        lineaHtml += '<span style="width:20px;height:3px;background:#0F3B5C;border-radius:2px;display:inline-block;"></span>';
        var totalVentas = 0;
        for (var tv = 0; tv < datosLinea.length; tv++) { totalVentas += datosLinea[tv]; }
        lineaHtml += 'Total: ' + totalVentas + ' ventas';
        lineaHtml += '</span>';
        lineaHtml += '</div>';
        lineaHtml += '</div>';
        chartLinea.innerHTML = lineaHtml;
      }

      var notif = document.getElementById('notif-count');
      if (notif) notif.textContent = (data.alertas && data.alertas.length) || 0;
    })
    .catch(function() { showToast('Error cargando dashboard', 'error'); });
}

window.cargarDashboard = cargarDashboard;