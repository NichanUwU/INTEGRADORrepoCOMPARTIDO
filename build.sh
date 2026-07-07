#!/bin/bash
# ============================================================
# SOFI · Script de compilación
# Concatena los módulos editables en css/src/ y js/src/
# dentro de los archivos finales css/styles.css y js/app.js
# ============================================================
set -e
cd "$(dirname "$0")"

# ---- CSS ----
cat > css/styles.css << 'HEADER'
/* ============================================================
   SOFI — Software Operativo para Fincas e Inmuebles
   Hoja de estilos principal (compilada)

   Generada concatenando los módulos editables en css/src/
   en orden. Edita los archivos en css/src/ y corre build.sh.
   ============================================================ */

HEADER
for f in 01-tokens.css 02-base.css 03-login.css 04-shell.css \
         05-components.css 06-table.css 07-forms.css 08-feedback.css \
         09-domain.css 10-design-system.css; do
  cat "css/src/$f" >> css/styles.css
  printf "\n\n" >> css/styles.css
done

# ---- JS ----
cat > js/app.js << 'HEADER'
/* ============================================================
   SOFI — Software Operativo para Fincas e Inmuebles
   app.js (compilado)

   Generado concatenando los módulos editables en js/src/
   en orden. Edita los archivos en js/src/ y corre build.sh.
   ============================================================ */

HEADER
for f in 01-core.js 02-views-directivo.js 03-views-vendedor.js \
         04-views-asistente.js 05-helpers.js 06-design-system.js; do
  printf "\n" >> js/app.js
  cat "js/src/$f" >> js/app.js
  printf "\n" >> js/app.js
done

echo "✓ Compilado: css/styles.css y js/app.js"
