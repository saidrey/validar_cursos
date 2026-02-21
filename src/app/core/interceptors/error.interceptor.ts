import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.mensaje || 'Solicitud inválida. Verifica los datos enviados.';
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
            localStorage.removeItem('usuario');
            localStorage.removeItem('token');
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('token');
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = error.error?.mensaje || 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = error.error?.mensaje || 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Por favor intenta más tarde.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Por favor intenta más tarde.';
            break;
          default:
            errorMessage = error.error?.mensaje || 'Ocurrió un error inesperado.';
        }
      }
      
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });
      
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
