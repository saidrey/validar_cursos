import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { appConfig } from './app.config';

// Config exclusiva del servidor: se fusiona con appConfig (no lo reemplaza).
// provideServerRendering() viene de '@angular/platform-server' (no de '@angular/ssr').
// Es el que activa el platform-server de Angular en lugar del platform-browser,
// reemplazando las implementaciones de DOCUMENT, DomAdapter, etc.
// Sin esto, Node.js intenta usar APIs del browser (document, window) y crashea.
//
// Nota Angular 19+: esa versión mueve este provider a '@angular/ssr' directamente
// y agrega provideServerRoutesConfig() para control de RenderMode por ruta.
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
