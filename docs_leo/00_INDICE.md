# Índice de Documentación — opencode

> Repositorio: `D:\opencode`  
> Rama por defecto: `dev`  
> Versión: 1.17.9  
> Runtime: Bun (TypeScript ESM)

---

## Documentos

| Archivo | Descripción |
|---------|-------------|
| `01_TOOLS_TXT_INYECCION.md` | Cómo y dónde se inyectan los archivos `.txt` en las tools |
| `02_SYSTEM_PROMPTS.md` | Cómo se ensambla el system prompt (archivos `.txt` por modelo) |
| `03_AGENTES.md` | Arquitectura de agentes (built-in, subagentes, permisos) |
| `04_SKILLS.md` | Sistema de skills: descubrimiento, carga, formato |
| `05_TOOL_REGISTRY.md` | Cómo se registran, inicializan y exponen las tools al LLM |
| `06_BUILD_SYSTEM.md` | Cómo se compila el binario con `bun build --compile` |
| `07_FLUJO_PROMPT.md` | Flujo completo: desde que el usuario escribe hasta que el LLM responde |
| `08_ESTRUCTURA_GENERAL.md` | Mapa general del repo y los packages |
| `09_COMPACTACION_ACTUAL.md` | Cómo funciona el sistema de compaction HOY |
| `10_NUEVO_SISTEMA_COMPACTACION_PROPUESTA.md` | Propuesta: CoD + sliding window + preguntar usuario |
| `11_INSTALACION_Y_BUILD.md` | Cómo instalar, compilar y desarrollar |

---

## Propósito

Esta documentación está hecha para que **Leo** pueda modificar el comportamiento de opencode
entendiendo dónde y cómo se definen:
- Las **descripciones de tools** (los `.txt` que ve el LLM)
- Los **system prompts** (personalidad del modelo)
- Los **agentes** (built-in y subagentes)
- Las **skills** (instrucciones dinámicas)
- El **registry** (qué tools están disponibles)
- El **compaction** (cómo funciona hoy y cómo se va a cambiar)
