import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso } from '../../../core/models/curso.model';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './curso-detalle.component.html',
  styleUrl: './curso-detalle.component.css'
})
export class CursoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);

  curso: Curso | null = null;
  cargando = true;
  resumenItems: string[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarCurso(+id);
    }
  }

  cargarCurso(id: number) {
    this.cursosService.obtenerCurso(id).subscribe({
      next: (data) => {
        this.curso = data;
        this.resumenItems = this.parsearResumen(data.resumen);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar curso:', error);
        this.cargando = false;
        this.router.navigate(['/cursos']);
      }
    });
  }

  parsearResumen(resumen: string): string[] {
    if (!resumen) return [];
    return resumen.split('\n').filter(line => line.trim().length > 0);
  }
}
