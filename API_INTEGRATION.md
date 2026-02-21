# Conexión Frontend-Backend API

Documentación del proceso de integración entre Angular 18 (Frontend) y PHP 8.2 REST API (Backend).

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Paso a Paso de Implementación](#paso-a-paso-de-implementación)
4. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Configuración Inicial

### Backend (PHP)
- **URL Base**: `http://localhost:8080`
- **Endpoints**: `/controllers/*.php`
- **CORS**: Habilitado para todas las origins

### Frontend (Angular)
- **URL Base**: `http://localhost:4200`
- **HTTP Client**: Angular HttpClient
- **Configuración**: Environment variables

---

## 📁 Estructura de Archivos

```
workspace/
├── backend/
│   ├── controllers/
│   │   ├── login.php          # Autenticación
│   │   ├── cursos.php          # CRUD cursos
│   │   ├── diplomas.php        # CRUD diplomas
│   │   ├── usuarios.php        # CRUD usuarios
│   │   ├── validar.php         # Validación diplomas
│   │   └── contacto.php        # Formulario contacto
│   ├── models/
│   │   ├── Usuario.php
│   │   ├── Curso.php
│   │   └── Diploma.php
│   └── config/
│       └── Database.php
│
└── frontend/
    └── src/
        ├── environments/
        │   └── environment.ts  # Configuración API URL
        ├── app/
        │   └── core/
        │       ├── models/     # Interfaces TypeScript
        │       │   ├── usuario.model.ts
        │       │   ├── curso.model.ts
        │       │   └── diploma.model.ts
        │       └── services/   # Servicios HTTP
        │           ├── auth.service.ts
        │           ├── cursos.service.ts
        │           └── diplomas.service.ts
```

---

## 🚀 Paso a Paso de Implementación

### **Paso 1: Configurar CORS en Backend**

Todos los controladores PHP deben incluir headers CORS:

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight request
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

**Ubicación**: Todos los archivos en `/backend/controllers/*.php`

---

### **Paso 2: Crear Environment Configuration**

**Archivo**: `/frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/controllers'
};
```

**Propósito**: Centralizar la URL base de la API para fácil configuración.

---

### **Paso 3: Crear Interfaces TypeScript**

**Archivo**: `/frontend/src/app/core/models/curso.model.ts`

```typescript
export interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  resumen: string;
  duracion: string;
  instructor: string;
  precio: number;
  imagen: string;
  activo: number;
  fecha_creacion: string;
}
```

**Propósito**: Tipado fuerte para datos de la API.

---

### **Paso 4: Crear Servicios HTTP**

**Archivo**: `/frontend/src/app/core/services/cursos.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curso } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cursos.php`;

  obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  obtenerCurso(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}?id=${id}`);
  }

  crearCurso(curso: Partial<Curso>): Observable<any> {
    return this.http.post(this.apiUrl, curso);
  }

  actualizarCurso(curso: Curso): Observable<any> {
    return this.http.put(this.apiUrl, curso);
  }

  eliminarCurso(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id } });
  }
}
```

**Características**:
- Singleton pattern (`providedIn: 'root'`)
- Inyección de dependencias con `inject()`
- Tipado con Observables
- CRUD completo

---

### **Paso 5: Usar Servicios en Componentes**

**Archivo**: `/frontend/src/app/public/pages/cursos/cursos.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso } from '../../../core/models/curso.model';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cursos.component.html'
})
export class CursosComponent implements OnInit {
  private cursosService = inject(CursosService);
  
  cursos: Curso[] = [];
  cargando = true;

  ngOnInit() {
    this.cargarCursos();
  }

  cargarCursos() {
    this.cursosService.obtenerCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }
}
```

---

### **Paso 6: Mostrar Datos en Template**

**Archivo**: `/frontend/src/app/public/pages/cursos/cursos.component.html`

```html
<!-- Loading State -->
<div *ngIf="cargando">Cargando...</div>

<!-- Lista de Cursos -->
<div *ngIf="!cargando" class="grid grid-cols-3 gap-6">
  <article *ngFor="let curso of cursos" class="card">
    <img [src]="curso.imagen" [alt]="curso.nombre">
    <h3>{{ curso.nombre }}</h3>
    <p>{{ curso.resumen }}</p>
    <a [routerLink]="['/cursos', curso.id]">Ver más</a>
  </article>
</div>
```

---

## 🔍 Ejemplos de Uso

### Autenticación (AuthService)

```typescript
// Login
this.authService.login(email, password).subscribe({
  next: (response) => {
    console.log('Login exitoso', response.usuario);
  },
  error: (error) => {
    console.error('Error de login', error);
  }
});

// Verificar autenticación
if (this.authService.estaAutenticado()) {
  // Usuario autenticado
}

// Obtener usuario actual
const usuario = this.authService.usuarioActual();
```

### Validación de Diplomas (DiplomasService)

```typescript
// Validar por documento
this.diplomasService.validarPorDocumento('CC', '123456789').subscribe({
  next: (response) => {
    if (response.valido) {
      console.log('Diplomas encontrados:', response.diplomas);
    }
  }
});

// Validar por código
this.diplomasService.validarPorCodigo('ABC123').subscribe({
  next: (response) => {
    if (response.valido) {
      console.log('Diploma válido:', response.diploma);
    }
  }
});
```

---

## ⚠️ Solución de Problemas

### Error 405 (Method Not Allowed)

**Problema**: El navegador envía OPTIONS pero el backend responde 405.

**Solución**: Agregar manejo de OPTIONS en todos los controladores PHP:

```php
if($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### Error de CORS

**Problema**: `Access-Control-Allow-Origin` bloqueado.

**Solución**: Verificar headers CORS en PHP:

```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

### Error 404 en Endpoints

**Problema**: No encuentra el endpoint.

**Solución**: Verificar URL en `environment.ts`:

```typescript
apiUrl: 'http://localhost:8080/controllers'  // Sin barra final
```

### Datos no se actualizan

**Problema**: Componente no refleja cambios.

**Solución**: Usar Signals o forzar detección de cambios:

```typescript
// Con Signals (recomendado)
cursos = signal<Curso[]>([]);

// O forzar detección
constructor(private cdr: ChangeDetectorRef) {}
this.cdr.detectChanges();
```

---

## 📊 Flujo de Datos Completo

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│  Component  │────────>│   Service    │────────>│ Backend  │
│             │         │  (HTTP)      │         │   API    │
└─────────────┘         └──────────────┘         └──────────┘
      ↑                        ↑                       ↑
      │                        │                       │
   Template              Observable               Database
   Binding               RxJS                     MySQL
```

1. **Component** llama al servicio
2. **Service** hace petición HTTP
3. **Backend** procesa y consulta DB
4. **Backend** retorna JSON
5. **Service** emite Observable
6. **Component** actualiza datos
7. **Template** renderiza UI

---

## 🎯 Mejores Prácticas Implementadas

✅ **Separación de responsabilidades**: Servicios separados por entidad  
✅ **Tipado fuerte**: Interfaces TypeScript para todos los modelos  
✅ **Singleton pattern**: Servicios con `providedIn: 'root'`  
✅ **Manejo de errores**: Try-catch en backend, error handling en frontend  
✅ **CORS configurado**: Headers en todos los endpoints  
✅ **Environment variables**: Configuración centralizada  
✅ **Lazy loading**: Rutas cargadas bajo demanda  
✅ **Standalone components**: Angular 18 modern approach  

---

## 📝 Notas Adicionales

- Todos los servicios usan **HttpClient** de Angular
- Backend usa **PDO** para conexiones seguras a MySQL
- Autenticación con **localStorage** para persistencia
- Validación de datos en **backend y frontend**
- Soft deletes con campo `activo` en base de datos

---

**Última actualización**: 2024  
**Stack**: Angular 18 + PHP 8.2 + MySQL 8.0
