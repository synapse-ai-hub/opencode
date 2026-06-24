# Compilar y Usar opencode

## Prerrequisito: Bun

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

Verificar: `bun --version` (debe ser ≥ 1.3.14)

Si el instalador falla por el perfil de PowerShell o por `LIB environment variable`, descargar el zip manual:

```powershell
# Crear carpeta
mkdir D:\bun -Force

# Descargar
irm https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip -OutFile D:\bun\bun.zip

# Extraer
Expand-Archive -Path D:\bun\bun.zip -DestinationPath D:\bun\ -Force
Move-Item D:\bun\bun-windows-x64\bun.exe D:\bun\bun.exe -Force
Remove-Item D:\bun\bun.zip -Force
Remove-Item D:\bun\bun-windows-x64 -Recurse -Force

# Probar
D:\bun\bun.exe --version
```

## Compilar

```powershell
# Primero instalar dependencias (desde la raíz del repo)
cd D:\opencode
bun install --ignore-scripts

# Luego compilar (desde el package)
cd D:\opencode\packages\opencode
bun run build --single
```

Si el build falla con `error: Could not resolve: ./v3/external.js` de `zod`, limpiar el cache de bun y reinstalar:

```powershell
Remove-Item -Recurse -Force D:\opencode\node_modules\.bun
cd D:\opencode\packages\opencode
bun install --ignore-scripts
```

Duración: ~1-2 minutos (instalación: ~2-5 minutos la primera vez).

## El ejecutable

Después de compilar está en:

```
D:\opencode\packages\opencode\dist\opencode-windows-x64\bin\opencode.exe
```

(En versiones anteriores era `dist\win32-x64\bin\opencode.exe`)

El smoke test pasa automáticamente después del build:

```
Smoke test passed: 0.0.0-dev-YYYYMMDDHHMM
```

Verificar: `bun --version` (debe ser ≥ 1.3.14)

## Compilar

```powershell
cd D:\opencode\packages\opencode
bun run build --single
```

Duración: ~1-2 minutos.

## El ejecutable

Después de compilar está en:

```
D:\opencode\packages\opencode\dist\win32-x64\bin\opencode.exe
```

## Cómo usarlo

**Opción A — Reemplazar el instalado:**
```powershell
# Copiar al directorio donde está el opencode original
copy D:\opencode\packages\opencode\dist\win32-x64\bin\opencode.exe C:\ruta\donde\este\instalado\
```

**Opción B — Ejecutar directo desde el dist:**
```powershell
D:\opencode\packages\opencode\dist\win32-x64\bin\opencode.exe
```

**Opción C — Agregar al PATH:**
Agregar `D:\opencode\packages\opencode\dist\win32-x64\bin\` a las variables de entorno del sistema. Después solo llamar `opencode` desde cualquier lado.

## Desarrollo (sin compilar)

Si solo querés probar cambios sin compilar:

```powershell
cd D:\opencode\packages\opencode
bun run dev
```

Esto corre el TypeScript directo con hot-reload. Los cambios en `.ts` y `.txt` se reflejan al reiniciar.
