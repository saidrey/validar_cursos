# Interceptors HTTP

Sistema de interceptors implementado para manejo centralizado de peticiones HTTP.

---

## 📦 Interceptors Implementados

### 1. **Auth Interceptor** (`auth.interceptor.ts`)

**Propósito**: Agregar token JWT automáticamente a todas las peticiones HTTP.

**Funcionamiento**:
- Lee el token del `localStorage`
- Si existe, lo agrega al header `Authorization: Bearer {token}`
- Se ejecuta en TODAS las peticiones HTTP

**Uso**: Automático, no requiere configuración adicional.

---

### 2. **Error Interceptor** (`error.interceptor.ts`)

**Propósito**: Manejo centralizado de errores HTTP.

**Códigos de Error Manejados**:

| Código | Acción |
|--------|--------|
| 400 | Solicitud inválida - Muestra mensaje del servidor |
| 401 | No autorizado - Limpia sesión y redirige a `/login` |
| 403 | Sin permisos - Muestra mensaje de acceso denegado |
| 404 | No encontrado - Muestra mensaje personalizado |
| 500 | Error del servidor - Mensaje genérico |
| 503 | Servicio no disponible - Mensaje de reintento |

**Características**:
- Logging automático en consola con detalles del error
- Mensajes de error en español
- Limpieza automática de sesión en error 401
- Redirección automática a login cuando expira sesión

**Estructura del Error Retornado**:
```typescript
{
  status: number,
  message: string,
  originalError: HttpErrorResponse
}
```

---

### 3. **Loading Interceptor** (`loading.interceptor.ts`)

**Propósito**: Mostrar spinner de carga global durante peticiones HTTP.

**Funcionamiento**:
- Incrementa contador al iniciar petición
- Decrementa contador al finalizar petición
- Muestra spinner cuando contador > 0
- Usa `LoadingService` con signals de Angular

**Características**:
- Manejo de múltiples peticiones simultáneas
- Spinner se oculta solo cuando TODAS las peticiones terminan
- No requiere código adicional en componentes

---

## 🔧 Configuración

Los interceptors están registrados en `app.config.ts`:

```typescript
provideHttpClient(
  withInterceptors([
    authInterceptor,      // 1. Agrega token
    errorInterceptor,     // 2. Maneja errores
    loadingInterceptor    // 3. Muestra loading
  ])
)
```

**Orden de Ejecución**:
1. Request: authInterceptor → loadingInterceptor → HTTP Request
2. Response: HTTP Response → loadingInterceptor → errorInterceptor

---

## 🎨 Loading Component

**Ubicación**: `shared/loading.component.ts`

**Características**:
- Overlay con backdrop blur
- Spinner animado con color primary
- Z-index 9999 (siempre visible)
- Responsive y centrado

**Uso**: Automático, se muestra en todas las peticiones HTTP.

---

## 💡 Uso en Componentes

### Antes (Sin Interceptors)
```typescript
this.cursosService.obtenerCursos().subscribe({
  next: (data) => {
    this.cursos = data;
    this.cargando = false;
  },
  error: (error) => {
    console.error('Error:', error);
    this.mensajeError = 'Error al cargar cursos';
    this.cargando = false;
  }
});
```

### Después (Con Interceptors)
```typescript
this.cursosService.obtenerCursos().subscribe({
  next: (data) => {
    this.cursos = data;
  },
  error: (error) => {
    // Error ya manejado por interceptor
    this.mensajeError = error.message;
  }
});
```

**Ventajas**:
- ✅ No necesitas manejar `cargando = true/false`
- ✅ Errores formateados automáticamente
- ✅ Logging automático
- ✅ Redirección automática en 401
- ✅ Token agregado automáticamente

---

## 🔐 Autenticación Automática

El `authInterceptor` agrega el token automáticamente:

```typescript
// AuthService guarda el token
login(email: string, password: string) {
  return this.http.post<LoginResponse>(url, { email, password })
    .pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      })
    );
}

// Todas las peticiones posteriores incluyen el token automáticamente
this.cursosService.crearCurso(curso).subscribe(...);
// Header: Authorization: Bearer {token}
```

---

## 🚨 Manejo de Errores Específicos

Si necesitas manejar un error específico en un componente:

```typescript
this.cursosService.eliminarCurso(id).subscribe({
  next: () => {
    this.mensajeExito = 'Curso eliminado';
  },
  error: (error) => {
    if (error.status === 403) {
      this.mensajeError = 'No tienes permisos para eliminar este curso';
    } else {
      this.mensajeError = error.message; // Mensaje del interceptor
    }
  }
});
```

---

## 🎯 Beneficios

1. **Código más limpio**: Menos código repetitivo en componentes
2. **Consistencia**: Todos los errores se manejan igual
3. **Seguridad**: Token agregado automáticamente
4. **UX mejorada**: Loading spinner global
5. **Debugging**: Logging centralizado de errores
6. **Mantenibilidad**: Cambios en un solo lugar

---

## 📝 Notas

- Los interceptors se ejecutan en TODAS las peticiones HTTP
- El orden de los interceptors importa
- `LoadingService` usa signals para reactividad
- El spinner se muestra automáticamente, no requiere código adicional
- Errores 401 limpian sesión y redirigen a login automáticamente

---

**Última actualización**: 2024  
**Angular Version**: 18
