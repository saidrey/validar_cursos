import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { SeoService } from '../../../core/services/seo.service';
import { Curso } from '../../../core/models/curso.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit {
  private cursosService = inject(CursosService);
  private seo = inject(SeoService);

  cursos: Curso[] = [];
  cargando = true;

  ngOnInit() {
    // Meta estático de la sección — no depende de datos del backend.
    // Se aplica inmediatamente para que el crawler vea el title/description
    // desde el primer byte del HTML del servidor.
    this.seo.setPage({
      title: 'Catálogo de Cursos',
      description: 'Explora nuestro catálogo de cursos certificados en gestión pública, liderazgo, derecho y más. Formación online con diploma verificable.',
      keywords: 'catálogo cursos, cursos online, formación certificada, gestión pública, liderazgo'
    });

    this.cargarCursos();
  }

  cargarCursos() {
    this.cursosService.obtenerCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cargando = false;

        // JSON-LD ItemList: Google puede mostrar los cursos como lista
        // enriquecida en los resultados de búsqueda de la página de catálogo.
        // Se aplica después de cargar porque necesitamos los datos reales.
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'Catálogo de Cursos — Aula Virtual',
          'numberOfItems': data.length,
          'itemListElement': data.map((curso, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': curso.nombre,
            'url': `${environment.siteUrl}/cursos/${curso.id}`
          }))
        });
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.cargando = false;
      }
    });
  }
}
