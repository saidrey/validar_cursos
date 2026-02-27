import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cursos',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/gestion-cursos/gestion-cursos.component').then(m => m.GestionCursosComponent)
      },
      {
        path: 'diplomas',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/gestion-diplomas/gestion-diplomas.component').then(m => m.GestionDiplomasComponent)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
      },
      {
        path: 'correos',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/gestion-correos/gestion-correos.component').then(m => m.GestionCorreosComponent)
      },
      {
        path: 'mis-examenes',
        loadComponent: () => import('./pages/mis-examenes/mis-examenes.component').then(m => m.MisExamenesComponent)
      }
    ]
  }
];
