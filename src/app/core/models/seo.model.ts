export interface SeoConfig {
  // Título de la página — se concatena con el nombre del sitio: "Título | Aula Virtual"
  title: string;

  // Descripción visible en resultados de búsqueda. Google la usa si tiene entre 120-160 chars.
  description: string;

  // Palabras clave — menor importancia hoy, pero algunos motores secundarios las usan.
  keywords?: string;

  // URL absoluta de la imagen para redes sociales (Open Graph / Twitter Card).
  // Si no se provee, se usa la imagen por defecto del sitio.
  image?: string;

  // URL canónica de la página. Importante para evitar contenido duplicado.
  // Por defecto se calcula a partir de siteUrl + router.url.
  url?: string;

  // Tipo de contenido para Open Graph.
  type?: 'website' | 'article' | 'product';

  // Si es true, inyecta "noindex, nofollow". Usar en páginas que NO deben indexarse.
  noindex?: boolean;
}
