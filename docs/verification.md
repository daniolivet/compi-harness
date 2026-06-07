# Verificación — Cómo demostrar que el trabajo funciona

> **Plantilla.** Rellena con la política de verificación real de tu proyecto.
> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda tarea termina con evidencia ejecutable, no con afirmaciones.

## Política de mocking

> Antes de los niveles, una regla que aplica a todo lo que sigue. Define
> qué se mockea y qué no. Sin esto, cada agente inventa su propia política
> y los tests "verdes" empiezan a divergir de producción.

- **<Regla 1>.** <Ejemplo: "DB siempre real (testcontainer). Cero mocks
  de cliente de DB. La divergencia mock-vs-real ha sido fuente de incidentes
  antes.">
- **<Regla 2>.** <Ejemplo: "Solo se mockea I/O fuera del proceso: HTTP
  clients a terceros, colas, S3, webhooks salientes.">
- **<Regla 3>.** <Ejemplo: "Si una dependencia no es I/O externo, no se
  mockea. Punto.">

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

> Qué se considera "unit test" en este proyecto, qué cubre cada uno y cómo
> se ejecutan. Tienes que poder leer esto y saber, sin abrir código, qué
> esperas que tenga un PR nuevo.

Toda unidad pública con lógica propia (<services / handlers / funciones
puras>) tiene su test que:

1. Cubre el camino feliz.
2. Cubre al menos un camino de error si la función puede fallar.
3. <Regla específica de tu stack — p. ej. "Si toca persistencia, lo hace
   contra DB real vía testcontainer">.

Estructura mínima:

```<lenguaje>
<bloque describe/it o equivalente>
  <test camino feliz>
  <test camino error con assert del tipo de error concreto>
```

Comando:
```bash
<comando para ejecutar unit tests>
```

### Nivel 2 — E2E / integración (obligatorio si aplica)

> Si tu proyecto expone una superficie externa (HTTP, CLI, gRPC, cola),
> describe aquí cómo se verifica esa superficie end-to-end.

Cada <endpoint / comando / handler> nuevo o modificado tiene un test e2e
que:

1. <Arranca el sistema real (no mocks internos)>
2. <Configura el mismo middleware / pipeline que producción>
3. <Usa dependencias reales vía testcontainer o sandbox>
4. <Llama a la superficie externa y verifica respuesta + efecto observable>

Esqueleto:

```<lenguaje>
<ejemplo de test e2e mínimo>
```

Cada e2e cubre, como mínimo: camino feliz + un error de validación o de
dominio relevante.

Comando:
```bash
<comando para ejecutar e2e>
```

### Nivel 3 — Smoke manual (opcional pero recomendado)

> Cuándo merece la pena levantar la app real y golpearla a mano antes de
> cerrar la tarea. Útil para descubrir cosas que el test ignora (CORS,
> headers, formato de error, latencia inesperada).

Antes de cerrar la sesión, <levanta la app / ejecuta el CLI / abre la UI>
y prueba el cambio contra un entorno efímero:

```bash
<comando para arrancar el sistema en modo dev>
# en otra terminal o navegador
<comando para invocar la funcionalidad nueva>
```

Si el comportamiento difiere de lo que cubre el test, **falta un caso de
test** — no se cierra la tarea hasta añadirlo.

## Anti-patrones (no hacer)

- ❌ **"He añadido el cambio, debería funcionar."** Sin test ejecutable no
  se cierra nada.
- ❌ **Mockear lo que la política de mocking dice que no se mockea.** Si
  toca persistencia y tu política dice "DB real", no hay atajo.
- ❌ **Test que solo comprueba que la función no lanza.** Tiene que
  assertear el resultado o el efecto observable.
- ❌ **E2E que solo verifica el status code / exit code.** El body /
  output es parte del contrato — también se assertea.
- ❌ **Compartir estado entre tests sin reset.** Cada test deja la DB /
  filesystem / cola como la encontró.
- ❌ **Snapshots gigantes de respuestas.** Snapshot mata revisión.
  Assertear campos concretos.
- ❌ **Marcar la tarea como `done` sin pasar `./init.sh`.**

## Verificación final antes de cerrar

```bash
./init.sh
```

Internamente `init.sh` delega los chequeos específicos del proyecto a
`./scripts/check.sh` si existe — define ahí lo que sea relevante para tu
stack (lint + typecheck + unit + e2e + build).

Si `./init.sh` está rojo, **no** se marca nada como `done`. El bloqueo se
anota en `progress/current.md` con el comando que falla y la salida
relevante.
