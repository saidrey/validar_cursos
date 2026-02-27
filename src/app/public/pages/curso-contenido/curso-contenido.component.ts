import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso } from '../../../core/models/curso.model';
import { MarkdownPipe } from '../../../shared/markdown.pipe';

@Component({
  selector: 'app-curso-contenido',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, MarkdownPipe],
  templateUrl: './curso-contenido.component.html',
  styleUrl: './curso-contenido.component.css'
})
export class CursoContenidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);
  private sanitizer = inject(DomSanitizer);

  curso: Curso | null = null;
  cargando = true;
  videoActivo = 0;
  embedUrls: SafeResourceUrl[] = [];
  mostrarModalExamen = false;

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
        },
        error: () => {
          this.cargando = false;
          this.router.navigate(['/cursos']);
        }
      });
    }
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
