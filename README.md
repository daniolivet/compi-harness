# compi-harness

Un **arnés de trabajo para agentes de IA** que estructura el ciclo
*investigar → implementar → revisar* en un repositorio. Stack-agnóstico
(no asume ningún lenguaje ni framework concreto) y **agnóstico al agente**:
funciona con Claude Code, OpenAI Codex CLI, OpenCode, Cursor, Aider y, en
general, cualquier asistente que pueda leer un archivo de instrucciones
del repositorio.

La idea es simple: cuando un agente entra en el repo, ya sabe dónde mirar,
qué reglas aplican y cómo cerrar el trabajo sin dejar el árbol sucio. El
arnés es **documentación con forma de directorio** + **scripts de
verificación** + **plantillas de subagentes**.

---

## ¿Por qué?

Trabajar con un agente sin estructura suele acabar en:

- Cambios inconsistentes (cada sesión inventa su propio estilo).
- Tareas marcadas como "done" sin pruebas verdes.
- Contexto perdido entre sesiones — la siguiente arranca de cero.
- Mocks que ocultan que el cambio rompe producción.
- Revisión sin criterio: "esto se ve bien" en vez de "cumple los checkpoints".

El arnés ataca cada una de esas causas con una regla escrita y una
expectativa concreta:

- `AGENTS.md` es el mapa: cualquier agente lo lee primero.
- `docs/architecture.md` define qué es "buen código" en este proyecto.
- `docs/conventions.md` define cómo se escribe.
- `docs/verification.md` define cómo se demuestra que funciona.
- `CHECKPOINTS.md` define cuándo se aprueba un cambio.
- `feature_list.json` / `hotfix_list.json` son la cola de trabajo, con un
  lifecycle único (`pending → in_progress → done`).
- `progress/current.md` lleva la sesión en vivo; `progress/history.md` es
  la bitácora append-only.
- `agents/` son las definiciones de los subagentes (leader,
  researcher, implementer, reviewer) con sus protocolos.
- `init.sh` es el guardián: valida estado del arnés y delega los chequeos
  específicos del stack a `./scripts/check.sh`.

---

## Estructura

```
.
├── CLAUDE.md                 # Entry para Claude Code. Asigna el rol de leader.
├── AGENTS.md                 # Mapa del repositorio. Entry para Codex / OpenCode / Aider / etc.
├── CHECKPOINTS.md            # Lista de criterios objetivos de aprobación.
├── README.md                 # Este archivo.
├── init.sh                   # Verificación del entorno. Llamar antes de empezar y antes de cerrar.
├── feature_list.json         # Cola de features (pending / in_progress / done / blocked).
├── hotfix_list.json          # Cola de hotfixes.
├── docs/
│   ├── architecture.md       # Decisiones arquitectónicas. Estándar de calidad.
│   ├── conventions.md        # Estilo de código, nombres, estructura.
│   └── verification.md       # Política de tests y mocking.
├── progress/
│   ├── current.md            # Estado de la sesión actual. Se vacía al cerrar.
│   └── history.md            # Bitácora append-only.
└── agents/
    ├── leader.md             # Orquestador. No escribe código.
    ├── researcher.md         # Produce el plan.
    ├── implementer.md        # Ejecuta el plan + escribe tests.
    └── reviewer.md           # Aprueba o rechaza.
```

Cuando el arnés está vivo, en `progress/` también aparecen archivos
temporales y persistentes:

```
progress/
├── feat_<id>/                # Carpeta temporal de una feature en curso.
│   ├── plan_<id>.md          # Plan del researcher. Se borra al cerrar.
│   └── review_<id>.md        # Veredicto del reviewer. Se borra al cerrar.
├── hotfix_<id>/              # Igual, para hotfixes.
├── researcher_<slug>.md      # Resumen histórico por tarea cerrada.
├── implementer_<slug>.md     # Resumen histórico por tarea cerrada.
└── reviewer_<slug>.md        # Resumen histórico por tarea cerrada.
```

---

## Lifecycle de una tarea

```
   feature_list.json (status: pending)
            │
            ▼
   ┌─────────────────────────────────────────────┐
   │ 1. leader pregunta: ¿feature o hotfix?     │
   │ 2. leader elige tarea pending de menor id  │
   │ 3. leader lanza researcher                  │
   └─────────────────────────────────────────────┘
            │
            ▼
   researcher
   ─ marca tarea in_progress
   ─ explora código, evalúa enfoques (SOLID/KISS/DRY)
   ─ escribe progress/feat_<id>/plan_<id>.md
            │
            ▼
   implementer
   ─ lee el plan
   ─ implementa + escribe tests
   ─ ejecuta ./init.sh hasta verde
            │
            ▼
   reviewer
   ─ recorre CHECKPOINTS.md
   ─ ejecuta ./init.sh
   ─ veredicto → progress/feat_<id>/review_<id>.md
            │
       ┌────┴─────┐
       ▼          ▼
 CHANGES_REQ   APPROVED
       │          │
       │          ▼
       │   implementer cierra:
       │   ─ status: "done" en feature_list.json
       │   ─ escribe researcher_<slug>.md,
       │     implementer_<slug>.md, reviewer_<slug>.md
       │   ─ mueve current.md → history.md
       │   ─ rm -rf progress/feat_<id>/
       │
       └─→ vuelve a implementer
```

Reglas duras del lifecycle:

- **Una sola tarea `in_progress` a la vez.** `init.sh` falla si hay más.
- **No se marca `done` sin `./init.sh` verde y sin `APPROVED` del reviewer.**
- **`progress/current.md` se actualiza en vivo**, no al final.
- **Los artefactos temporales (`feat_<id>/`, `hotfix_<id>/`) se borran al
  cerrar la tarea.** Los resúmenes históricos (`<rol>_<slug>.md`) se quedan.

---

## Cómo adoptarlo en un proyecto nuevo

1. **Copia el contenido del arnés a la raíz del proyecto** (no como
   subdirectorio):

   ```bash
   # Desde el proyecto destino:
   cp -r /ruta/a/compi-harness/. ./
   ```

   No copies el `.git/` del arnés si lo hubiera; sus archivos van como
   ficheros normales del proyecto.

2. **Rellena las plantillas con la realidad de tu stack:**

   - `docs/architecture.md` — qué significa "buen código" aquí.
   - `docs/conventions.md` — estilo, nombres, errores, logging.
   - `docs/verification.md` — política de tests y mocking.
   - `CHECKPOINTS.md` — añade los checkpoints específicos del proyecto.
   - `feature_list.json` / `hotfix_list.json` — pon el nombre del proyecto
     y la primera tarea pendiente.
   - `progress/history.md` — borra la entrada de ejemplo.

3. **Crea `scripts/check.sh`** con los chequeos reales del stack
   (lint, typecheck, test, build). `init.sh` lo invoca automáticamente
   si existe. Ejemplos:

   ```bash
   # scripts/check.sh — Node
   set -e
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

   ```bash
   # scripts/check.sh — Python
   set -e
   ruff check .
   mypy src
   pytest
   ```

   ```bash
   # scripts/check.sh — Go
   set -e
   go vet ./...
   go test ./...
   go build ./...
   ```

4. **Ejecuta `./init.sh`** y arregla todo lo que salga rojo antes de
   empezar a meter tareas.

5. **Si usas Claude Code y quieres descubrimiento nativo de subagentes**,
   copia las plantillas a `.claude/agents/`:

   ```bash
   mkdir -p .claude/agents && cp agents/*.md .claude/agents/
   ```

   Para Codex CLI, OpenCode, Aider y otros no hace falta — leen `agents/`
   como Markdown normal cuando el `leader` los referencia.

6. **Arranca tu agente** en el directorio y dale el primer prompt. El
   agente leerá su entry file (`CLAUDE.md` o `AGENTS.md`), asumirá el rol
   de `leader`, te preguntará si es feature o hotfix, y arrancará el
   flujo. Un buen primer prompt:

   > "Tengo una feature nueva: <descripción breve>. Añádela a
   > `feature_list.json` y empezamos."

---

## Setup guiado por agente

Si no quieres rellenar las plantillas (`docs/*.md`, `CHECKPOINTS.md`,
`scripts/check.sh`, las listas) a mano, copia este prompt y pégalo al
agente justo después de copiar el arnés al proyecto. El agente te irá
preguntando por bloques y dejará todo configurado, terminando con un
`./init.sh` verde.

```text
Eres el setup wizard de este arnés (compi-harness). Esta es una sesión
de CONFIGURACIÓN única, no de trabajo: NO actúes como leader, NO
preguntes "¿feature o hotfix?", NO toques `src/` ni `tests/`.

Tu tarea: rellenar las plantillas del arnés haciéndome preguntas por
bloques. Reglas:

- UN bloque a la vez. Pregunta, espera respuesta, escribe el(los)
  fichero(s) de ese bloque, y solo entonces pasa al siguiente.
- Si respondo "no sé" o "no aplica", déjalo como "N/A" o borra la
  sección, pero NO inventes.
- Si una respuesta es ambigua, repregunta antes de escribir.
- Ficheros permitidos para tocar: `feature_list.json`,
  `hotfix_list.json`, `docs/architecture.md`, `docs/conventions.md`,
  `docs/verification.md`, `CHECKPOINTS.md`, `scripts/check.sh`, y
  opcionalmente `.claude/agents/*.md`. Cualquier otro fichero está
  fuera de alcance.
- No reescribas un fichero entero si solo cambia una sección: edita
  esa sección.

---

**Bloque 1 — Identidad**
- Nombre del proyecto (slug corto, sin espacios).
- Descripción en 1-2 frases: qué hace, para quién, qué problema resuelve.

→ Escribe el campo `project` en `feature_list.json` y `hotfix_list.json`.
  Rellena la sección "Contexto" de `docs/architecture.md`.

**Bloque 2 — Stack y toolchain**
- Lenguaje + versión (p. ej. TypeScript 5.x, Python 3.12, Go 1.22).
- Runtime/target (Node 20 LTS, CPython 3.12, JVM 21…).
- Frameworks y librerías relevantes (HTTP, DB, ORM, validación…).
- Comandos exactos para: lint, typecheck (si aplica), tests, build.

→ Crea `scripts/check.sh` con `set -e` y los comandos en orden
  (lint → typecheck → test → build). Hazlo ejecutable (`chmod +x`).
  Rellena "Estilo del lenguaje" en `docs/conventions.md`.

**Bloque 3 — Convenciones**
- Nombres (ficheros, tipos/clases, funciones, constantes, privadas, enums).
- Sufijos por rol, si aplica (p. ej. `*.service.ts`, `*.controller.ts`).
- Estructura típica de un módulo/dominio (carpetas + ejemplo).
- Validación de entradas externas (librería + dónde).
- Inyección de dependencias.
- Manejo de errores (excepciones / Result / exit codes; dónde se definen).
- Logger oficial y qué queda prohibido (`console.log`, `print`, …).
- Asincronía: patrones que sí / patrones que no.

→ Rellena `docs/conventions.md`. Borra las secciones que no apliquen.

**Bloque 4 — Arquitectura**
- 3-5 principios no negociables (qué + por qué).
- Flujo de datos típico (descríbelo en prosa; tú lo conviertes a ASCII).
- 3-5 anti-patrones concretos ("no se hace X porque Y").

→ Rellena `docs/architecture.md`.

**Bloque 5 — Verificación**
- Framework de tests.
- Política de mocking: qué se mockea siempre, qué no se mockea nunca, y por qué.
- Comando para tests unitarios.
- ¿Hay E2E / integración? Si sí: comando + qué dependencias reales se usan.
- ¿Hay smoke manual? Si sí, cómo se arranca dev.

→ Rellena `docs/verification.md`.

**Bloque 6 — Checkpoints específicos**
Listame 3-7 checkpoints objetivos más allá de los genéricos C1-C7. Cada
uno verificable sin opinar (mal: "código limpio"; bien: "ningún
controller devuelve entidades de Prisma directamente").

→ Añádelos como C8, C9, … en `CHECKPOINTS.md` y borra los ejemplos
  placeholder.

**Bloque 7 — Primera tarea (opcional)**
¿Añado una primera entrada en `feature_list.json` o `hotfix_list.json`?
Si sí: tipo, id, título, descripción de 1-2 frases, y criterios de
aceptación en bullets. Si no, sáltalo.

**Bloque 8 — Subagentes de Claude Code (opcional)**
¿Vas a trabajar con Claude Code y quieres `.claude/agents/` poblado para
descubrimiento nativo? (Sí/No)

→ Si sí: `mkdir -p .claude/agents && cp agents/*.md .claude/agents/`.

---

**Cierre**
1. Ejecuta `./init.sh`.
2. Si está en verde, dime que el arnés está listo y cuál es el primer
   paso recomendado (lanzar al leader con la primera tarea, o pedirme
   una si nos saltamos el bloque 7).
3. Si está en rojo, listame cada `[FAIL]`, explica qué falta, y
   pregúntame antes de tocar nada. NO improvises arreglos.

Empieza ahora por el Bloque 1.
```

Cuando termine, lo único que queda por hacer es lanzar al agente con
una tarea real (paso 6 de la sección anterior).

---

## Compatibilidad con agentes de IA

El arnés no depende de ningún agente concreto. Lo que cambia entre uno y
otro es **qué archivo lee primero** al entrar al repo. Por eso enviamos
dos entry files con instrucciones equivalentes:

- `CLAUDE.md` — entry de Claude Code.
- `AGENTS.md` — entry estándar (Codex CLI, OpenCode, Aider y otros lo
  leen automáticamente; es la convención de [agents.md](https://agents.md)).

Tabla de compatibilidad:

| Agente                | Entry file que lee                    | Funciona out-of-the-box |
|-----------------------|---------------------------------------|-------------------------|
| Claude Code           | `CLAUDE.md`                           | Sí                      |
| OpenAI Codex CLI      | `AGENTS.md`                           | Sí                      |
| OpenCode (sst)        | `AGENTS.md`                           | Sí                      |
| Aider                 | `AGENTS.md` (también lee `CONVENTIONS.md`) | Sí                 |
| Cursor                | `.cursor/rules` o `.cursorrules`      | Requiere puente (ver abajo) |
| GitHub Copilot Chat   | `.github/copilot-instructions.md`     | Requiere puente         |
| Otros                 | Apuntar manualmente a `AGENTS.md`     | Sí, con un paso         |

**Para agentes que no leen `CLAUDE.md` ni `AGENTS.md` directamente** (Cursor,
Copilot, ...), crea su archivo de configuración con una línea que apunte
al entry estándar:

```
# Ejemplo: .cursorrules o .github/copilot-instructions.md
Lee AGENTS.md como punto de entrada. Sigue el protocolo de agents/leader.md.
```

**Los subagentes (`agents/leader.md`, `researcher.md`, `implementer.md`,
`reviewer.md`) están escritos como Markdown plano con frontmatter YAML.**
Claude Code los descubre nativamente si los copias a `.claude/agents/` al
adoptar el arnés. Otros agentes que no soporten "subagentes" pueden
**leerlos como roles** que el modelo asume secuencialmente en la misma
sesión — el flujo `researcher → implementer → reviewer` funciona igual,
solo cambia el motor.

## Requisitos

- **Bash 4+** (macOS / Linux).
- **`python3`** disponible en `PATH` para que `init.sh` valide los JSON.
  Si no está, la validación se omite con un WARN; el resto del script
  sigue funcionando.
- Un **agente de IA** capaz de leer el repo (ver tabla de compatibilidad
  arriba). El arnés no requiere ninguno en particular.
- Lo que tu stack necesite. El arnés no impone toolchain.

---

## Filosofía

Este arnés está pensado para minimizar dos clases de fallo:

1. **Drift entre sesiones.** Un agente nuevo lee `AGENTS.md` y en 5 minutos
   sabe lo mismo que el que cerró la sesión anterior. No depende de memoria
   ni de chat previo.

2. **"Lo dejé hecho" sin evidencia.** No se cierra una tarea sin tests
   verdes, sin pasar checkpoints, y sin que un agente reviewer distinto
   del implementer haya dado el OK.

No es un framework de testing, ni un linter, ni un sistema de tickets
remoto. Es una **convención** que vive en el repo y que cualquiera (humano
o agente) puede seguir leyendo los archivos en el orden que indica
`AGENTS.md`.

---

## Licencia

Mira el archivo `LICENSE` si está presente. Si no, el arnés se publica
como código de plantilla libre de derechos — cópialo, modifícalo y úsalo
en lo que quieras.
