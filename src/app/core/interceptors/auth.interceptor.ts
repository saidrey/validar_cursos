import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // En SSR (Node) no hay storage → las peticiones del servidor van sin token.
  // Eso está bien: el servidor solo renderiza páginas públicas.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  // Obtener token del localStorage o sessionStorage (según si marcó "Recordarme")
  // sessionStorage tiene prioridad (sesión activa sin "recuérdame")
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
