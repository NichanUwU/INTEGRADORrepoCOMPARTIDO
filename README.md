# SOFI — Software Operativo para Fincas e Inmuebles

Frontend completo en **HTML + CSS + JavaScript puro** (sin frameworks ni
dependencias de build) con las 45 vistas del sistema más la página de
Sistema de Diseño, para los 3 roles: **Directivo**, **Vendedor** y
**Asistente**.

---

## 📋 Índice de Archivos y Carpetas

### 🏠 Archivos en la Raíz

| Archivo | Descripción |
|---------|-----------|
| **index.html** | Punto de entrada único del sistema. Redirige automáticamente a `pages/login.html` usando meta refresh. |
| **README.md** | Este archivo. Documentación completa del proyecto. |
| **build.sh** | Script Bash que compila/concatena todos los módulos CSS y JS. Ejecutar con `bash build.sh` o `./build.sh`. |
| **tablas.sql** | Esquema SQL con la definición de todas las tablas de la base de datos (estructura de datos principal). |
| **package-lock.json** | Archivo de control de versiones de dependencias npm (registro de dependencias exactas usadas). |
| **.gitignore** | Archivo de configuración de Git que define qué archivos no se versionan en el repositorio. |
| **.env** | Archivo de variables de entorno (probablemente para configuración del backend Java). |

---

### 📁 Carpeta `css/`

Contiene todos los estilos del sistema, organizados modularmente.

| Archivo | Descripción |
|---------|-----------|
| **styles.css** | Hoja de estilos **compilada final**. Se genera automáticamente ejecutando `build.sh`. Este es el archivo que usa `index.html`. NO editar manualmente. |
| **src/01-tokens.css** | Variables CSS globales: colores, tipografía, tamaños de espaciado, radios de borde, sombras, animaciones. Define la identidad visual completa. |
| **src/02-base.css** | Reset y estilos base: normalización de elementos HTML (body, inputs, botones, etc.). |
| **src/03-login.css** | Estilos exclusivos de la pantalla de login: formulario, fondo, animaciones de entrada. |
| **src/04-shell.css** | Layout general: sidebar (menú lateral), topbar (barra superior), contenedor principal, responsive. |
| **src/05-components.css** | Componentes reutilizables: KPIs, gráficas, botones, chips, badges, tarjetas. |
| **src/06-table.css** | Estilos de tablas: estructura de filas, encabezados, buscador, paginación, selectores. |
| **src/07-forms.css** | Estilos de formularios: inputs, selects, textareas, validación, filas de detalle, tooltips. |
| **src/08-feedback.css** | Estados de feedback: modales, toasts (notificaciones), alertas, estado vacío, loader, confirmaciones. |
| **src/09-domain.css** | Estilos específicos del dominio: timeline de pagos, mapa de lotes, ranking de vendedores, simulador de financiamiento, tarjetas de desarrollo, sección de documentos. |
| **src/10-design-system.css** | Estilos de la página `/design-system` que muestra la guía de componentes y tokens. |

---

### 📁 Carpeta `js/`

Contiene toda la lógica JavaScript del sistema, modularizada.

| Archivo | Descripción |
|---------|-----------|
| **app.js** | Script JavaScript **compilado final**. Se genera automáticamente ejecutando `build.sh`. Este es el archivo que usa `index.html`. NO editar manualmente. |
| **src/01-core.js** | Núcleo del sistema: gestión de estado global, autenticación, navegación, router (enrutador de vistas), inicialización de la aplicación. |
| **src/02-views-directivo.js** | 18 vistas del rol **Directivo**: dashboard, análisis, reportes, gestión general del negocio. |
| **src/03-views-vendedor.js** | 9 vistas del rol **Vendedor**: panel de ventas, clientes, contratos, comisiones, seguimiento de lotes. |
| **src/04-views-asistente.js** | 7 vistas del rol **Asistente**: gestión de usuarios, roles, tareas administrativas, soporte. |
| **src/05-helpers.js** | Funciones auxiliares reutilizables: renderizado de gráficas, manejo de modales, toasts, simulador de financiamiento. |
| **src/06-design-system.js** | Lógica de la página `/design-system` que documentan componentes, tokens y patrones de diseño. |

---

### 📁 Carpeta `pages/`

Contiene las páginas HTML estáticas que actúan como contenedores/shells para cada vista.

| Archivo | Descripción |
|---------|-----------|
| **login.html** | Pantalla de login. Primera página que ve el usuario. Contiene formulario de autenticación y selector de rol. |
| **dashboard.html** | Dashboard principal (KPIs, gráficas, resumen del negocio). Accesible según el rol del usuario. |
| **analisis.html** | Página de análisis y reportes. Visualización de datos y métricas del sistema. |
| **clientes.html** | Gestión de clientes: tabla de clientes, búsqueda, filtros, detalles, crear/editar cliente. |
| **contratos.html** | Gestión de contratos: tabla de contratos activos, búsqueda, estado, detalles de contrato. |
| **desarrollos.html** | Gestión de desarrollos inmobiliarios: tabla de proyectos, mapa, detalles del desarrollo. |
| **lotes.html** | Gestión de lotes: tabla de lotes, mapa interactivo, disponibilidad, asignación a vendedores. |
| **flujo.html** | Timeline/flujo de pagos: visualización de plazos de pago, cronograma de entregas. |
| **usuarios.html** | Gestión de usuarios: tabla de usuarios, roles, permisos, crear/editar usuario. |
| **roles.html** | Gestión de roles y permisos: definición de roles (Directivo, Vendedor, Asistente), permisos por rol. |

---

### 📁 Carpeta `sofi-backend/`

Backend Java (Spring Boot o similar). Código del servidor y lógica de negocio.

| Archivo/Carpeta | Descripción |
|---------|-----------|
| **pom.xml** | Archivo de configuración de Maven. Define dependencias, versión del proyecto, plugins de compilación. |
| **tablas.sql** | Esquema SQL del backend (mismo que en la raíz, o versión sincronizada). Define estructura de base de datos. |
| **.env** | Variables de entorno del backend (conexión a BD, puerto del servidor, credenciales). |
| **src/main/java/com/sofi/App.java** | Clase principal de la aplicación Spring Boot. Punto de entrada del servidor. |
| **src/main/java/com/sofi/controllers/ClienteController.java** | REST API para gestionar clientes (GET, POST, PUT, DELETE). |
| **src/main/java/com/sofi/controllers/ContratoController.java** | REST API para gestionar contratos. |
| **src/main/java/com/sofi/controllers/DesarrolloController.java** | REST API para gestionar desarrollos inmobiliarios. |
| **src/main/java/com/sofi/controllers/LoteController.java** | REST API para gestionar lotes. |
| **src/main/java/com/sofi/controllers/UsuarioController.java** | REST API para gestionar usuarios y autenticación. |
| **src/main/java/com/sofi/database/DatabaseConnection.java** | Clase de conexión a la base de datos. Maneja la conexión JDBC o JPA. |

---

## 🚀 Cómo Usar

### Abrir la Aplicación
1. Abre `index.html` directamente en un navegador moderno (Chrome, Firefox, Safari, Edge).
2. No requiere servidor ni instalación.
3. Inicia sesión con cualquier correo (viene precargado un ejemplo).
4. Selecciona un rol (Directivo, Vendedor o Asistente).
5. El menú y vistas disponibles cambian según el rol.

### Editar CSS o JavaScript
1. Edita solo los archivos dentro de `css/src/` o `js/src/`.
2. NUNCA edites `css/styles.css` o `js/app.js` directamente (se regeneran).
3. Ejecuta `bash build.sh` para compilar/concatenar los cambios.
4. Recarga el navegador (Ctrl+R o Cmd+R).

### Backend Java
1. Asegúrate de tener Maven y Java instalados.
2. Configura el archivo `.env` con credenciales de base de datos.
3. Ejecuta `mvn clean install` en la carpeta `sofi-backend/`.
4. Ejecuta `mvn spring-boot:run` para iniciar el servidor.
5. El servidor expone endpoints REST que consume el frontend.

---

## 📊 Resumen de Estructura

```
SofiIntegrador/
├── index.html                    ← punto de entrada
├── README.md                     ← este archivo
├── build.sh                      ← compilador de módulos
├── tablas.sql                    ← esquema BD
├── package-lock.json             ← dependencias npm
├── .gitignore                    ← configuración de Git
├── .env                          ← variables de entorno
├── css/
│   ├── styles.css                ← CSS compilado (generado)
│   └── src/
│       ├── 01-tokens.css         ← variables globales
│       ├── 02-base.css           ← estilos base
│       ├── 03-login.css          ← pantalla login
│       ├── 04-shell.css          ← layout principal
│       ├── 05-components.css     ← componentes
│       ├── 06-table.css          ← tablas
│       ├── 07-forms.css          ← formularios
│       ├── 08-feedback.css       ← modales, toasts
│       ├── 09-domain.css         ← estilos de dominio
│       └── 10-design-system.css  ← design system
├── js/
│   ├── app.js                    ← JS compilado (generado)
│   └── src/
│       ├── 01-core.js            ← núcleo, router, auth
│       ├── 02-views-directivo.js ← vistas Directivo (18)
│       ├── 03-views-vendedor.js  ← vistas Vendedor (9)
│       ├── 04-views-asistente.js ← vistas Asistente (7)
│       ├── 05-helpers.js         ← utilidades
│       └── 06-design-system.js   ← design system
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── analisis.html
│   ├── clientes.html
│   ├── contratos.html
│   ├── desarrollos.html
│   ├── lotes.html
│   ├── flujo.html
│   ├── usuarios.html
│   └── roles.html
└── sofi-backend/
    ├── pom.xml                   ← configuración Maven
    ├── tablas.sql                ← esquema BD
    ├── .env                      ← variables entorno
    └── src/main/java/com/sofi/
        ├── App.java              ← punto de entrada
        ├── controllers/
        │   ├── ClienteController.java
        │   ├── ContratoController.java
        │   ├── DesarrolloController.java
        │   ├── LoteController.java
        │   └── UsuarioController.java
        └── database/
            └── DatabaseConnection.java
```

---

## 🎯 Notas Importantes

- **Frontend y Backend separados**: El frontend es vanilla HTML/CSS/JS (sin build tools); el backend es Java con Maven.
- **Modularidad**: Los archivos CSS y JS están divididos por responsabilidad y se compilan en un solo archivo final.
- **Sin dependencias externas (frontend)**: Todo funciona en navegadores modernos sin librerías externas.
- **3 roles diferentes**: Las vistas cambian completamente según el rol del usuario (Directivo, Vendedor, Asistente).
- **45+ vistas**: Total de pantallas disponibles en el sistema (distribuidas según rol).
- **Sistema de diseño integrado**: Página `/design-system` para documentar componentes y tokens.
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
