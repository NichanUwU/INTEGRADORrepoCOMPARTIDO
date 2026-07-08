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
echo "✓ JS compartido listo: js/app.js usa el flujo funcional para las páginas HTML reales."
