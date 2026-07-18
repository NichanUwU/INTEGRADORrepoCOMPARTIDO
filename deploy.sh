#!/bin/bash
# Script de despliegue para instancia AWS
# Ejecutar: bash deploy.sh

set -e

echo "🚀 SOFI - Deployment Script"
echo "=========================================="
echo ""

# Variables
BACKEND_DIR="sofi-backend"
TARGET_JAR="sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar"
LOGS_DIR="./logs"
PID_FILE="./sofi-backend.pid"

# Crear directorio de logs
mkdir -p $LOGS_DIR

# 1. Compilar el backend
echo "📦 Compilando backend..."
cd $BACKEND_DIR
mvn clean package -q -DskipTests
cd ..

# 2. Detener el backend anterior si está corriendo
if [ -f $PID_FILE ]; then
    OLD_PID=$(cat $PID_FILE)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "⏹️  Deteniendo backend anterior (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
    rm $PID_FILE
fi

# 3. Iniciar el backend
echo "🔄 Iniciando backend..."
java -jar $BACKEND_DIR/target/$TARGET_JAR > $LOGS_DIR/backend.log 2>&1 &
echo $! > $PID_FILE

sleep 2

# 4. Verificar que el backend esté corriendo
if ps -p $(cat $PID_FILE) > /dev/null; then
    echo "✅ Backend iniciado exitosamente (PID: $(cat $PID_FILE))"
    echo "   URL: http://54.208.140.131:8080/api"
    echo "   Logs: tail -f $LOGS_DIR/backend.log"
else
    echo "❌ Error al iniciar el backend"
    cat $LOGS_DIR/backend.log
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Despliegue completado"
echo ""
echo "Frontend: http://54.208.140.131"
echo "Backend: http://54.208.140.131:8080/api"
echo "Logs: tail -f $LOGS_DIR/backend.log"
echo ""
