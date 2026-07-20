#!/bin/bash
# Script rápido para arrancar SOFI en la instancia
# Ejecutar: bash start-backend.sh

echo "🚀 Iniciando SOFI Backend..."

export DB_URL="jdbc:mysql://54.208.140.131:3306/sofi_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USER="sofi"
export DB_PASSWORD="1234"
export PORT="8080"

# Detener cualquier instancia anterior
pkill -f "sofi-backend.*jar" 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true

# Crear directorio de logs
mkdir -p logs

# Iniciar el backend en background
cd sofi-backend
java -jar target/sofi-backend-1.0-SNAPSHOT-jar-with-dependencies.jar > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo ""
echo "📋 Logs:"
echo "   tail -f logs/backend.log"
echo ""
echo "🌐 API disponible en:"
echo "   http://54.208.140.131:8080/api"
echo ""
echo "📱 Frontend disponible en:"
echo "   http://54.208.140.131"
echo ""
echo "⏸️  Para detener el backend:"
echo "   pkill -f 'sofi-backend.*jar'"
