# CI/CD - Integración y Despliegue Continuo

Este documento explica el pipeline de CI/CD configurado para el proyecto Angular, alojado en GitHub y desplegado automáticamente en Hostinger.

---

## ¿Qué es CI/CD?

| Concepto | Significado | En este proyecto |
|---|---|---|
| **CI** – Continuous Integration | Automatizar la compilación y verificación del código ante cada cambio | `npm ci` + `ng build` en cada push |
| **CD** – Continuous Deployment | Desplegar automáticamente el resultado compilado al servidor de producción | Subida de archivos a Hostinger vía FTPS |

El pipeline completo se define en un único archivo: `.github/workflows/deploy.yml`

---

## Herramientas utilizadas

- **GitHub Actions**: plataforma de automatización integrada en GitHub que ejecuta el pipeline
- **SamKirkland/FTP-Deploy-Action**: action de GitHub que transfiere archivos al servidor vía FTP/FTPS
- **Angular CLI (`ng build`)**: compilador del proyecto Angular
- **FTPS** (FTP sobre TLS): protocolo de transferencia de archivos con cifrado, requerido por Hostinger

---

## Flujo completo

```
Developer hace git push
        │
        ▼
GitHub detecta el push en rama main
        │
        ▼
GitHub Actions lanza el runner (ubuntu-latest)
        │
        ├── 1. Checkout del código
        ├── 2. Setup Node.js 20
        ├── 3. npm ci  (instala dependencias)
        ├── 4. ng build --configuration production  (compila Angular)
        ├── 5. Verificación del build (ls dist/)
        └── 6. FTP Deploy → sube archivos a Hostinger
                │
                ▼
        aulavirtualcentrodecompetencia.com ✅
```

---

## CI – Integración Continua

### Qué hace
En cada `git push` a la rama `main`, GitHub Actions:

1. Levanta una máquina virtual limpia con Ubuntu
2. Instala Node.js 20
3. Ejecuta `npm ci` para instalar dependencias de forma reproducible (a diferencia de `npm install`, `npm ci` usa exactamente las versiones del `package-lock.json`)
4. Compila el proyecto con `ng build --configuration production`, que:
   - Minifica y optimiza el código JavaScript
   - Aplica tree-shaking (elimina código no usado)
   - Genera hashes en los nombres de archivos para cache-busting
   - Deja el resultado en `dist/diplomas-app/browser/`
5. Lista los archivos generados para verificar que el build fue exitoso

### Por qué es CI
Cualquier error de compilación (código roto, imports faltantes, errores TypeScript) se detecta automáticamente sin necesidad de compilar manualmente en cada máquina de desarrollo.

---

## CD – Despliegue Continuo

### Qué hace
Una vez que el build de CI es exitoso, la siguiente etapa toma los archivos de `dist/diplomas-app/browser/` y los sube al servidor de Hostinger usando FTPS.

### Protocolo: FTPS (no FTP plano)
Hostinger requiere **FTPS** (FTP con cifrado TLS) en lugar de FTP plano. El log de conexión confirma el cifrado:
```
AUTH TLS → 234 AUTH TLS successful
Control socket is using: TLSv1.3
Login security: TLSv1.3
```

### Credenciales: GitHub Secrets
Las credenciales del servidor FTP **nunca se escriben en el código**. Se almacenan como secrets cifrados en GitHub (**Settings → Secrets and variables → Actions**) y se inyectan en el workflow en tiempo de ejecución:

| Secret | Descripción |
|---|---|
| `FTP_SERVER` | IP del servidor FTP de Hostinger (`147.93.42.249`) |
| `FTP_USERNAME` | Usuario FTP de Hostinger |
| `FTP_PASSWORD` | Contraseña FTP de Hostinger |

### Ruta de destino en el servidor
En Hostinger, la estructura FTP tiene una particularidad: el cliente FTP inicia sesión en el directorio `/public_html/` del usuario, pero los dominios adicionales tienen su web root en una ruta distinta:

```
/                                  ← raíz FTP del usuario
├── public_html/                   ← sitio principal (directorio inicial del FTP)
└── domains/
    └── aulavirtualcentrodecompetencia.com/
        └── public_html/           ← web root del dominio ← aquí se suben los archivos
```

Por eso el `server-dir` usa una ruta **absoluta** (con `/` al inicio) para evitar que el cliente FTP lo interprete como relativo al directorio inicial:
```yaml
server-dir: /domains/aulavirtualcentrodecompetencia.com/public_html/
```

### Sistema de sincronización incremental
El action guarda un archivo `.ftp-deploy-sync-state.json` en el servidor con los hashes de los archivos subidos. En deployments posteriores, **solo sube los archivos que cambiaron**, haciendo el proceso más rápido.

---

## Archivo de configuración completo

`.github/workflows/deploy.yml`:

```yaml
name: Build y Deploy a Hostinger

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Build de producción
        run: npm run build -- --configuration production

      - name: Verificar archivos del build
        run: ls -la ./dist/diplomas-app/browser/

      - name: Deploy via FTPS a Hostinger
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          port: 21
          local-dir: ./dist/diplomas-app/browser/
          server-dir: /domains/aulavirtualcentrodecompetencia.com/public_html/
          log-level: verbose
          exclude: |
            **/.git*
            **/.git*/**
```

---

## Problemas encontrados durante la configuración

| Problema | Causa | Solución |
|---|---|---|
| `ENOTFOUND` al conectar por FTP | El `FTP_SERVER` tenía el prefijo `ftp://` que no debe incluirse | Usar solo la IP: `147.93.42.249` |
| `Timeout` en la conexión | Hostinger bloquea FTP plano, solo acepta FTPS | Agregar `protocol: ftps` y `port: 21` |
| Archivos subidos a la carpeta incorrecta | El FTP inicia en `/public_html/` y la ruta relativa `domains/...` se creaba dentro de ella | Usar ruta absoluta `/domains/aulavirtualcentrodecompetencia.com/public_html/` |
| Action indicaba "0 cambios" sin subir nada | El archivo de estado `.ftp-deploy-sync-state.json` estaba desincronizado con los archivos reales del servidor | Eliminar el archivo de estado para forzar re-subida completa |
