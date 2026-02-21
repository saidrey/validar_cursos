# Estructura del Frontend - Diplomas App

## 📁 Arquitectura Modular

```
src/app/
├── core/                    # Funcionalidad central (singleton)
│   ├── guards/
│   │   ├── auth.guard.ts   # Guard de autenticación
│   │   └── admin.guard.ts  # Guard de rol admin
│   ├── services/
│   │   └── auth.service.ts # Servicio de autenticación
│   ├── interceptors/       # HTTP interceptors
│   └── models/
│       └── usuario.model.ts
│
├── public/                  # Módulo público (sin autenticación)
│   ├── pages/
│   │   ├── inicio/         # Landing page
│   │   ├── cursos/         # Listado de cursos
│   │   ├── validar/        # Validar diplomas
│   │   ├── contacto/       # Formulario de contacto
│   │   └── login/          # Página de login
│   ├── components/         # Componentes compartidos públicos
│   └── public.routes.ts    # Rutas públicas
│
├── private/                 # Módulo privado (requiere auth)
│   ├── pages/
│   │   ├── dashboard/      # Dashboard admin
│   │   ├── gestion-cursos/ # CRUD cursos
│   │   ├── gestion-diplomas/ # CRUD diplomas
│   │   └── gestion-usuarios/ # CRUD usuarios
│   ├── components/         # Componentes compartidos privados
│   └── private.routes.ts   # Rutas privadas
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts           # Rutas principales
```

## 🔐 Sistema de Autenticación

### AuthService
Servicio centralizado para manejo de autenticación:
- `login(email, password)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `estaAutenticado()` - Verificar si está autenticado
- `obtenerUsuario()` - Obtener usuario actual
- `esAdmin()` - Verificar si es administrador

### Guards

#### authGuard
Protege rutas que requieren autenticación:
```typescript
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./private/private.routes')
}
```

#### adminGuard
Protege rutas que requieren rol de administrador:
```typescript
{
  path: 'admin',
  canActivate: [authGuard, adminGuard],
  loadChildren: () => import('./private/private.routes')
}
```

## 🚀 Lazy Loading

Todas las rutas usan lazy loading para optimizar la carga inicial:

```typescript
// Carga bajo demanda
loadComponent: () => import('./pages/inicio/inicio.component')
  .then(m => m.InicioComponent)
```

## 📍 Rutas

### Públicas (sin autenticación)
- `/` - Inicio
- `/cursos` - Listado de cursos
- `/validar` - Validar diplomas
- `/contacto` - Formulario de contacto
- `/login` - Iniciar sesión

### Privadas (requieren autenticación + rol admin)
- `/admin` - Dashboard
- `/admin/cursos` - Gestión de cursos
- `/admin/diplomas` - Gestión de diplomas
- `/admin/usuarios` - Gestión de usuarios

## 🔄 Flujo de Autenticación

1. Usuario accede a `/login`
2. Ingresa credenciales
3. `AuthService.login()` llama al backend
4. Si es exitoso, guarda usuario en localStorage y signal
5. Usuario es redirigido a `/admin`
6. `authGuard` y `adminGuard` validan acceso
7. Si no está autenticado, redirige a `/login`

## 💾 Persistencia

El usuario autenticado se guarda en:
- **localStorage**: Para persistir entre recargas
- **Signal**: Para reactividad en la aplicación

```typescript
// Al iniciar sesión
localStorage.setItem('usuario', JSON.stringify(usuario));
this.usuarioActual.set(usuario);

// Al cargar la app
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
  this.usuarioActual.set(JSON.parse(usuarioGuardado));
}
```

## 🎨 Convenciones

### Nomenclatura
- **Componentes**: PascalCase (InicioComponent)
- **Servicios**: camelCase con sufijo Service (authService)
- **Guards**: camelCase con sufijo Guard (authGuard)
- **Modelos**: PascalCase con sufijo Model (Usuario)

### Estructura de Componentes
```typescript
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent { }
```

## 📦 Próximos Pasos

1. Crear componentes de páginas públicas
2. Crear componentes de páginas privadas
3. Implementar servicios para API (cursos, diplomas)
4. Crear componentes compartidos (navbar, footer)
5. Implementar formularios reactivos
6. Agregar validaciones
7. Implementar manejo de errores
8. Agregar loading states

## 🛠 Comandos Útiles

```bash
# Generar componente público
ng g c public/pages/inicio --standalone

# Generar componente privado
ng g c private/pages/dashboard --standalone

# Generar servicio
ng g s core/services/cursos

# Generar guard
ng g guard core/guards/auth --functional
```

---

**Angular 18 + Standalone Components + Signals**
