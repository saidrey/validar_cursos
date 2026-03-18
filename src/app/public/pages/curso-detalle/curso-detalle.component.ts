import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso } from '../../../core/models/curso.model';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, A11yModule, NavbarComponent, FooterComponent],
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
  mostrarModal = false;

  // Guarda el elemento que tenía el foco antes de abrir el modal
  // para devolverlo al cerrar (patrón ARIA Dialog obligatorio, WCAG 2.4.3)
  private modalTrigger: HTMLElement | null = null;

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

  abrirModal() {
    // Captura el elemento activo ANTES de abrir el modal.
    // document.activeElement es el botón que el usuario presionó.
    this.modalTrigger = document.activeElement as HTMLElement;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    // setTimeout(0) espera un tick para que Angular elimine el modal del DOM
    // antes de devolver el foco. Sin el setTimeout, el elemento al que
    // queremos hacer focus puede estar oculto/destruido todavía.
    setTimeout(() => this.modalTrigger?.focus(), 0);
  }

  parsearResumen(resumen: string): string[] {
    if (!resumen) return [];
    return resumen.split('\n').filter(line => line.trim().length > 0);
  }
}
