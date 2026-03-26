import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SeoConfig } from '../models/seo.model';

// Servicio centralizado de SEO. Un solo lugar para gestionar todos los meta tags,
// Open Graph, Twitter Cards, canonical URLs y JSON-LD structured data.
//
// Diseñado para funcionar en SSR y browser:
//   - Meta y Title → Angular provee implementaciones para ambos contextos.
//   - DOCUMENT → token de Angular que en SSR apunta al DOM del servidor
//     (serializado a HTML por @angular/platform-server), no al browser.
//   - inject(Router) → en SSR el Router conoce la URL del request en curso.

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  private readonly siteName = 'Aula Virtual';
  private readonly siteUrl = environment.siteUrl;

  // Imagen por defecto para compartir en redes cuando la página no tiene imagen propia.
  // Colocar en public/og-default.jpg (1200x630px es el tamaño recomendado para OG).
  private readonly defaultImage = `${this.siteUrl}/og-default.jpg`;

  setPage(config: SeoConfig): void {
    // Formato estándar: "Nombre Página | Nombre Sitio"
    // Esto ayuda al usuario a identificar el sitio en múltiples pestañas
    // y es la convención que Google premia en CTR (click-through rate).
    const fullTitle = config.title
      ? `${config.title} | ${this.siteName}`
      : this.siteName;

    const canonicalUrl = config.url || `${this.siteUrl}${this.router.url}`;
    const ogImage = config.image || this.defaultImage;

    // --- Título ---
    this.titleService.setTitle(fullTitle);

    // --- Meta básicos ---
    // description es el texto visible bajo el título en los resultados de Google.
    // Google lo trunca alrededor de 160 caracteres, así que mantenemos las
    // descripciones en ese rango para no desperdiciar espacio en el SERP.
    this.meta.updateTag({ name: 'description', content: config.description });

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Controla si Google indexa la página y sigue sus links.
    // noindex en rutas que no deben aparecer en buscadores (login, admin, etc.)
    this.meta.updateTag({
      name: 'robots',
      content: config.noindex ? 'noindex, nofollow' : 'index, follow'
    });

    // --- Open Graph (OG) ---
    // Protocolo de Facebook/Meta adoptado por prácticamente todas las redes.
    // Cuando alguien comparte una URL en WhatsApp, LinkedIn, Slack, etc.,
    // el cliente lee estos tags para construir la vista previa del link.
    this.meta.updateTag({ property: 'og:title',       content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url',         content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image',       content: ogImage });
    this.meta.updateTag({ property: 'og:type',        content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name',   content: this.siteName });

    // --- Twitter Card ---
    // Twitter no usa OG, tiene su propio sistema aunque es casi idéntico.
    // summary_large_image = imagen grande arriba + título + descripción abajo.
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image',       content: ogImage });

    // --- Canonical URL ---
    this.setCanonical(canonicalUrl);
  }

  // JSON-LD: inyecta datos estructurados en formato Schema.org.
  // Google los lee para mostrar "rich snippets" en los resultados:
  // estrellas de rating, precio, duración de curso, breadcrumbs, etc.
  // Siempre reemplazamos el bloque anterior — si el usuario navega de
  // /cursos/1 a /cursos/2, no queremos acumular dos Course schemas.
  setJsonLd(schema: object): void {
    const existing = this.document.querySelector('script[type="application/ld+json"]');
    if (existing) existing.remove();

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(schema, null, 0);
    this.document.head.appendChild(script);
  }

  // El canonical le dice a Google: "aunque esta página sea accesible desde
  // múltiples URLs, esta es la versión oficial". Sin esto, variaciones como
  // /cursos/1?ref=home y /cursos/1 se tratan como páginas duplicadas y
  // compiten entre sí, diluyendo el ranking.
  private setCanonical(url: string): void {
    let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link') as HTMLLinkElement;
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
