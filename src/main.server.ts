import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Este archivo es el entry point del servidor (Node.js).
// El builder de Angular genera dos bundles separados:
//   - browser/ → lo que descarga el usuario
//   - server/ → lo que corre en Node para renderizar el HTML inicial
//
// IMPORTANTE Angular 18: bootstrapApplication acepta un 3er parámetro `context`
// con { platformRef }. renderApplication() de @angular/platform-server crea el
// platformServer y lo pasa aquí; si lo ignoramos, bootstrapApplication crea un
// platformBrowser (con DOCUMENT del browser) que falla en Node.js con
// "document is not defined". Al reenviarlo, se usa el platformServer que ya
// tiene el DOCUMENT de domino configurado correctamente.
const bootstrap = (context?: { platformRef?: unknown }) =>
  bootstrapApplication(AppComponent, config, context as never);

export default bootstrap;
