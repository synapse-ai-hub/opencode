# Instalación, Build y Desarrollo de opencode

---

## Stack tecnológico

| Componente | Tecnología |
|------------|-----------|
| **Lenguaje** | TypeScript 5.x (ESM estricto) |
| **Runtime** | Bun 1.3.14+ |
| **Package manager** | Bun (workspaces nativos) |
| **Framework de efectos** | Effect 3.x |
| **UI de terminal** | SolidJS + @opentui/solid |
| **Base de datos** | SQLite (via drizzle-orm + Effect) |
| **AI SDK** | @ai-sdk/* (proveedores) + @opencode-ai/llm (runtime nativo) |
| **Linting** | Oxlint |
| **Monorepo** | Turborepo (bun turbo) |

---

## Prerrequisitos

1. **Bun** ≥ 1.3.14:
   ```powershell
   # Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"
   
   # Verificar
   bun --version
   ```

2. **Git** (para clonar)

3. **Windows**: tener configurado `C++ Build Tools` o `Visual Studio Build Tools`
   (necesario para compilar dependencias nativas como `@parcel/watcher`)

---

## Instalación

```powershell
# 1. Clonar (si no está)
git clone https://github.com/opencode-ai/opencode.git
cd opencode

# 2. Instalar dependencias (desde la raíz del repo)
bun install

# 3. Post-install (parchea node-pty)
bun run postinstall
```

Duración aproximada: 2-5 minutos (depende de la conexión y la compilación de bins nativos).

---

## Desarrollo (modo dev)

El modo dev ejecuta el código TypeScript directamente **sin compilar**,
gracias a Bun:

```powershell
# Desde D:\opencode
bun run dev

# O directamente desde el package
cd packages/opencode
bun run dev
```

Esto ejecuta: `bun run --conditions=browser ./src/index.ts`

**Hot-reload**: Bun reinicia automáticamente al detectar cambios en archivos `.ts`.

### Flags útiles para dev

```powershell
# Con flags experimentales
OPENCODE_EXPERIMENTAL=true bun run dev

# Con logging de tokens
OPENCODE_DEBUG_TOKENS=true bun run dev

# Con un directorio específico como workspace
cd /ruta/a/mi/proyecto
bun run dev   # opencode usa el CWD como workspace
```

---

## Build (compilar binario)

```powershell
cd packages/opencode

# Build para la plataforma actual (rápido)
bun run build --single

# Build para todas las plataformas (lento, requiere cross-compile)
bun run build

# Flags
bun run build --single --sourcemaps   # Con source maps
bun run build --single --skip-install # Si ya instalaste
```

**Output**: `packages/opencode/dist/{os}-{arch}/bin/opencode`

El build usa `bun build --compile` que:
1. Compila TypeScript a JS
2. Empaqueta todo (incluyendo los `.txt` que se importan como strings)
3. Genera un binario nativo standalone

---

## Type checking

```powershell
# Desde cualquier package
cd packages/opencode
bun run typecheck

# O desde la raíz (todos los packages)
bun run typecheck
```

Usa `tsgo` (no `tsc` directamente).

---

## Tests

```powershell
# Desde el package específico (NO desde la raíz)
cd packages/opencode

# Tests unitarios
bun test

# Tests con timeout
bun test --timeout 60000

# Tests de HTTP API
bun run test:httpapi
```

⚠️ **No correr tests desde la raíz** — hay un guard `do-not-run-tests-from-root`.

---

## Estructura del proyecto (solo lo relevante para modificaciones)

```
D:\opencode\
├── packages/
│   ├── opencode/                  ← CÓDIGO PRINCIPAL
│   │   ├── src/
│   │   │   ├── agent/            ← Agentes (build, compaction, explore, etc.)
│   │   │   ├── session/          ← Loop de conversación, compaction, prompts
│   │   │   │   ├── prompt/       ← System prompts (.txt por modelo)
│   │   │   │   ├── compaction.ts ← Servicio de compaction
│   │   │   │   ├── overflow.ts   ← Detección de límite de tokens
│   │   │   │   ├── system.ts     ← System prompt assembly
│   │   │   │   └── message-v2.ts ← Mensajes, filterCompacted
│   │   │   ├── tool/             ← Tools (read, write, edit, etc.)
│   │   │   ├── skill/            ← Skills discovery
│   │   │   └── config/           ← Config (opencode.json parser)
│   │   ├── script/
│   │   │   └── build.ts          ← Build script
│   │   └── package.json
│   ├── core/                     ← Lógica compartida
│   │   └── src/
│   │       └── session/
│   │           └── compaction.ts ← buildPrompt + lógica core
│   └── ...
├── bun.lock
├── bunfig.toml
├── package.json                  ← Root workspace
└── turbo.json
```

---

## Flujo de trabajo típico para modificar

```powershell
# 1. Estar en el directorio del repo
cd D:\opencode

# 2. Hacer cambios en los archivos .ts o .txt

# 3. Verificar type checking
cd packages/opencode
bun run typecheck

# 4. Probar en dev
bun run dev

# 5. Si todo funciona, compilar
bun run build --single
```

---

## Notas importantes

### Archivos .txt

Los `.txt` se importan como strings via Bun:
```typescript
import DESCRIPTION from "./read.txt"  // Bun convierte el .txt a string
```

No hay un paso de build para los `.txt`. Bun los maneja automáticamente
tanto en dev como en compilación.

### Effect Framework

El código usa Effect 3.x para manejo de efectos, errores y concurrencia.
Patterns comunes:
- `Effect.gen(function* () { ... })` — composición de efectos
- `yield* Service.method()` — llamado a servicios
- `Layer.effect(Service, ...)` — construcción de capas DI

### Windows

- El build para Windows usa `win32` como target
- Los paths en Windows se normalizan con `FSUtil.normalizePath()`
- El binario compilado funciona como cualquier `.exe`

### Reemplazar el binario global de npm

Si instalaste opencode globalmente con `npm install -g opencode-ai`, el comando `opencode` en la terminal resuelve a través de `%APPDATA%\npm\opencode.ps1`, que ejecuta:

```
%APPDATA%\npm\node_modules\opencode-ai\bin\opencode.exe
```

Para que tu build modificado se use al escribir `opencode`, copiá el binario compilado encima de ese archivo:

```powershell
copy /y D:\opencode\packages\opencode\dist\opencode-windows-x64\bin\opencode.exe "$env:APPDATA\npm\node_modules\opencode-ai\bin\opencode.exe"
```
