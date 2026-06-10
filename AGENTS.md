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
   ─ corres ./harness/init.sh (verificación "del principio")
   ─ preguntas: ¿feature o hotfix?
   ─ eliges la tarea pending de menor id
       │
       ▼
researcher → ⏸ validación del usuario → implementer → reviewer
```

> El plan que produce el `researcher` **no se ejecuta hasta que el usuario
> lo valida**. El `leader` presenta el plan y espera el OK explícito antes
> de lanzar al `implementer`.

Los subagentes están definidos en `agents/`. Cómo los invocas depende del
agente que esté ejecutando (Claude Code: tool Task con `subagent_type`;
Codex/OpenCode: spawn explícito). Ver `harness/README.md` §Compatibilidad.

---

## 1. Antes de empezar (obligatorio)

1. Lee `harness/progress/current.md` para entender en qué estado quedó la última sesión.
2. Corre `./harness/init.sh` una vez para confirmar que el entorno está verde (verificación "del principio"). Si sale en rojo, no avances.
3. Antes de empezar a organizar haz la siguiente pregunta al usuario: `¿Es una feature o un hotfix?`.
   - Si es una **feature** → lee `harness/feature_list.json` y `harness/progress/current.md`.
   - Si es un **hotfix** → lee `harness/hotfix_list.json` y `harness/progress/current.md`.
4. Lee el fichero del tipo de tarea (`harness/feature_list.json` o `harness/hotfix_list.json`) y elige **una tarea** con estado `pending`. No trabajes en más de una tarea a la vez.

## 2. Mapa del repositorio

> Casi todo el arnés vive bajo `harness/`. Solo `CLAUDE.md`, `AGENTS.md` y
> `agents/` quedan en la raíz del proyecto (los dos primeros porque son los
> *entry files* que los agentes leen automáticamente; `agents/` para poder
> copiarlo a `.claude/agents/`). `src/` y `tests/` son del proyecto, no del
> arnés.

| Archivo / carpeta            | Qué contiene                                              | Cuándo leerlo |
|------------------------------|-----------------------------------------------------------|---------------|
| `harness/feature_list.json`  | Lista de tareas con estado (pending / in_progress / done) | Si la tarea es feature, al empezar |
| `harness/hotfix_list.json`   | Lista de tareas con estado (pending / in_progress / done) | Si la tarea es hotfix, al empezar |
| `harness/progress/current.md`| Estado de la sesión actual                                | Siempre, al empezar |
| `harness/progress/history.md`| Bitácora append-only de sesiones anteriores               | Si necesitas contexto histórico |
| `harness/progress/feat_<id>/plan_<id>.md` | Plan que el `researcher` prepara para una feature. Temporal: se borra al cerrar la tarea | Implementer, antes de empezar (si existe) |
| `harness/progress/feat_<id>/review_<id>.md` | Veredicto del `reviewer` (APPROVED / CHANGES_REQUESTED + checkpoints). Temporal: se borra al cerrar la tarea | Implementer, tras la revisión |
| `harness/progress/hotfix_<id>/plan_<id>.md` | Plan que el `researcher` prepara para un hotfix. Temporal | Implementer, antes de empezar (si existe) |
| `harness/progress/hotfix_<id>/review_<id>.md` | Veredicto del `reviewer` para un hotfix. Temporal | Implementer, tras la revisión |
| `harness/progress/<agente>_<slug>.md` | Resumen histórico que el implementer escribe al cerrar una tarea (`done`). Persistente. Uno por agente: `researcher_`, `implementer_`, `reviewer_` | Para reconstruir contexto histórico |
| `harness/docs/architecture.md` | Qué significa "hacer un buen trabajo" en este proyecto  | Antes de implementar |
| `harness/docs/conventions.md`| Reglas de estilo, nombres, estructura                     | Antes de escribir código |
| `harness/docs/verification.md` | Cómo verificar que tu trabajo funciona                  | Antes de declarar una tarea como `done` |
| `harness/CHECKPOINTS.md`     | Criterios objetivos de "estado final correcto"            | Para auto-evaluarte |
| `harness/init.sh`            | Verificación del entorno. Se corre desde la raíz: `./harness/init.sh` | Al principio (leader) y al final (reviewer) |
| `agents/`                    | Definiciones de subagentes (líder, implementador, revisor, investigador) | Si orquestas trabajo |
| `src/`                       | Código de la aplicación                                   | Para implementar |
| `tests/`                     | Tests automáticos                                         | Para verificar |

## 3. Reglas duras (no negociables)

- **Una sola tarea a la vez.** No mezcles cambios de varias tareas en la misma sesión.
- **No declares una tarea `done` sin pruebas verdes.**
- **Documenta lo que haces** en `harness/progress/current.md` mientras trabajas, no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (ver §5).
- **Si no sabes algo, busca en `harness/docs/`** antes de inventarlo.
- **`./harness/init.sh` lo corren solo el leader (al principio) y el reviewer
  (verificación, incluye los tests del proyecto).** El implementer no ejecuta
  tests ni `init.sh` por su cuenta, y no lo re-ejecuta al marcar `done`.

## 4. Cómo elegir una tarea

```
1. Confirma con el usuario si es feature o hotfix.
2. Abre harness/feature_list.json o harness/hotfix_list.json, según el tipo.
3. Filtra por status == "pending".
4. Coge la de menor "id".
5. Cambia su status a "in_progress" y guarda.
6. Anota en harness/progress/current.md: tarea, hora de inicio, plan breve.
```

## 5. Cierre de sesión (lifecycle)

Antes de terminar:

1. **No re-ejecutes `./harness/init.sh`.** La verificación "del final" ya la
   corrió el `reviewer` al aprobar (`APPROVED` ⇒ entorno verde). Volver a
   correrlo aquí solo duplica los tests y ralentiza el cierre.
2. Si la tarea está acabada: marca `status: "done"` en `harness/feature_list.json` o `harness/hotfix_list.json`.
3. Mueve el resumen de `harness/progress/current.md` al final de `harness/progress/history.md`.
4. Vacía `harness/progress/current.md` dejando solo la plantilla.
5. No dejes archivos temporales, ni `print()` de debug, ni TODOs sin contexto.

## 6. Si te bloqueas

- Relee la sección relevante de `harness/docs/`.
- Si la herramienta no hace lo que esperas, **no inventes un workaround**:
  documenta el bloqueo en `harness/progress/current.md` y para la sesión.
