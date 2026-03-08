import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Este archivo es el entry point del servidor (Node.js).
// El builder de Angular genera dos bundles separados:
//   - browser/ → lo que descarga el usuario
//   - server/ → lo que corre en Node para renderizar el HTML inicial
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
