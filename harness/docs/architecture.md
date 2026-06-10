# Arquitectura — Qué significa "hacer un buen trabajo"

> **Plantilla.** Rellena las secciones marcadas con `<...>` con la realidad
> de tu proyecto. Este documento define el estándar de calidad. Los agentes
> revisores evalúan código contra este archivo. **Si no está aquí, no es un
> requisito.**

## Contexto

<Describe en 2-4 frases qué hace el proyecto, quién lo usa y qué problema
resuelve. Evita jerga interna. Ejemplo: "App web donde el usuario configura
X, el sistema scrapea Y, y devuelve Z.">

<Alcance actual y stack principal. Ejemplo: "API HTTP REST en NestJS +
PostgreSQL (vía Prisma). El módulo de scraping entrará más adelante.">

## Principios

> Lista las decisiones arquitectónicas que un revisor debe poder citar para
> aprobar o rechazar un cambio. No incluyas reglas de estilo (eso va en
> `conventions.md`). Aquí van las decisiones estructurales que, si se
> rompen, justifican un `CHANGES_REQUESTED`.

1. **<Decisión 1>.**
   <Por qué. Ejemplo: "Plain framework, tres capas y solo tres
   (controller → service → repository). No introducir facades, use-cases,
   puertos/adaptadores ni CQRS hasta que un PR concreto demuestre que la
   duplicación lo justifica.">

2. **<Decisión 2>.**
   <Por qué. Ejemplo: "El schema de DB es interno. El contrato externo son
   los DTOs. La API debe poder evolucionar sin tocar la DB, y la DB sin
   romper la API.">

3. **<Decisión 3>.**
   <Por qué. Ejemplo: "Errores explícitos del dominio en
   `<dominio>/<dominio>.errors.ts`. Un filter global los traduce a HTTP.">

4. **<Decisión 4>.**
   <Por qué. Ejemplo: "Inyección por constructor. Nada de singletons
   manuales ni acceso global al cliente de DB.">

5. **<Decisión 5>.**
   <Por qué. Ejemplo: "Un módulo, un dominio. Los módulos se comunican solo
   por su API pública (`exports`).">

## Flujo de datos

> Diagrama ASCII del camino que recorre una request típica desde la entrada
> hasta la persistencia y vuelta. Mantenlo simple: 5-7 capas como mucho.

```
<entrada>
    │
    ▼
<capa 1>   ← <qué hace>
    │
    ▼
<capa 2>   ← <qué hace>
    │
    ▼
<capa 3>   ← <qué hace>
    │
    ▼
<persistencia / salida>
```

<Cualquier nota sobre el flujo: cómo se mapean entradas/salidas, dónde se
captan errores, qué se loguea automáticamente.>

## Qué NO hacer

> Anti-patrones concretos. Cada bullet debe ser falsable: un revisor tiene
> que poder señalar una línea de código y decir "esto viola la regla X".

- **No <anti-patrón 1>.** <Por qué duele cuando se hace.>

- **No <anti-patrón 2>.** <Por qué duele cuando se hace.>

- **No <anti-patrón 3>.** <Por qué duele cuando se hace.>

- **No <anti-patrón 4>.** <Por qué duele cuando se hace.>

- **No <anti-patrón 5>.** <Por qué duele cuando se hace.>

---

> **Cómo evoluciona este documento.** Cuando una decisión nueva aparece en
> un PR y se acepta como regla del proyecto, se añade aquí. Cuando una regla
> deja de aplicar (cambio de stack, refactor grande), se borra. Mantener este
> fichero corto y vigente importa más que tenerlo completo.
