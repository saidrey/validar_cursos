import { Routes } from '@angular/router';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cursos',
        loadComponent: () => import('./pages/gestion-cursos/gestion-cursos.component').then(m => m.GestionCursosComponent)
      },
      {
        path: 'diplomas',
        loadComponent: () => import('./pages/gestion-diplomas/gestion-diplomas.component').then(m => m.GestionDiplomasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
      }
    ]
  }
];
