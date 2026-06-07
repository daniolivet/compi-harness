# AGENTS.md — Mapa de navegación para agentes de IA

> Este archivo es el **punto de entrada** para cualquier agente que trabaje en este
> repositorio (Codex CLI, OpenCode, Aider, etc. lo leen automáticamente;
> Claude Code lee `CLAUDE.md` primero y desde ahí llega aquí). NO es una
> biblia de reglas: es un **mapa**. Lee solo lo que necesites cuando lo
> necesites (divulgación progresiva).

---

## 0. Tu rol por defecto

Al recibir un prompt del usuario, actúas como **leader** (orquestador):
descompones el trabajo y coordinas subagentes. Tú **no implementas**. El
protocolo completo está en `agents/leader.md`. En resumen:

```
prompt del usuario
       │
       ▼
leader (tú)
   ─ lees este archivo
   ─ preguntas: ¿feature o hotfix?
   ─ eliges la tarea pending de menor id
       │
       ▼
researcher → implementer → reviewer
```

Los subagentes están definidos en `agents/`. Cómo los invocas depende del
agente que esté ejecutando (Claude Code: tool Task con `subagent_type`;
Codex/OpenCode: spawn explícito). Ver `README.md` §Compatibilidad.

---

## 1. Antes de empezar (obligatorio)

1. Lee `progress/current.md` para entender en qué estado quedó la última sesión.
2. Antes de empezar a organizar haz la siguiente pregunta al usuario: `¿Es una feature o un hotfix?`.
   - Si es una **feature** → lee `feature_list.json` y `progress/current.md`.
   - Si es un **hotfix** → lee `hotfix_list.json` y `progress/current.md`.
3. Lee el fichero del tipo de tarea (`feature_list.json` o `hotfix_list.json`) y elige **una tarea** con estado `pending`. No trabajes en más de una tarea a la vez.

## 2. Mapa del repositorio

| Archivo / carpeta            | Qué contiene                                              | Cuándo leerlo |
|------------------------------|-----------------------------------------------------------|---------------|
| `feature_list.json`          | Lista de tareas con estado (pending / in_progress / done) | Si la tarea es feature, al empezar |
| `hotfix_list.json`           | Lista de tareas con estado (pending / in_progress / done) | Si la tarea es hotfix, al empezar |
| `progress/current.md`        | Estado de la sesión actual                                | Siempre, al empezar |
| `progress/history.md`        | Bitácora append-only de sesiones anteriores               | Si necesitas contexto histórico |
| `progress/feat_<id>/plan_<id>.md` | Plan que el `researcher` prepara para una feature. Temporal: se borra al cerrar la tarea | Implementer, antes de empezar (si existe) |
| `progress/feat_<id>/review_<id>.md` | Veredicto del `reviewer` (APPROVED / CHANGES_REQUESTED + checkpoints). Temporal: se borra al cerrar la tarea | Implementer, tras la revisión |
| `progress/hotfix_<id>/plan_<id>.md` | Plan que el `researcher` prepara para un hotfix. Temporal | Implementer, antes de empezar (si existe) |
| `progress/hotfix_<id>/review_<id>.md` | Veredicto del `reviewer` para un hotfix. Temporal | Implementer, tras la revisión |
| `progress/<agente>_<slug>.md` | Resumen histórico que el implementer escribe al cerrar una tarea (`done`). Persistente. Uno por agente: `researcher_`, `implementer_`, `reviewer_` | Para reconstruir contexto histórico |
| `docs/architecture.md`       | Qué significa "hacer un buen trabajo" en este proyecto    | Antes de implementar |
| `docs/conventions.md`        | Reglas de estilo, nombres, estructura                     | Antes de escribir código |
| `docs/verification.md`       | Cómo verificar que tu trabajo funciona                    | Antes de declarar una tarea como `done` |
| `CHECKPOINTS.md`             | Criterios objetivos de "estado final correcto"            | Para auto-evaluarte |
| `agents/`                    | Definiciones de subagentes (líder, implementador, revisor, investigador) | Si orquestas trabajo |
| `src/`                       | Código de la aplicación                                   | Para implementar |
| `tests/`                     | Tests automáticos                                         | Para verificar |

## 3. Reglas duras (no negociables)

- **Una sola tarea a la vez.** No mezcles cambios de varias tareas en la misma sesión.
- **No declares una tarea `done` sin pruebas verdes.**
- **Documenta lo que haces** en `progress/current.md` mientras trabajas, no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (ver §5).
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.

## 4. Cómo elegir una tarea

```
1. Confirma con el usuario si es feature o hotfix.
2. Abre feature_list.json o hotfix_list.json, según el tipo.
3. Filtra por status == "pending".
4. Coge la de menor "id".
5. Cambia su status a "in_progress" y guarda.
6. Anota en progress/current.md: tarea, hora de inicio, plan breve.
```

## 5. Cierre de sesión (lifecycle)

Antes de terminar:

1. Ejecuta `./init.sh` — todo verde.
2. Si la tarea está acabada: marca `status: "done"` en `feature_list.json` o `hotfix_list.json`.
3. Mueve el resumen de `progress/current.md` al final de `progress/history.md`.
4. Vacía `progress/current.md` dejando solo la plantilla.
5. No dejes archivos temporales, ni `print()` de debug, ni TODOs sin contexto.

## 6. Si te bloqueas

- Relee la sección relevante de `docs/`.
- Si la herramienta no hace lo que esperas, **no inventes un workaround**:
  documenta el bloqueo en `progress/current.md` y para la sesión.
