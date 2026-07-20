/* ============================================================
   SOFI — MÓDULO DASHBOARD VENDEDOR
   ============================================================ */

function cargarDashboard() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('sofi-user') || '{}');
  } catch(e) {}

  if (!user || !user.IdEmpleado) return;

  Promise.all([
    fetchApi('/clientes?IdEmpleado=' + user.IdEmpleado).catch(() => []),
    fetchApi('/contratos').catch(() => []), 
    fetchApi('/lotes').catch(() => [])
  ]).then(function(results) {
    var misClientes = results[0] || [];
    var todosContratos = results[1] || [];
    var todosLotes = results[2] || [];

    var misContratos = todosContratos.filter(c => c.IdEmpleado === user.IdEmpleado);
    var lotesDisponibles = todosLotes.filter(l => l.Estado === 'Disponible').length;

    var el = document.getElementById('mis-clientes');
    if (el) el.textContent = misClientes.length;
    
    el = document.getElementById('lotes-disponibles');
    if (el) el.textContent = lotesDisponibles;
    
    el = document.getElementById('mis-contratos');
    if (el) el.textContent = misContratos.length;
    // 1. Meta Mensual (Global)
    var meta = parseInt(localStorage.getItem('sofi-meta-general') || '5');
    var progreso = (misContratos.length / meta) * 100;
    if (progreso > 100) progreso = 100;
    el = document.getElementById('meta-mensual');
    if (el) el.textContent = Math.round(progreso) + '%';

    var ctxMisVentas = document.getElementById('chart-mis-ventas');
    if (ctxMisVentas) {
      ctxMisVentas = ctxMisVentas.getContext('2d');
      var mesesVentas = [0,0,0,0,0,0,0,0,0,0,0,0];
      
      misContratos.forEach(c => {
        if (c.Fecha) {
          var m = parseInt(c.Fecha.split('-')[1]) - 1;
          if (m >= 0 && m <= 11) mesesVentas[m]++;
        }
      });

      new Chart(ctxMisVentas, {
        type: 'line',
        data: {
          labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
          datasets: [{
            label: 'Contratos Cerrados',
            data: mesesVentas,
            borderColor: '#50A746',
            backgroundColor: 'rgba(80, 167, 70, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    }

  }).catch(err => console.error("Error cargando dashboard vendedor:", err));
}

document.addEventListener('DOMContentLoaded', cargarDashboard);
