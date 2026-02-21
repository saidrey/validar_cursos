import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  usuario = this.authService.obtenerUsuario();

  accesos = [
    {
      titulo: 'Cursos',
      descripcion: 'Crear, editar y eliminar cursos del catálogo',
      icon: 'school',
      ruta: '/admin/cursos',
      color: '#137fec',
      bg: '#e0f2fe'
    },
    {
      titulo: 'Diplomas',
      descripcion: 'Gestionar diplomas emitidos a estudiantes',
      icon: 'card_membership',
      ruta: '/admin/diplomas',
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    {
      titulo: 'Personas',
      descripcion: 'Administrar usuarios y roles del sistema',
      icon: 'people',
      ruta: '/admin/usuarios',
      color: '#059669',
      bg: '#d1fae5'
    }
  ];
}
