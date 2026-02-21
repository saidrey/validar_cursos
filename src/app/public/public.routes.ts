import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./pages/cursos/cursos.component').then(m => m.CursosComponent)
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./pages/curso-detalle/curso-detalle.component').then(m => m.CursoDetalleComponent)
  },
  {
    path: 'validar',
    loadComponent: () => import('./pages/validar/validar.component').then(m => m.ValidarComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  }
];
