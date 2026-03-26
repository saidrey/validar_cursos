import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { appConfig } from './app.config';

// Config exclusiva del browser: agrega hydration al config compartido.
// provideClientHydration() NO puede estar en app.config.ts (compartido con el servidor)
// porque HttpTransferCache necesita el token DOCUMENT de platform-browser,
// que crashea en Node.js. Al separarlo aquí, el servidor usa solo app.config.ts
// (via app.config.server.ts) y el browser usa este archivo con hydration activo.
const browserConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay())
  ]
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
