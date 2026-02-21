# Responsive Design - Adaptación Mobile y Tablet

Este documento describe todos los ajustes realizados para garantizar una experiencia adecuada en dispositivos móviles y tabletas.

---

## Problemas identificados y soluciones aplicadas

---

### 1. Navbar público — Menú hamburguesa

**Problema:** En pantallas menores a `md` (768px), los enlaces de navegación estaban ocultos (`hidden md:flex`) y no había ningún mecanismo para que el usuario pudiera acceder a ellos desde un dispositivo móvil.

**Archivos modificados:**
- `src/app/public/components/navbar/navbar.component.ts`
- `src/app/public/components/navbar/navbar.component.html`

**Solución aplicada:**

Se agregó estado de apertura del menú con Angular Signals y un botón hamburguesa visible solo en mobile:

```typescript
// navbar.component.ts
menuOpen = signal(false);
toggleMenu() { this.menuOpen.update(v => !v); }
closeMenu()  { this.menuOpen.set(false); }
```

```html
<!-- Botón hamburguesa — visible solo en mobile (md:hidden) -->
<button class="md:hidden" (click)="toggleMenu()">
  <!-- Ícono X cuando está abierto, ≡ cuando está cerrado -->
</button>

<!-- Menú desplegable mobile -->
@if (menuOpen()) {
  <div class="md:hidden border-t border-slate-200 bg-white/95">
    <nav><!-- links con (click)="closeMenu()" --></nav>
  </div>
}
```

**Comportamiento:**
- El botón hamburguesa aparece solo en pantallas `< 768px`
- Al hacer clic en un enlace del menú, este se cierra automáticamente
- El ícono cambia entre `≡` (cerrado) y `✕` (abierto)

---

### 2. Admin Layout — Sidebar en mobile

**Problema:** El sidebar del panel administrativo iniciaba siempre en estado abierto (`sidebarOpen = signal(true)`). En mobile, el sidebar es `position: fixed` y cubre toda la pantalla incluyendo el botón que lo cerraría, dejando al usuario atrapado sin poder cerrarlo.

**Archivos modificados:**
- `src/app/private/layout/admin-layout.component.ts`
- `src/app/private/layout/admin-layout.component.html`
- `src/app/private/layout/admin-layout.component.css`

**Solución aplicada:**

**TS — Estado inicial según tamaño de pantalla:**
```typescript
// Abre en desktop, cierra en mobile al iniciar
sidebarOpen = signal(window.innerWidth >= 768);
isMobile    = signal(window.innerWidth < 768);

closeSidebarOnMobile() {
  if (this.isMobile()) this.sidebarOpen.set(false);
}
```

**HTML — Overlay oscuro para cerrar al tocar fuera:**
```html
@if (sidebarOpen() && isMobile()) {
  <div class="sidebar-overlay" (click)="toggleSidebar()"></div>
}

<!-- En cada nav-item: cierra el sidebar al navegar en mobile -->
<a ... (click)="closeSidebarOnMobile()">...</a>
```

**CSS — Estilos del overlay y ajustes responsive:**
```css
.sidebar-overlay {
  display: none; /* oculto en desktop */
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99; /* debajo del sidebar (z-index: 100) */
  }

  .admin-content {
    padding: 1rem; /* padding reducido en mobile */
  }
}
```

**Comportamiento:**
- En mobile: sidebar inicia **cerrado**, se abre con el botón `☰` del header
- Al abrir el sidebar aparece un overlay oscuro; tocarlo cierra el sidebar
- Al navegar a una sección, el sidebar se cierra automáticamente
- En desktop: comportamiento sin cambios (sidebar abre por defecto)

---

### 3. Trust Badges en página Validar — Solapamiento de texto

**Problema:** La sección de sellos de confianza al final del formulario de validación usaba `grid-cols-3` fijo. En pantallas pequeñas, el texto largo "Oficial Aula Virtual Centro de Conocimiento" se solapaba con los otros elementos al no tener espacio suficiente en 3 columnas.

**Archivo modificado:**
- `src/app/public/pages/validar/validar.component.html`

**Solución aplicada:**

```html
<!-- Antes -->
<div class="grid grid-cols-3 gap-4 ...">
  <span class="material-symbols-outlined ...">verified</span>
  <span class="text-xs ...">Oficial Aula Virtual Centro de Conocimiento</span>
</div>

<!-- Después -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 ...">
  <span class="material-symbols-outlined text-base sm:text-[24px] ...">verified</span>
  <span class="text-[10px] sm:text-xs ...">Oficial Aula Virtual Centro de Conocimiento</span>
</div>
```

**Cambios clave:**
| Propiedad | Mobile (`< 640px`) | Desktop (`sm+`) |
|---|---|---|
| Columnas del grid | 1 (apilado vertical) | 3 (en fila) |
| Tamaño del ícono | `text-base` (16px) | `text-[24px]` |
| Tamaño del texto | `text-[10px]` | `text-xs` (12px) |

**Comportamiento:**
- En mobile: los 3 sellos se apilan verticalmente, centrados, sin solapamiento
- En tablet/desktop: se muestran en fila horizontal como antes

---

### 4. Tablas del Admin — Scroll horizontal

**Problema:** Las tablas dinámicas del panel administrativo (`DataTableComponent`) no tenían scroll horizontal. En pantallas pequeñas, las columnas se comprimían o el contenido quedaba cortado, haciendo ilegible la información.

**Archivo modificado:**
- `src/app/shared/data-table.component.ts`

**Solución aplicada:**

```typescript
// Antes
<div class="mat-elevation-z2 rounded-lg overflow-hidden">

// Después
<div class="mat-elevation-z2 rounded-lg overflow-x-auto">
```

**Por qué funciona:** `overflow-x-auto` permite scroll horizontal cuando el contenido de la tabla supera el ancho del contenedor, mientras que `overflow-hidden` lo cortaba sin opción de desplazamiento. El `overflow-x-auto` también crea un nuevo contexto de formato que preserva el efecto de bordes redondeados del contenedor.

**Comportamiento:**
- En mobile/tablet: la tabla se puede desplazar horizontalmente para ver todas las columnas
- En desktop: sin cambios, el scroll no aparece si no es necesario

---

## Breakpoints utilizados (Tailwind CSS)

| Prefijo | Ancho mínimo | Uso típico |
|---|---|---|
| *(sin prefijo)* | 0px | Mobile first (base) |
| `sm:` | 640px | Tablets pequeñas |
| `md:` | 768px | Tablets / laptop |
| `lg:` | 1024px | Desktop |

---

## Principio aplicado: Mobile First

Todos los estilos base están definidos para pantallas pequeñas y se **sobreescriben** con prefijos responsive (`sm:`, `md:`) para pantallas más grandes. Esto sigue el patrón estándar de Tailwind CSS y garantiza que el diseño base funcione en el dispositivo más restrictivo.
