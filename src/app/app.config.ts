import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      // withFetch() es obligatorio en SSR: XMLHttpRequest no existe en Node.js.
      // En el browser sigue funcionando igual, es retrocompatible.
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    ),
    // NOTA sobre provideClientHydration():
    // En Angular 18, incluir provideClientHydration() en el config compartido
    // browser+servidor provoca un conflicto de providers: HttpTransferCache
    // necesita el token DOCUMENT durante la inicialización SSR, pero
    // platform-browser registra su propia factory de DOCUMENT que crashea en Node.js.
    // Angular 19+ resuelve esto separando los providers de hydration del config servidor.
    // Por ahora el SSR funciona sin hydration: el servidor genera el HTML completo
    // y el browser lo recibe; Angular reconstruye el DOM en el cliente (sin parpadeo
    // notable en la mayoría de casos gracias al lazy loading).
    provideAnimationsAsync()
  ]
};
