# CHECKPOINTS.md — Criterios objetivos de "estado final correcto"

> **Plantilla.** Esta es la lista que el `reviewer` recorre antes de aprobar
> una tarea. Cada checkpoint debe ser **objetivamente verificable**: el
> revisor lee el código y el resultado de `./init.sh` y decide `[x]` o `[ ]`
> sin opinar. Si un checkpoint es subjetivo ("código limpio"), está mal
> escrito — reformúlalo en términos comprobables ("no hay funciones de más
> de 50 líneas", "todo public API tiene test").

## Cómo se usa

- El `reviewer` recorre esta lista para cada tarea cerrada.
- Marca `[x]` si se cumple, `[ ]` si no, indicando archivo y línea cuando
  falle.
- Cualquier `[ ]` ⇒ `CHANGES_REQUESTED`.
- Esta lista crece con la experiencia del proyecto. Cuando un bug se cuela,
  se añade el checkpoint que lo habría atrapado.

## Checkpoints generales (válidos en cualquier proyecto)

- **C1.** `./init.sh` termina en verde.
- **C2.** Todos los archivos nuevos siguen las convenciones de `docs/conventions.md`.
- **C3.** Cada unidad pública nueva o modificada en `src/` tiene su test.
- **C4.** La tarea respeta `docs/architecture.md` (capas, dependencias, módulos).
- **C5.** `progress/current.md` está actualizado y refleja lo que se hizo.
- **C6.** No quedan TODO/FIXME sin contexto, `console.log`/`print` de debug, ni archivos temporales.
- **C7.** El `acceptance` de la tarea (en `feature_list.json` / `hotfix_list.json`) se cumple punto por punto.

## Checkpoints específicos del proyecto

> Añade aquí los que tu stack y dominio justifiquen. Ejemplos posibles:

- **C8.** <p. ej. "Ninguna entidad de Prisma se devuelve desde un controller."> 
- **C9.** <p. ej. "Toda operación multi-tabla está envuelta en `$transaction`."> 
- **C10.** <p. ej. "Ningún servicio importa otro módulo saltándose el `exports`."> 
- **C11.** <p. ej. "Todo endpoint nuevo tiene su e2e con assert de body."> 
- **C12.** <p. ej. "No hay `any` en código nuevo de TypeScript."> 

> **Regla práctica:** mantén esta lista corta (10-15 ítems). Si se vuelve
> inmanejable, conviértela en checks automatizados dentro de `./scripts/check.sh`
> y deja en CHECKPOINTS.md solo las cosas que solo un ojo humano (o de modelo)
> puede juzgar.
