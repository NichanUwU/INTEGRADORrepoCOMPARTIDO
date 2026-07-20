// FUNCIONES AUXILIARES

function getCurrentPage() {
  var path = window.location.pathname.split('/').pop() || 'dashboard.html';
  var page = path.replace('.html', '');
  if (page.indexOf('?') !== -1) {
    page = page.split('?')[0];
  }
  return page;
}

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('sofi-user')); } catch { return null; }
}

function saveUser(user) { localStorage.setItem('sofi-user', JSON.stringify(user)); }
function clearUser() { localStorage.removeItem('sofi-user'); }

function formatCurrency(value) {
  if (value == null || value === '') return '—';
  var num = Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
}

function formatDate(value) {
  if (!value) return 'N/A';
  var date = new Date(value);
  return isNaN(date) ? String(value) : date.toLocaleDateString('es-MX');
}

function navigateTo(page) {
  if (page.indexOf('.html') !== -1) {
    window.location.href = page;
    return;
  }
  if (page.indexOf('?') !== -1) {
    var parts = page.split('?');
    window.location.href = parts[0] + '.html?' + parts[1];
    return;
  }
  window.location.href = page + '.html';
}

function fetchApi(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers['Content-Type'] = 'application/json';
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }
  
  return fetch(API_URL + url, options)
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.mensaje || err.error || 'Error en la petición');
        });
      }
      return response.json();
    });
}