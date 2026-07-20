# Manual de Despliegue y Funcionamiento - SOFI (Sistema de Operaciones Financieras Inmobiliarias)

Este manual documenta cómo funciona el sistema, los roles de usuario y las instrucciones de despliegue en su servidor de AWS (`98.89.60.250`).

## 1. Funcionamiento de los Roles de Usuario
El sistema implementa 3 roles principales, cada uno con accesos restringidos:

- **Directivo (Administrador Total):**
  - **Permisos:** Acceso completo a todas las secciones (Dashboard, Desarrollos, Lotes, Clientes, Contratos, Flujo, Usuarios).
  - **Acciones:** Puede **crear, editar y eliminar** cualquier registro (Lotes, Clientes, Contratos, Pagos, etc.).

- **Vendedor (Ejecutivo de Ventas):**
  - **Permisos:** Acceso a Dashboard, Clientes, Contratos y Lotes.
  - **Acciones:** Puede **crear y editar** Clientes y Contratos. **NO PUEDE eliminar** ningún registro.

- **Asistente (Apoyo Administrativo):**
  - **Permisos:** Acceso a Dashboard, Clientes, Desarrollos, Contratos y Flujo de Efectivo.
  - **Acciones:** Rol de solo lectura para soporte. **NO PUEDE crear, editar, ni eliminar** registros.

> *Nota: Al iniciar sesión, la interfaz ocultará automáticamente los botones de "Eliminar", "Editar" y "Nuevo" según el rol del usuario conectado.*

## 2. Correcciones Implementadas en el Backend
- **Generación de JSON y API Rest:** Se corrigieron los problemas de `ClassCastException` que impedían registrar contratos, clientes y lotes debido al mapeo de variables tipo numéricas a `String`. Todo el backend ahora usa conversiones seguras.
- **Relaciones (JOINs):** Los lotes ahora obtienen automáticamente sus *Manzanas*, *Desarrollos* y *Colindancias* en las consultas de `LoteController`.
- **Dinámico 100%:** Se eliminaron los datos estáticos/quemados en HTML y Javascript. Ahora, todas las tablas (`flujo`, `contratos`, `lotes`, `clientes`, `desarrollos`) obtienen y guardan los datos directo de la base de datos MySQL a través de las APIs (Fetch API).

## 3. Pasos de Despliegue en AWS (IP: 98.89.60.250)

Si necesitas subir este proyecto a tu servidor AWS, sigue estos pasos desde la terminal de tu instancia (Ubuntu/Linux):

### A. Preparar Base de Datos MySQL
1. Ingresa a MySQL:
   ```bash
   mysql -u root -p
   ```
2. Crea la base de datos e importa las tablas:
   ```sql
   CREATE DATABASE sofi_db;
   USE sofi_db;
   SOURCE /ruta/a/tu/proyecto/sofi-backend/tablas.sql;
   ```

### B. Compilar y Ejecutar Backend (Java Javalin)
1. Asegúrate de tener **Maven** y **Java 8+** instalados (`sudo apt install maven openjdk-17-jdk`).
2. Entra a la carpeta del backend y compila:
   ```bash
   cd sofi-backend
   mvn clean package
   ```
3. Ejecuta el servidor backend:
   ```bash
   java -jar target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar
   ```
   *El servidor correrá en el puerto `8080`.*

### C. Desplegar el Frontend
1. Sube los archivos HTML, CSS y JS (`pages/`, `css/`, `js/`, `index.html`) a tu servidor web en AWS (por ejemplo, Apache o Nginx).
   - Para Nginx, colócalos en `/var/www/html`.
2. El archivo `js/core/config.js` ya está configurado para detectar automáticamente la IP `98.89.60.250` y realizar las peticiones al backend correctamente.

## 4. Notas Finales
El sistema ya se encuentra completamente estable y dinámico en tu entorno local. Al desplegarlo en AWS, todo operará de la misma manera gracias a las rutas relativas y variables configuradas.
