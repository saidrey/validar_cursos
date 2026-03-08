import { RenderMode, ServerRoute } from '@angular/ssr';

// Decisión de renderizado por ruta — el núcleo de la estrategia SSR/CSR mixta.
//
// RenderMode.Client   → Angular envía el shell HTML vacío y el browser toma el control.
//                       Igual que una SPA clásica. Sin trabajo de servidor por request.
//
// RenderMode.Server   → HTML completo generado en Node por cada request.
//                       El browser recibe contenido real desde el primer byte (TTFB).
//                       Hidratación posterior lo convierte en SPA interactiva.
//
// RenderMode.Prerender → HTML generado una sola vez en build time.
//                        Ideal para páginas cuya estructura no depende de datos dinámicos.
//                        El servidor sirve el archivo estático, 0 compute por request.

export const serverRoutes: ServerRoute[] = [
  // Rutas privadas: CSR puro.
  // Razones: el contenido es personalizado (requiere auth), no aporta SEO,
  // y necesita localStorage para leer el token → no existe en Node.
  // SSR aquí sería CPU desperdiciada en el servidor.
  {
    path: 'admin',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },

  // Páginas públicas con solo estructura estática (formularios, sin data fetch inicial).
  // Prerender = generadas en `ng build`, servidas como archivos estáticos.
  // No importa cuánto tráfico haya: el servidor nunca ejecuta lógica Angular por estas rutas.
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'validar',
    renderMode: RenderMode.Prerender
  },

  // Resto de la parte pública: SSR on-demand.
  // Inicio y listados de cursos muestran datos que cambian → necesitan HTML fresco.
  // Cada request renderiza en el servidor con datos actuales del backend.
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
