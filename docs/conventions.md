# Convenciones de código

> **Plantilla.** Rellena con las convenciones reales de tu proyecto.
> Homogeneidad extrema. La IA predice mejor cuando el repositorio se parece
> a sí mismo en todas partes. Si una convención no está aquí, **no es
> oblitatoria** — los revisores solo deben rechazar cambios que violen
> reglas escritas.

## Estilo del lenguaje

- **Lenguaje y versión:** <p. ej. TypeScript 5.x con `strict: true`, Python 3.12, Go 1.22, Rust 1.78>
- **Target / runtime:** <p. ej. Node 20 LTS, CPython 3.12, JVM 21>
- **Formato:** <herramienta + reglas. P. ej. Prettier (ancho 100, comillas simples)>
- **Linter:** <herramienta + ruleset. P. ej. ESLint con recommended-type-checked>
- **Imports:** <orden y agrupación. P. ej. builtins, externos, alias del proyecto, relativos>
- **Strings / tipos / control flow:** <reglas específicas del lenguaje que importen>
- **Tipado:** <dónde es obligatorio explicitar tipos y dónde se infiere>
- **Prohibido:** <p. ej. `any`, `var`, mutación global, importaciones circulares>

## Nombres

| Tipo                       | Convención        | Ejemplo                       |
|----------------------------|-------------------|-------------------------------|
| Ficheros                   | `<convención>`    | `<ejemplo>`                   |
| Tipos / Clases             | `<convención>`    | `<ejemplo>`                   |
| Funciones / variables      | `<convención>`    | `<ejemplo>`                   |
| Constantes de módulo       | `<convención>`    | `<ejemplo>`                   |
| Privadas                   | `<convención>`    | `<ejemplo>`                   |
| Enums                      | `<convención>`    | `<ejemplo>`                   |

### Sufijos por rol (si aplica)

> Si tu stack tiene roles bien definidos (controller, service, repository,
> view, handler...), documenta aquí los sufijos esperados de fichero y
> clase. Si no aplica, borra esta sección.

| Rol                    | Sufijo de fichero       | Sufijo de tipo      |
|------------------------|-------------------------|---------------------|
| <Rol>                  | `<sufijo>`              | `<sufijo>`          |

## Estructura de archivo

> Cómo se organiza un módulo / paquete / dominio. Pon un ejemplo concreto
> de cómo se ve un dominio bien estructurado.

```
src/<dominio>/
├── <fichero1>
├── <fichero2>
└── <subcarpeta>/
    └── <fichero>
```

<Reglas sobre orden de imports, cabecera de fichero, separadores, etc.>

## Validación de entradas

> Cómo se validan las entradas que cruzan la frontera del sistema (HTTP,
> CLI args, mensajes de cola, archivos externos). El objetivo: no procesar
> nunca datos sin tipo conocido.

- <Regla 1>
- <Regla 2>
- <Ejemplo de código>

## Inyección de dependencias / acoplamiento

- <Cómo se resuelven dependencias. P. ej. constructor injection, FX,
  contenedores DI, top-level wiring en `main`.>
- <Qué está prohibido: singletons globales, `new` directo de servicios,
  acceso a estado global desde lógica de dominio.>

## Tests

- **Framework:** <p. ej. Jest, pytest, go test, cargo test>
- **Ubicación:** <p. ej. junto al fichero probado, en `tests/` separado>
- **Naming:** <p. ej. `<unidad>.spec.ts`, `test_<unidad>.py`>
- **Estructura mínima de un test:** <describe → it / arrange-act-assert>
- **Aislamiento:** <cómo se garantiza que los tests no comparten estado>
- **Mocks:** <qué se mockea y qué no. Ver `verification.md` para detalles>

## Manejo de errores

> Cómo se modelan errores en este proyecto. Lenguajes con excepciones,
> con `Result`/`Either`, con error codes... cada uno tiene reglas distintas.

- <Dónde se definen los tipos de error>
- <Quién los lanza / produce>
- <Quién los traduce a la respuesta externa (HTTP status, exit code, mensaje)>
- <Qué NO se hace: `try/catch` defensivo, swallow silencioso, stack traces al cliente>
- <Ejemplo de código>

## Logging

> Política de logs. Si esto no se documenta, cada agente inventará su propio
> estilo y el repo acaba con `console.log`, `print`, `fmt.Println` y un logger
> estructurado a medias.

- **Logger:** <librería + por qué>
- **Configuración:** <dónde se registra, qué se redacta, qué se incluye automático>
- **Niveles:** <cuándo usar error/warn/info/debug>
- **Estructurado vs string:** <regla. P. ej. "datos como campo aparte, nunca concatenados al mensaje">
- **Prohibido en `src/`:** <p. ej. `console.log`, `print`, `fmt.Println` fuera del logger oficial>

## Asincronía / concurrencia

> Si el lenguaje tiene un modelo asíncrono propio (async/await, goroutines,
> threads, actors), documenta cómo se usa aquí.

- <Reglas: cómo se compone, qué patrones se evitan, cómo se manejan errores async>
- <Linter rule específica si aplica (p. ej. `no-floating-promises`)>

## Comentarios

Por defecto **no** se escriben. Solo se permiten cuando explican un *por qué*
no obvio (p. ej. workaround documentado, invariante sutil, decisión de
diseño que un nombre no puede expresar). Los nombres deben hacer el resto.

<Si tu proyecto exporta una librería pública, documenta aquí el formato de
docstrings/JSDoc/rustdoc esperado en la API exportada.>
