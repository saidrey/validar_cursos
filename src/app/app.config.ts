import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

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
    // provideClientHydration() conecta el DOM pre-renderizado por el servidor
    // con el runtime de Angular en el browser, evitando que Angular destruya
    // y recree el DOM (lo que causaría parpadeo visual).
    // withEventReplay() captura clicks/eventos que ocurran ANTES de que
    // Angular termine de hidratar, y los reproduce después. Sin esto se pierden.
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync()
  ]
};
