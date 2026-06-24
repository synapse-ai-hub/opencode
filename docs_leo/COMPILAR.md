# Compilar y Usar opencode

## Prerrequisito: Bun

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
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
