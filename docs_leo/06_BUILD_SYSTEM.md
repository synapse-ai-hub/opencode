# Build System: Cómo se compila opencode

## ¿Dónde está?

`packages/opencode/script/build.ts` — ~243 líneas.

## Tecnología

Se usa `bun build --compile` para generar binarios nativos por plataforma.

## Comando de build

```bash
cd packages/opencode
bun run build          # build completo (todas las plataformas)
bun run build --single  # solo la plataforma actual
```

## Proceso

1. **Generar código**: `script/generate.ts` produce datos de modelos
2. **Instalar dependencias nativas**: `@opentui/core`, `@parcel/watcher`, `@ff-labs/fff-bun`
3. **Build Web UI**: Genera un bundle embebido de la interfaz web
4. **Compilar binario**: `Bun.build()` con opción `compile` para cada target

## Targets de compilación

Se generan binarios para:
- **linux** arm64 + x64 (glibc y musl)
- **darwin** arm64 + x64
- **win32** arm64 + x64

## Entrypoints

```
entrypoints: [
  "./src/index.ts",           // entrypoint principal
  parserWorker,               // tree-sitter worker
  workerPath,                 // TUI worker
  ...(embeddedFileMap ? ["opencode-web-ui.gen.ts"] : []),
]
```

## Variables de compilación (define)

| Variable | Propósito |
|----------|-----------|
| `OPENCODE_VERSION` | Versión del paquete |
| `OPENCODE_CHANNEL` | Canal (release, dev, etc.) |
| `FFF_LIBC` | gnu o musl según target |
| `OTUI_TREE_SITTER_WORKER_PATH` | Ruta al worker de tree-sitter |
| `OPENCODE_WORKER_PATH` | Ruta al worker TUI |

## Nota importante sobre los .txt

Los archivos `.txt` NO se procesan en el build script. Bun los maneja
automáticamente: cuando haces `import DESCRIPTION from "./read.txt"`,
Bun incorpora el contenido como string en el binario compilado.

No hay un paso separado de "empaquetar txt". Todo es manejado por Bun
en tiempo de compilación.

## Estructura del output

```
dist/{name}/
├── bin/
│   └── opencode       ← binario compilado
└── package.json       ← metadatos del target
```
