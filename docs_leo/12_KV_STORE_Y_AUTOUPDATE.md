# KV Store y Auto-Update: Problemas y Soluciones

> **TL;DR**: Dos bugs de diseño:
> 1. `kv.set()` escribía TODO el store al archivo en cada cambio, pisando edits externos
> 2. El auto-update reemplaza el exe compilado sin preguntar

---

## 1. KV Store (`kv.json`)

### ¿Dónde está?

```
C:\Users\Leonardo\.local\state\opencode\kv.json
```

En Windows, `xdgState` resuelve a `~/.local/state` (NO a `%APPDATA%` ni `%LOCALAPPDATA%`).
Esto viene de `packages/core/src/global.ts`:

```typescript
import { xdgState } from "xdg-basedir"
const state = path.join(xdgState!, "opencode")
```

`xdgState` en Windows = `path.join(os.homedir(), '.local', 'state')` = `C:\Users\Leonardo\.local\state`.

### Implementación

`packages/tui/src/context/kv.tsx` — ~66 líneas.

Usa `createStore` de SolidJS + escritura asíncrona con Flock locking.

### El Bug Original

Cada `kv.set()` capturaba el store ENTERO con `structuredClone(unwrap(store))` y lo escribía completo al archivo:

```typescript
// Código original (líneas 54-62)
set(key: string, value: any) {
  setStore(key, value)
  const snapshot = structuredClone(unwrap(store))  // ← TODO el store
  write = write
    .then(() => Flock.withLock(lock, () => writeJsonAtomic(file, snapshot)))  // ← Todo al archivo
}
```

**Problema**: Cualquier `kv.set()` para cualquier key terminaba pisando el archivo completo.
Si un componente llamaba `kv.set("theme_mode", undefined)` (como hace `theme.tsx` en init),
sobrescribía `scrollbar_visible` con el valor que tuviera en memoria en ese momento.

### Escenario de Reversión

```
1. Usuario edita kv.json → scrollbar_visible: true
2. Abre opencode
3. Async read arranca (tarda ms)
4. signal("scrollbar_visible", true) → default temporal en store
5. ANTES de que termine el async read:
   - Theme init: kv.set("theme_mode", undefined)
   - setStore captura snapshot COMPLETO
   - writeJsonAtomic PISA el archivo
6. Async read termina → setStore mergea datos del archivo
7. Store = true, pero archivo = false (pisado en paso 5)
8. Próximo inicio → archivo tiene false
```

### El Fix

```typescript
// Código fixeado
set(key: string, value: any) {
  setStore(key, value)
  const resolved = store[key]  // valor resuelto (post-setStore)
  write = write
    .then(() => Flock.withLock(lock, async () => {
      // Lee estado actual del archivo
      let data: Record<string, unknown>
      try {
        data = await readJson<Record<string, unknown>>(file)
      } catch {
        data = {}
      }
      // SOLO actualiza la key que cambiaron
      data[key] = resolved
      return writeJsonAtomic(file, data)
    }))
}
```

Cambios:
1. **NO captura todo el store** — solo lee la key resuelta post-setStore
2. **LEE el archivo primero** — preserva edits externos
3. **ESCRIBE solo la key modificada** — no pisa las demás

### Nota sobre `setStore` con funciones updater

Cuando se llama `setShowScrollbar((prev) => !prev)`, el setter de `kv.signal()` pasa
la función a `result.set()`. `setStore(key, value)` de SolidJS resuelve la función
sincrónicamente. Después de eso, `store[key]` tiene el valor resuelto (boolean), no la función.

### Archivos involucrados

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `packages/tui/src/context/kv.tsx` | 1-78 | Implementación del KV store |
| `packages/tui/src/util/persistence.ts` | 1-33 | readJson, writeJsonAtomic |
| `packages/tui/src/routes/session/index.tsx` | 258, 728-734, 1171-1175 | Scrollbar signal, toggle, rendering |
| `packages/tui/src/config/keybind.ts` | 81, 286 | Keybind `scrollbar_toggle: "none"` |

---

## 2. Auto-Update

### ¿Por qué se reemplaza el exe?

El auto-update se ejecuta en segundo plano al iniciar el TUI:

```typescript
// packages/opencode/src/cli/tui/worker.ts, línea 61
await upgrade().catch(() => {})
```

### Detección del método de instalación

`packages/opencode/src/installation/index.ts` (líneas 186-218):

```typescript
method: Effect.fn("Installation.method")(function* () {
  // Si execPath contiene .opencode/bin o .local/bin → método "curl"
  if (process.execPath.includes(path.join(".opencode", "bin"))) return "curl"
  // Si no, ejecuta npm list -g --depth=0
  // Si encuentra "opencode-ai" en el output → método "npm"
  // ...
})
```

El flujo típico:
1. `process.execPath` = `%APPDATA%\npm\node_modules\opencode-ai\bin\opencode.exe`
2. NO contiene `.opencode/bin` → descarta "curl"
3. Ejecuta `npm list -g --depth=0` → encuentra "opencode-ai"
4. Método = "npm"
5. `npm install -g opencode-ai@latest` → **pisa el exe**

### Cómo desactivarlo

En `opencode.json` (en `C:\Users\Leonardo\.config\opencode\opencode.json` o el del proyecto):

```json
{
  "autoupdate": false
}
```

O en código, modificando `packages/opencode/src/cli/upgrade.ts` línea 10:

```typescript
if (config.autoupdate === false || Flag.OPENCODE_DISABLE_AUTOUPDATE) return
```

### Los 3 paths de exe

| Binary | Path | Uso |
|--------|------|-----|
| npm global | `%APPDATA%\npm\node_modules\opencode-ai\bin\opencode.exe` | Lo que ejecuta `opencode` en terminal |
| curl install | `C:\Users\Leonardo\.opencode\bin\opencode.exe` | Instalación alternativa |
| compilado | `D:\opencode\packages\opencode\dist\opencode-windows-x64\bin\opencode.exe` | Output del build |

### Archivos involucrados

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `packages/opencode/src/cli/upgrade.ts` | 1-53 | Chequeo de actualización al arrancar |
| `packages/opencode/src/cli/tui/worker.ts` | 59-61 | Disparador del upgrade check |
| `packages/opencode/src/installation/index.ts` | 186-218 | Detección de método de instalación |
| `packages/core/src/global.ts` | 1-88 | Paths globales (state, data, bin, etc.) |

---

## 3. Resumen de paths en Windows

| Concepto | Path |
|----------|------|
| **kv.json** (scrollbar) | `C:\Users\Leonardo\.local\state\opencode\kv.json` |
| **Exe npm global** | `%APPDATA%\npm\node_modules\opencode-ai\bin\opencode.exe` |
| **Exe curl install** | `C:\Users\Leonardo\.opencode\bin\opencode.exe` |
| **Exe compilado** | `D:\opencode\packages\opencode\dist\opencode-windows-x64\bin\opencode.exe` |
| **Config** | `C:\Users\Leonardo\.config\opencode\opencode.json` |
| **Data** | `C:\Users\Leonardo\.local\share\opencode\` |
| **Cache** | `C:\Users\Leonardo\.local\share\opencode\cache\` |

---

## 4. Próximos Pasos (Pendientes)

- [ ] Desactivar auto-update en el `opencode.json`
- [ ] Compilar y reemplazar el exe en npm global
- [ ] Verificar que kv.json no se revierte después de usar la app
- [ ] El Prompt Fidelity Gate para agente individual (T2) — ver `refactor/04_T2_PROMPT_FIDELITY.md`
