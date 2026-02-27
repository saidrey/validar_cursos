import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado() && authService.esAdmin()) {
    return true;
  }

  // Usuario autenticado pero sin rol admin → redirigir a sus exámenes
  if (authService.estaAutenticado()) {
    router.navigate(['/admin/mis-examenes']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
