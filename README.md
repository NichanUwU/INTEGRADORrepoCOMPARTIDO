# SOFI — Software Operativo para Fincas e Inmuebles

Frontend completo en **HTML + CSS + JavaScript puro** (sin frameworks ni
dependencias de build) con las 45 vistas del sistema más la página de
Sistema de Diseño, para los 3 roles: **Directivo**, **Vendedor** y
**Asistente**.

## Cómo abrirlo

Abre `index.html` directamente en cualquier navegador moderno (Chrome,
Firefox, Safari, Edge). No requiere servidor ni instalación.

Inicia sesión con cualquier correo (ya viene precargado uno de ejemplo)
y elige un rol — el menú lateral y las vistas disponibles cambian según
el rol seleccionado.

## Estructura del proyecto

```
index.html              ← punto de entrada único
css/
  styles.css             ← hoja de estilos compilada (la que usa index.html)
  src/                    ← módulos editables, fuente de styles.css
    01-tokens.css           variables: color, tipografía, radios, sombras
    02-base.css             reset y estilos base
    03-login.css            pantalla de login
    04-shell.css            sidebar + topbar + layout general
    05-components.css       KPIs, gráficas, botones, chips
    06-table.css            tablas, buscador, paginación
    07-forms.css            formularios y filas de detalle
    08-feedback.css         modal, toast, alertas, estado vacío
    09-domain.css           timeline de pagos, mapa de lotes, ranking,
                             simulador, tarjetas de desarrollo, documentos
    10-design-system.css    estilos de la página /design-system
js/
  app.js                  ← script compilado (el que usa index.html)
  src/                    ← módulos editables, fuente de app.js
    01-core.js              estado, autenticación, navegación, router
    02-views-directivo.js   18 vistas del rol Directivo
    03-views-vendedor.js    9 vistas del rol Vendedor
    04-views-asistente.js   7 vistas del rol Asistente
    05-helpers.js           gráficas, modal, toast, simulador
    06-design-system.js     vista del sistema de diseño
build.sh                 ← concatena css/src/*.css → css/styles.css
                            y js/src/*.js → js/app.js
```

## Editar el proyecto

1. Modifica los archivos dentro de `css/src/` o `js/src/`.
2. Corre `./build.sh` para regenerar `css/styles.css` y `js/app.js`.
3. Refresca `index.html` en el navegador.

`index.html` **solo** carga `css/styles.css` y `js/app.js` — los
archivos en `src/` no se referencian directamente, así que siempre hay
que recompilar tras editarlos.

## Roles y vistas

**Directivo** (18 vistas) — Dashboard, Desarrollos, Lotes, Clientes,
Contratos, Flujo de Efectivo, Análisis Financiero, Usuarios, Roles, y
sus respectivas vistas de creación/detalle.

**Vendedor** (9 vistas) — Dashboard, Mis Clientes, Lotes Disponibles,
Simulador de Financiamiento, Mis Contratos, y vistas de creación/detalle.

**Asistente** (7 vistas) — Dashboard, Flujo de Efectivo, Registrar/Detalle
de Pago, Clientes, Testigos.

**Sistema de Diseño** — accesible desde el botón "🎨 Diseño" en la barra
superior, en cualquier rol.

## Notas técnicas

- Sin dependencias externas excepto las fuentes de Google Fonts (Inter +
  Istok Web), con fallback a fuentes del sistema si no hay conexión.
- JavaScript compatible con navegadores desde 2016 en adelante (sin
  optional chaining ni otras sintaxis muy recientes).
- Diseño responsivo: el sidebar se colapsa a menú hamburguesa por debajo
  de 900px de ancho.
- Los datos mostrados son de ejemplo (mock), pensados para conectarse a
  un backend real más adelante.
# SOFI2
