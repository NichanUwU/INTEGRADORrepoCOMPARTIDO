# 🎯 SOFI - Guía Rápida de Despliegue en AWS

Tu instancia está lista en: **54.208.140.131**

---

## ⚡ LO MÁS RÁPIDO (3 pasos)

### 1️⃣ Desde tu máquina - Compilar y transferir

```bash
# Ir a la carpeta del proyecto
cd ~/Desktop/INTEGRADORrepoCOMPARTIDO

# Compilar (una sola vez)
bash prepare-deploy.sh

# Transferir a AWS
scp -r -i /ruta/a/tu/key.pem . ubuntu@54.208.140.131:~/integrador/SofiIntegrador
```

### 2️⃣ En la instancia - Instalar y arrancar

```bash
# Conectar a la instancia
ssh -i /ruta/a/tu/key.pem ubuntu@54.208.140.131

# Una sola vez - instalar Java
sudo apt update && sudo apt install -y default-jre

# Arrancar el backend
cd ~/integrador/SofiIntegrador
bash start-backend.sh
```

### 3️⃣ En otra terminal SSH - Servir el frontend

```bash
ssh -i /ruta/a/tu/key.pem ubuntu@54.208.140.131

cd ~/integrador/SofiIntegrador

# Opción A - Python (simple)
python3 -m http.server 80

# Opción B - nginx (mejor para producción, ver DEPLOY_AWS.md)
```

---

## 📝 URLs finales

```
🌐 Frontend:  http://54.208.140.131
🔌 API:       http://54.208.140.131:8080/api
📊 Datos:     sofi_db en MySQL (localhost:3306)
```

---

## 🔑 Credenciales

- **MySQL**: sofi / 1234
- **Usuarios Demo**: admin@sofi.mx (contraseña: 1234)

---

## 📚 Información completa

Para instrucciones detalladas, ver: **DEPLOY_AWS.md**

```bash
cat DEPLOY_AWS.md
```

---

## ✅ Verificar que todo funciona

```bash
# En la instancia, verifica:

# 1. Backend corriendo
curl http://localhost:8080/api/empleados

# 2. MySQL accesible
mysql -h 127.0.0.1 -u sofi -p1234 sofi_db -e "SHOW TABLES;"

# 3. Frontend servido
curl http://54.208.140.131/pages/login.html
```

---

## 🛠️ Scripts disponibles

```bash
bash prepare-deploy.sh      # Compila el proyecto localmente
bash start-backend.sh       # Arranca el backend en la instancia
bash deploy.sh              # Despliegue completo (Maven + arranque)
```

---

## 🆘 Si algo no funciona

```bash
# Ver logs del backend
tail -f logs/backend.log

# Ver si el puerto 8080 está en uso
sudo ss -tulpn | grep 8080

# Ver si MySQL está corriendo
sudo systemctl status mysql

# Detener el backend
pkill -f "sofi-backend.*jar"
```

---

**¡Listo para desplegar! 🚀**
