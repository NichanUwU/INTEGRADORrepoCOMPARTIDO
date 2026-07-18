# 🚀 GUÍA DE DESPLIEGUE - SOFI en AWS

## Información de la Instancia
- **IP Pública**: 54.208.140.131
- **BD**: sofi_db
- **Usuario MySQL**: sofi / 1234
- **Puerto Backend**: 8080

---

## PASO 1: En tu máquina local - Preparar el proyecto

El proyecto ya está configurado. Solo verifica que:

```bash
# Frontend está en /
ls -la pages/login.html

# Backend está compilado
ls -la sofi-backend/target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar
```

Si el JAR no existe, compila:
```bash
cd sofi-backend
mvn clean package -DskipTests -q
cd ..
```

---

## PASO 2: Transferir a la instancia

Desde tu máquina local:

```bash
# Copiar todo el proyecto a la instancia
scp -r -i tu-key.pem . ec2-user@54.208.140.131:~/integrador/SofiIntegrador

# O si es ubuntu:
scp -r -i tu-key.pem . ubuntu@54.208.140.131:~/integrador/SofiIntegrador
```

---

## PASO 3: En la instancia - Instalar dependencias

```bash
# SSH a la instancia
ssh -i tu-key.pem ubuntu@54.208.140.131

# Dentro de la instancia:
cd ~/integrador/SofiIntegrador

# Instalar Java 8+ (si no está instalado)
sudo apt update
sudo apt install -y default-jre default-jdk

# Verificar Java
java -version
```

---

## PASO 4: En la instancia - Iniciar el backend

### Opción A: Manual (para probar)

```bash
cd sofi-backend
java -jar target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar
```

Deberías ver:
```
🚀 Backend de SOFI iniciado en http://localhost:8080
Todos los endpoints registrados correctamente
```

Verifica en otra terminal SSH:
```bash
curl http://localhost:8080/api/empleados
```

### Opción B: Con el script de despliegue

```bash
bash deploy.sh
```

Esto compilará y arrancará el backend automáticamente.

### Opción C: En background con nohup

```bash
nohup java -jar sofi-backend/target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar > logs/backend.log 2>&1 &
```

---

## PASO 5: Servir el frontend

### Opción A: Con Python

```bash
# En la carpeta raíz del proyecto
python3 -m http.server 80
```

O en puerto 8000 si no tienes permisos sudo:
```bash
python3 -m http.server 8000
```

### Opción B: Con nginx (Recomendado para producción)

```bash
sudo apt install -y nginx

# Crear config de nginx
sudo tee /etc/nginx/sites-available/sofi > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    root /home/ubuntu/integrador/SofiIntegrador;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Activar la configuración
sudo ln -s /etc/nginx/sites-available/sofi /etc/nginx/sites-enabled/sofi
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl restart nginx
```

---

## PASO 6: Verificar que todo esté funcionando

```bash
# Verificar MySQL
mysql -h 127.0.0.1 -u sofi -p1234 sofi_db -e "SELECT COUNT(*) as total_clientes FROM CLIENTE;"

# Verificar Backend
curl http://54.208.140.131:8080/api/empleados

# Verificar Frontend
curl http://54.208.140.131/pages/login.html
```

---

## PASO 7: Acceder a la aplicación

Abre en tu navegador:
```
http://54.208.140.131
```

O directamente a login:
```
http://54.208.140.131/pages/login.html
```

---

## CREDENCIALES DE PRUEBA

- **Usuario**: admin@sofi.mx (o cualquier usuario que exista en la BD)
- **Contraseña**: 1234

---

## MONITOREO EN PRODUCCIÓN

Ver logs del backend:
```bash
tail -f logs/backend.log
```

Ver procesos de Java:
```bash
ps aux | grep java
```

Reiniciar el backend:
```bash
# Matar el proceso
pkill -f "sofi-backend.*jar"

# Reiniciar
nohup java -jar sofi-backend/target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar > logs/backend.log 2>&1 &
```

---

## SOLUCIÓN DE PROBLEMAS

### El backend no inicia
```bash
# Revisar si el puerto 8080 está ocupado
sudo ss -tulpn | grep 8080

# Matar el proceso anterior
sudo kill -9 <PID>
```

### MySQL no conecta
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Reiniciar si está caído
sudo systemctl restart mysql

# Verificar credenciales
mysql -h 127.0.0.1 -u sofi -p1234 sofi_db
```

### El frontend no sirve bien
```bash
# Verificar nginx
sudo systemctl status nginx

# Reiniciar nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

---

## PASOS PARA APAGAR TODO

```bash
# Detener backend
pkill -f "sofi-backend.*jar"

# Detener nginx
sudo systemctl stop nginx

# Detener MySQL (si lo deseas)
sudo systemctl stop mysql
```

---

## Resumen rápido

1. Compila localmente: `mvn clean package -DskipTests -q`
2. Copia a AWS: `scp -r -i key.pem . ubuntu@54.208.140.131:~/integrador/`
3. En AWS, inicia backend: `java -jar sofi-backend/target/*.jar &`
4. Sirve frontend: `python3 -m http.server 80`
5. Accede: `http://54.208.140.131`

¡Listo! 🎉
