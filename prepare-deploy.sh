#!/bin/bash
# Script para preparar el proyecto para despliegue
# Ejecutar: bash prepare-deploy.sh

echo "📦 Preparando proyecto para despliegue..."
echo ""

# Compilar el backend
echo "🔨 Compilando backend..."
cd sofi-backend
mvn clean package -q -DskipTests

if [ -f target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar ]; then
    echo "✅ Backend compilado exitosamente"
    echo "   JAR: target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar"
else
    echo "❌ Error en la compilación del backend"
    exit 1
fi

cd ..
echo ""

# Verificar frontend
if [ -f pages/login.html ] && [ -f css/styles.css ]; then
    echo "✅ Frontend listo"
else
    echo "❌ Archivos del frontend no encontrados"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Proyecto listo para despliegue"
echo ""
echo "Próximo paso:"
echo "  scp -r -i your-key.pem . ubuntu@54.208.140.131:~/integrador/SofiIntegrador"
echo ""
