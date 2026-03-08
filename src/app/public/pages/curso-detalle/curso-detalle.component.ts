import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { SeoService } from '../../../core/services/seo.service';
import { Curso } from '../../../core/models/curso.model';
import { environment } from '../../../../environments/environment';

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
  private seo = inject(SeoService);

  curso: Curso | null = null;
  cargando = true;
  resumenItems: string[] = [];
  mostrarModal = false;

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

        // Meta tags dinámicos: cada curso tiene su propio título, descripción e imagen.
        // Esto es lo que indexa Google para cada URL /cursos/:id.
        // Sin SSR esto sería inútil — el crawler vería los defaults del index.html.
        this.seo.setPage({
          title: data.nombre,
          description: data.descripcion.length > 155
            ? data.descripcion.substring(0, 152) + '...'
            : data.descripcion,
          keywords: `${data.nombre}, ${data.instructor}, curso online, certificado`,
          image: data.imagen || undefined,
          url: `${environment.siteUrl}/cursos/${data.id}`,
          type: 'product'
        });

        // Schema.org Course: el más valioso para una plataforma educativa.
        // Google puede mostrar rich snippets con precio, instructor y duración
        // directamente en los resultados de búsqueda (SERP), aumentando el CTR.
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Course',
          'name': data.nombre,
          'description': data.descripcion,
          'url': `${environment.siteUrl}/cursos/${data.id}`,
          'image': data.imagen,
          'provider': {
            '@type': 'Organization',
            'name': 'Aula Virtual',
            'url': environment.siteUrl
          },
          'instructor': {
            '@type': 'Person',
            'name': data.instructor
          },
          'offers': {
            '@type': 'Offer',
            'price': data.precio,
            'priceCurrency': 'COP',
            'availability': 'https://schema.org/InStock',
            'url': `${environment.siteUrl}/cursos/${data.id}`
          },
          'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'online',
            'duration': data.duracion
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar curso:', error);
        this.cargando = false;
        this.router.navigate(['/cursos']);
      }
    });
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  parsearResumen(resumen: string): string[] {
    if (!resumen) return [];
    return resumen.split('\n').filter(line => line.trim().length > 0);
  }
}
