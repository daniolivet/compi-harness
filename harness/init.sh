#!/usr/bin/env bash
# init.sh — Verificación e inicialización del entorno
#
# CUÁNDO se ejecuta (política de verificación):
#   1. Al PRINCIPIO del proceso — el `leader` lo corre al arrancar la sesión
#      para confirmar que el entorno está verde antes de tocar nada.
#   2. Al FINAL — el `reviewer` lo corre como puerta única de verificación
#      (incluye los tests del proyecto vía ./scripts/check.sh).
# El `implementer` NO lo ejecuta — ni este script ni los tests por su cuenta:
# escribe código + tests y deja la verificación al reviewer. Tampoco lo
# re-ejecuta al cerrar la tarea: se fía del verde del reviewer.
#
# Este script vive en `harness/` pero se ejecuta desde la raíz del proyecto
# (p. ej. `./harness/init.sh`). Internamente hace `cd` a la raíz, así que
# funciona sin importar desde dónde se invoque.
#
# El script es **stack-agnostic**: solo valida los ficheros base del arnés.
# Los chequeos específicos del proyecto (toolchain, lint, typecheck, tests)
# se delegan a `./scripts/check.sh` si existe. Crea ese fichero al adoptar
# el arnés y mete ahí lo que tu stack necesite (node, python, go, rust...).
#
# Salida esperada: códigos de salida claros y bloques marcados con [OK]/[FAIL].

set -u

# Posicionarse en la raíz del proyecto (el padre de harness/), de modo que
# las rutas relativas de abajo sean estables sea cual sea el cwd del agente.
cd "$(dirname "$0")/.." || { echo "[FAIL]  no pude cd a la raíz del proyecto"; exit 1; }

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0

echo "── 1. Verificando archivos base del arnés ──────────────"

for f in AGENTS.md CLAUDE.md harness/feature_list.json harness/hotfix_list.json harness/progress/current.md harness/docs/architecture.md harness/docs/conventions.md harness/docs/verification.md harness/CHECKPOINTS.md; do
  if [ ! -f "$f" ]; then
    fail "Falta archivo base: $f"
    EXIT_CODE=1
  else
    ok "Existe $f"
  fi
done

echo ""
echo "── 2. Validando feature_list.json y hotfix_list.json ───"

# Validación JSON con python3 (preinstalado en macOS/Linux). Si no hay
# python3 disponible, se omite la validación con un WARN.
if command -v python3 >/dev/null 2>&1; then
  for list in harness/feature_list.json harness/hotfix_list.json; do
    [ -f "$list" ] || continue
    python3 - "$list" <<'PY'
import json, sys
path = sys.argv[1]
try:
    data = json.load(open(path))
    valid = {"pending", "in_progress", "done", "blocked"}
    key = "features" if "features" in data else "hotfixes"
    items = data.get(key, [])
    in_progress = [i for i in items if i.get("status") == "in_progress"]
    if len(in_progress) > 1:
        print(f"[FAIL]  {path}: {len(in_progress)} tareas en in_progress (máximo 1)")
        sys.exit(1)
    for it in items:
        st = it.get("status")
        if st not in valid:
            print(f"[FAIL]  {path}: estado inválido en {it.get('id')}: {st}")
            sys.exit(1)
    print(f"[OK]    {path} válido ({len(items)} tareas)")
except Exception as e:
    print(f"[FAIL]  {path} inválido: {e}")
    sys.exit(1)
PY
    if [ $? -ne 0 ]; then EXIT_CODE=1; fi
  done
else
  warn "python3 no disponible — se omite la validación de JSON"
fi

echo ""
echo "── 3. Hook de verificación del proyecto ────────────────"

if [ -f "./scripts/check.sh" ]; then
  if bash ./scripts/check.sh; then
    ok "./scripts/check.sh pasó"
  else
    fail "./scripts/check.sh falló"
    EXIT_CODE=1
  fi
else
  warn "./scripts/check.sh no existe — define ahí los chequeos del proyecto (lint/typecheck/test)"
fi

echo ""
echo "── 4. Resumen ──────────────────────────────────────────"

if [ $EXIT_CODE -eq 0 ]; then
  ok "Entorno listo. Puedes empezar a trabajar."
else
  fail "Entorno NO está listo. Resuelve los errores antes de avanzar."
fi

exit $EXIT_CODE
