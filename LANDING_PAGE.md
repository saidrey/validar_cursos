# LANDING PAGE - Diplomas App

Documentación completa de la implementación de la página de inicio con Tailwind CSS en Angular 18.

---

## 📋 Tabla de Contenidos

- [Instalación de Tailwind CSS](#instalación-de-tailwind-css)
- [Configuración](#configuración)
- [Estructura de Componentes](#estructura-de-componentes)
- [Uso de Tailwind CSS](#uso-de-tailwind-css)
- [Ejemplos de Código](#ejemplos-de-código)
- [Clases Personalizadas](#clases-personalizadas)

---

## 🎨 Instalación de Tailwind CSS

### Paso 1: Instalar dependencias

```bash
cd /workspace/frontend
npm install -D tailwindcss postcss autoprefixer
```

**¿Qué instalamos?**
- `tailwindcss`: Framework CSS utility-first
- `postcss`: Herramienta para transformar CSS
- `autoprefixer`: Agrega prefijos de navegadores automáticamente

### Paso 2: Inicializar configuración

```bash
npx tailwindcss init
```

Esto crea el archivo `tailwind.config.js` en la raíz del proyecto.

### Paso 3: Configurar Tailwind

**Archivo: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // Escanea todos los archivos HTML y TS
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados del proyecto
        primary: '#137fec',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
      },
      fontFamily: {
        // Fuente personalizada
        display: ['Lexend', 'sans-serif']
      },
    },
  },
  plugins: [],
}
```

**Explicación:**
- `content`: Le dice a Tailwind dónde buscar las clases que usas
- `theme.extend`: Agrega colores y fuentes personalizadas sin sobrescribir las predeterminadas
- `primary`: Color azul para botones y elementos destacados
- `background-light`: Color de fondo claro

### Paso 4: Agregar directivas de Tailwind

**Archivo: `src/styles.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

/* Directivas de Tailwind */
@tailwind base;        /* Estilos base (reset CSS) */
@tailwind components;  /* Componentes reutilizables */
@tailwind utilities;   /* Clases de utilidad */

body {
  font-family: 'Lexend', sans-serif;
  margin: 0;
  padding: 0;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**Explicación:**
- `@tailwind base`: Normaliza estilos entre navegadores
- `@tailwind components`: Permite crear componentes con `@apply`
- `@tailwind utilities`: Todas las clases de utilidad (flex, grid, colors, etc.)

### Paso 5: Configurar index.html

**Archivo: `src/index.html`**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Diplomas App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body class="bg-background-light text-slate-900 antialiased">
  <app-root></app-root>
</body>
</html>
```

**Clases aplicadas al body:**
- `bg-background-light`: Color de fondo personalizado
- `text-slate-900`: Color de texto gris oscuro
- `antialiased`: Suaviza las fuentes

---

## 🏗 Estructura de Componentes

```
src/app/public/
├── components/
│   ├── navbar/          # Header con navegación
│   └── footer/          # Footer con formulario
└── pages/
    └── inicio/          # Página principal
```

---

## 🎯 Uso de Tailwind CSS

### Conceptos Básicos

Tailwind usa clases de utilidad que aplican un solo estilo CSS:

```html
<!-- En lugar de escribir CSS -->
<style>
  .boton {
    background-color: blue;
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
  }
</style>

<!-- Usas clases de Tailwind -->
<button class="bg-blue-500 text-white px-8 py-4 rounded-lg">
  Botón
</button>
```

### Sistema de Espaciado

Tailwind usa una escala de espaciado donde cada número = 0.25rem (4px):

```
p-1  = padding: 0.25rem  (4px)
p-2  = padding: 0.5rem   (8px)
p-4  = padding: 1rem     (16px)
p-6  = padding: 1.5rem   (24px)
p-8  = padding: 2rem     (32px)
```

### Responsive Design

Tailwind usa prefijos para diferentes tamaños de pantalla:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 
    w-full      = 100% en móvil
    md:w-1/2    = 50% en tablets (768px+)
    lg:w-1/3    = 33% en desktop (1024px+)
  -->
</div>
```

---

## 💻 Ejemplos de Código

### 1. Navbar Component

**Archivo: `navbar.component.html`**

```html
<header class="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-2">
        <div class="bg-primary p-1.5 rounded-lg text-white">
          <span class="material-symbols-outlined block">school</span>
        </div>
        <span class="text-2xl font-extrabold tracking-tight text-slate-900">
          Diplomas App
        </span>
      </a>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center space-x-10">
        <a routerLink="/" 
           class="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
          Inicio
        </a>
        <a routerLink="/cursos" 
           class="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
          Cursos
        </a>
      </nav>

      <!-- CTA Button -->
      <a routerLink="/login"
         class="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20">
        Login
      </a>
    </div>
  </div>
</header>
```

**Explicación de clases:**

```css
/* Header */
sticky top-0        /* Fijo al hacer scroll */
z-50                /* Sobre otros elementos */
w-full              /* Ancho 100% */
bg-white/90         /* Fondo blanco con 90% opacidad */
backdrop-blur-md    /* Efecto blur en el fondo */
border-b            /* Borde inferior */
border-slate-200    /* Color del borde */

/* Container */
max-w-7xl           /* Ancho máximo 80rem (1280px) */
mx-auto             /* Centrado horizontal */
px-4                /* Padding horizontal 1rem */
sm:px-6             /* Padding 1.5rem en tablets */
lg:px-8             /* Padding 2rem en desktop */

/* Flex */
flex                /* Display flex */
justify-between     /* Espacio entre elementos */
items-center        /* Alineación vertical centrada */
h-20                /* Altura 5rem (80px) */

/* Logo */
gap-2               /* Espacio entre elementos flex */
bg-primary          /* Color de fondo personalizado */
p-1.5               /* Padding 0.375rem */
rounded-lg          /* Border radius 0.5rem */

/* Links */
text-sm             /* Tamaño de fuente 0.875rem */
font-semibold       /* Peso de fuente 600 */
text-slate-700      /* Color gris oscuro */
hover:text-primary  /* Color al pasar el mouse */
transition-colors   /* Transición suave de colores */

/* Button */
px-6                /* Padding horizontal 1.5rem */
py-2.5              /* Padding vertical 0.625rem */
shadow-md           /* Sombra mediana */
shadow-primary/20   /* Sombra con color primary al 20% */
```

### 2. Hero Section

**Archivo: `inicio.component.html`**

```html
<section class="relative w-full h-[600px] overflow-hidden bg-slate-900">
  <!-- Imagen de fondo -->
  <div class="absolute inset-0 opacity-60">
    <img src="..." alt="..." class="w-full h-full object-cover">
  </div>
  
  <!-- Gradiente overlay -->
  <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>

  <!-- Contenido -->
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
    <div class="max-w-2xl space-y-6">
      <!-- Badge -->
      <span class="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
        Educación de Élite
      </span>
      
      <!-- Título -->
      <h1 class="text-5xl md:text-6xl font-extrabold text-white leading-tight">
        Impulsa tu carrera con nuestros 
        <span class="text-primary">cursos certificados</span>
      </h1>
      
      <!-- Descripción -->
      <p class="text-lg text-slate-300 font-light leading-relaxed">
        Programas de desarrollo profesional diseñados por líderes de la industria.
      </p>
      
      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-4 pt-4">
        <a routerLink="/cursos"
           class="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-base transition-all text-center">
          Explorar Catálogo
        </a>
        <a routerLink="/validar"
           class="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-base transition-all text-center">
          Validar Diploma
        </a>
      </div>
    </div>
  </div>
</section>
```

**Explicación de clases avanzadas:**

```css
/* Posicionamiento */
relative            /* Posición relativa (contexto para absolute) */
absolute            /* Posición absoluta */
inset-0             /* top:0, right:0, bottom:0, left:0 */

/* Tamaños */
h-[600px]           /* Altura personalizada 600px */
w-full              /* Ancho 100% */
max-w-2xl           /* Ancho máximo 42rem (672px) */

/* Efectos visuales */
opacity-60          /* Opacidad 60% */
overflow-hidden     /* Oculta contenido que se desborda */
object-cover        /* La imagen cubre todo el contenedor */

/* Gradientes */
bg-gradient-to-r    /* Gradiente de izquierda a derecha */
from-slate-950      /* Color inicial del gradiente */
via-slate-950/40    /* Color intermedio con 40% opacidad */
to-transparent      /* Color final transparente */

/* Colores con opacidad */
bg-primary/20       /* Color primary con 20% opacidad */
border-primary/30   /* Borde primary con 30% opacidad */
bg-white/10         /* Blanco con 10% opacidad */

/* Espaciado */
space-y-6           /* Espacio vertical entre hijos (1.5rem) */
gap-4               /* Espacio entre elementos flex/grid (1rem) */
pt-4                /* Padding top 1rem */

/* Tipografía */
text-5xl            /* Tamaño 3rem (48px) */
md:text-6xl         /* Tamaño 3.75rem (60px) en tablets+ */
font-extrabold      /* Peso 800 */
leading-tight       /* Altura de línea 1.25 */
tracking-wider      /* Espaciado entre letras 0.05em */
uppercase           /* Texto en mayúsculas */

/* Efectos */
backdrop-blur-sm    /* Blur pequeño en el fondo */
rounded-xl          /* Border radius 0.75rem */
transition-all      /* Transición en todas las propiedades */
```

### 3. Grid de Categorías

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  @for (categoria of categorias; track categoria.titulo) {
    <div class="flex flex-col p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/50 transition-colors">
      <!-- Icono -->
      <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-6">
        <span class="material-symbols-outlined">{{ categoria.icono }}</span>
      </div>
      
      <!-- Contenido -->
      <h4 class="text-xl font-bold text-slate-900 mb-2">
        {{ categoria.titulo }}
      </h4>
      <p class="text-slate-500 text-sm mb-6">
        {{ categoria.descripcion }}
      </p>
      
      <!-- Link -->
      <a routerLink="/cursos"
         class="mt-auto text-primary font-bold text-sm flex items-center gap-2 group">
        Ver cursos
        <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </a>
    </div>
  }
</div>
```

**Explicación del Grid:**

```css
/* Grid System */
grid                /* Display grid */
grid-cols-1         /* 1 columna en móvil */
sm:grid-cols-2      /* 2 columnas en tablets (640px+) */
lg:grid-cols-4      /* 4 columnas en desktop (1024px+) */
gap-8               /* Espacio entre elementos (2rem) */

/* Flexbox en tarjetas */
flex flex-col       /* Flex vertical */
mt-auto             /* Margin top automático (empuja al final) */

/* Hover effects */
hover:border-primary/50     /* Borde al hover */
group                       /* Marca el contenedor como grupo */
group-hover:translate-x-1   /* Mueve 0.25rem al hover del grupo */
transition-transform        /* Transición suave del transform */
```

---

## 🎨 Clases Personalizadas

### Colores del Proyecto

```javascript
// tailwind.config.js
colors: {
  primary: '#137fec',              // Azul principal
  'background-light': '#f6f7f8',   // Fondo claro
  'background-dark': '#101922',    // Fondo oscuro
}
```

**Uso:**

```html
<div class="bg-primary">Color de fondo</div>
<div class="text-primary">Color de texto</div>
<div class="border-primary">Color de borde</div>
<div class="bg-primary/50">Color con 50% opacidad</div>
```

### Fuente Personalizada

```javascript
// tailwind.config.js
fontFamily: {
  display: ['Lexend', 'sans-serif']
}
```

**Uso:**

```html
<h1 class="font-display">Título con Lexend</h1>
```

---

## 📱 Responsive Design

### Breakpoints de Tailwind

```
sm:  640px   (Tablets pequeñas)
md:  768px   (Tablets)
lg:  1024px  (Desktop)
xl:  1280px  (Desktop grande)
2xl: 1536px  (Pantallas grandes)
```

### Ejemplo Responsive

```html
<!-- Ocultar en móvil, mostrar en desktop -->
<nav class="hidden md:flex">...</nav>

<!-- Padding responsive -->
<div class="px-4 sm:px-6 lg:px-8">...</div>

<!-- Tamaño de texto responsive -->
<h1 class="text-3xl md:text-4xl lg:text-5xl">...</h1>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>
```

---

## 🚀 Ventajas de Tailwind CSS

1. **Rápido desarrollo**: No necesitas escribir CSS personalizado
2. **Consistencia**: Usa un sistema de diseño predefinido
3. **Optimizado**: Solo incluye las clases que usas (tree-shaking)
4. **Responsive**: Sistema de breakpoints integrado
5. **Mantenible**: Estilos junto al HTML, fácil de entender

---

## 📚 Recursos

- [Documentación oficial](https://tailwindcss.com/docs)
- [Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind Play](https://play.tailwindcss.com/) - Playground online
- [Tailwind UI](https://tailwindui.com/) - Componentes premium

---

## 🔧 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Build de producción (optimiza Tailwind)
npm run build

# Ver tamaño del bundle
npm run build -- --stats-json
```

---

**Desarrollado con Angular 18 + Tailwind CSS 3**
