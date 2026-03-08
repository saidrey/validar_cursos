import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, provideServerRoutesConfig } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

// Config exclusiva del servidor: se fusiona con appConfig (no lo reemplaza).
// provideServerRendering() activa el motor de renderizado en Node.
// provideServerRoutesConfig() asigna el renderMode por ruta.
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
