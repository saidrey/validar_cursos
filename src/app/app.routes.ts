import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  // Rutas privadas (requieren autenticación)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./private/private.routes').then(m => m.PRIVATE_ROUTES)
  },
  // Redirección por defecto
  {
    path: '**',
    redirectTo: ''
  }
];
