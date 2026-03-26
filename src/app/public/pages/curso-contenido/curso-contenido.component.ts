import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { SeoService } from '../../../core/services/seo.service';
import { Curso } from '../../../core/models/curso.model';
import { MarkdownPipe } from '../../../shared/markdown.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-curso-contenido',
  standalone: true,
  imports: [CommonModule, RouterLink, A11yModule, NavbarComponent, FooterComponent, MarkdownPipe],
  templateUrl: './curso-contenido.component.html',
  styleUrl: './curso-contenido.component.css'
})
export class CursoContenidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);

  curso: Curso | null = null;
  cargando = true;
  videoActivo = 0;
  embedUrls: SafeResourceUrl[] = [];
  mostrarModalExamen = false;

  private modalTrigger: HTMLElement | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cursosService.obtenerCurso(+id).subscribe({
        next: (data) => {
          this.curso = data;
          this.embedUrls = [data.video_url_1, data.video_url_2]
            .filter((u): u is string => !!u && u.trim() !== '')
            .map(url => this.getEmbedUrl(url.trim()))
            .filter(embed => embed !== '')
            .map(embed => this.sanitizer.bypassSecurityTrustResourceUrl(embed));
          this.cargando = false;

          // URL canónica apunta al detalle (/cursos/:id), no al contenido.
          // Así Google consolida el ranking en la página de venta del curso,
          // no en la de contenido que está detrás de autenticación parcial.
          this.seo.setPage({
            title: `${data.nombre} — Contenido`,
            description: `Accede al contenido completo de "${data.nombre}". Videos, material y examen del curso impartido por ${data.instructor}.`,
            image: data.imagen || undefined,
            url: `${environment.siteUrl}/cursos/${data.id}`,
            type: 'article'
          });
        },
        error: () => {
          this.cargando = false;
          this.router.navigate(['/cursos']);
        }
      });
    }
  }

  abrirModalExamen() {
    this.modalTrigger = document.activeElement as HTMLElement;
    this.mostrarModalExamen = true;
  }

  cerrarModalExamen() {
    this.mostrarModalExamen = false;
    setTimeout(() => this.modalTrigger?.focus(), 0);
  }

  cambiarVideo(index: number) {
    this.videoActivo = index;
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  private getEmbedUrl(url: string): string {
    if (!url) return '';
    let videoId = '';

    const watchMatch = url.match(/[?&]v=([^&#]+)/);
    if (watchMatch) videoId = watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch) videoId = shortMatch[1];

    const embedMatch = url.match(/embed\/([^?&#]+)/);
    if (embedMatch) videoId = embedMatch[1];

    const shortsMatch = url.match(/shorts\/([^?&#]+)/);
    if (shortsMatch) videoId = shortsMatch[1];

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }
}
