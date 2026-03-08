import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';

import { appConfig } from './app.config';

// Config exclusiva del servidor: se fusiona con appConfig (no lo reemplaza).
// En Angular 18 el motor SSR (CommonEngine) lo activa el builder automáticamente.
// No se necesitan providers adicionales aquí: el punto de entrada server.ts y
// el angular.json (server + ssr.entry) son suficientes para que el builder
// genere el bundle de servidor.
//
// Nota Angular 19+: esa versión introduce provideServerRendering() y
// provideServerRoutesConfig() desde '@angular/ssr', junto con RenderMode
// por ruta. En v18 esas APIs no existen todavía.
const serverConfig: ApplicationConfig = {
  providers: []
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
