import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  // Rutas privadas (acceso por rol se controla en child routes)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./private/private.routes').then(m => m.PRIVATE_ROUTES)
  },
  // Redirección por defecto
  {
    path: '**',
    redirectTo: ''
  }
];
