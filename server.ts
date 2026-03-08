import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// Este archivo solo se usa en producción (`node dist/diplomas-app/server/server.mjs`).
// En desarrollo, `ng serve` levanta su propio servidor con SSR integrado.

export function app(): express.Express {
  const server = express();

  // __dirname no existe en ES modules → lo reconstruimos desde import.meta.url
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Archivos estáticos del build de browser: JS, CSS, assets.
  // maxAge 1y funciona porque Angular genera hashes únicos en los nombres de archivo.
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }));

  // Cualquier ruta que no sea un archivo estático pasa por el motor Angular.
  // El CommonEngine determina si renderiza en servidor o devuelve el shell CSR
  // según lo configurado en app.routes.server.ts.
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }]
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const serverInstance = app();

  serverInstance.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
