/* ============================================================
   SOFI — MÓDULO DE CONFIGURACIÓN
   ============================================================ */

function cargarConfiguracion() {
  const userStr = localStorage.getItem('sofi-user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      
      const elNombre = document.getElementById('conf-nombre');
      const elRol = document.getElementById('conf-rol');
      if (elNombre) elNombre.textContent = user.NombreCompleto || user.Empleado || user.nombreCompleto || 'Usuario SOFI';
      if (elRol) {
          let rawRol = (user.Rol || user.role || 'Directivo').toLowerCase();
          if (rawRol === 'admin' || rawRol === 'administrador') {
              rawRol = 'directivo';
          }
          elRol.textContent = rawRol.charAt(0).toUpperCase() + rawRol.slice(1);
          
          if (rawRol === 'directivo') {
              var rowMeta = document.getElementById('row-meta-general');
              if (rowMeta) rowMeta.style.display = 'flex';
              
              var inputMeta = document.getElementById('input-meta-general');
              if (inputMeta) {
                  inputMeta.value = localStorage.getItem('sofi-meta-general') || 5;
              }
          }
      }
    } catch(e) {
      console.error('Error parseando usuario en config:', e);
    }
  }
}

function guardarConfiguraciones() {
    var inputMeta = document.getElementById('input-meta-general');
    if (inputMeta && inputMeta.offsetParent !== null) { // if visible
        var val = parseInt(inputMeta.value);
        if (!isNaN(val) && val > 0) {
            localStorage.setItem('sofi-meta-general', val);
        }
    }
    showToast('Configuraciones guardadas', 'success');
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', cargarConfiguracion);
