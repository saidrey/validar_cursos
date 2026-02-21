# JWT (JSON Web Tokens) - Guía Completa

## 📚 ¿Qué es JWT?

**JWT (JSON Web Token)** es un estándar abierto (RFC 7519) para transmitir información de forma segura entre dos partes como un objeto JSON.

### Estructura de un JWT

Un JWT tiene 3 partes separadas por puntos (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                      │                                                    │
│         HEADER                       │              PAYLOAD                               │         SIGNATURE
```

#### 1. **Header** (Encabezado)
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: Algoritmo de encriptación (HS256, RS256, etc.)
- `typ`: Tipo de token (siempre JWT)

#### 2. **Payload** (Datos)
```json
{
  "user_id": 1,
  "email": "admin@example.com",
  "rol": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}
```
- Contiene los **claims** (datos del usuario)
- `iat`: Issued At (cuándo se creó)
- `exp`: Expiration (cuándo expira)
- Puedes agregar datos personalizados

#### 3. **Signature** (Firma)
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```
- Garantiza que el token no fue modificado
- Solo el servidor puede crear/verificar la firma

---

## 🔐 ¿Por qué usar JWT?

### ❌ Problema con Sesiones Tradicionales

**Sesiones con Cookies (método antiguo)**:
```
1. Usuario hace login
2. Servidor crea sesión en memoria/BD
3. Servidor envía cookie con session_id
4. Cliente envía cookie en cada petición
5. Servidor busca sesión en BD
```

**Problemas**:
- ❌ Servidor debe guardar sesiones (consume memoria)
- ❌ No funciona bien con múltiples servidores
- ❌ Difícil escalar horizontalmente
- ❌ Requiere base de datos para sesiones

### ✅ Ventajas de JWT

**Autenticación Stateless (sin estado)**:
```
1. Usuario hace login
2. Servidor genera JWT y lo envía
3. Cliente guarda JWT (localStorage)
4. Cliente envía JWT en cada petición
5. Servidor verifica firma (sin consultar BD)
```

**Ventajas**:
- ✅ **Stateless**: Servidor no guarda sesiones
- ✅ **Escalable**: Funciona con múltiples servidores
- ✅ **Rápido**: No consulta BD en cada petición
- ✅ **Portable**: Funciona en web, móvil, APIs
- ✅ **Self-contained**: Token contiene toda la info

---

## 🚀 Implementación en tu Proyecto

### **Estado Actual: NO tienes JWT implementado**

Actualmente tu backend NO genera JWT. Solo valida email/password y retorna el usuario:

```php
// backend/controllers/login.php (ACTUAL)
if(password_verify($data->password, $result['password'])) {
    unset($result['password']);
    echo json_encode([
        'mensaje' => 'Login exitoso',
        'usuario' => $result  // Solo retorna usuario, NO token
    ]);
}
```

### **Lo que necesitas implementar:**

---

## 📦 Paso 1: Instalar Librería JWT en PHP

```bash
cd /workspace/backend
composer require firebase/php-jwt
```

---

## 📝 Paso 2: Crear Clase JWT Helper

**Archivo**: `/workspace/backend/config/JWT.php`

```php
<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {
    // Clave secreta (CAMBIAR en producción)
    private static $secret_key = "tu_clave_secreta_super_segura_2024";
    private static $algorithm = 'HS256';
    private static $expiration_time = 86400; // 24 horas en segundos

    // Generar token
    public static function generateToken($user_data) {
        $issued_at = time();
        $expiration = $issued_at + self::$expiration_time;

        $payload = [
            'iat' => $issued_at,           // Issued at
            'exp' => $expiration,          // Expiration
            'user_id' => $user_data['id'],
            'email' => $user_data['email'],
            'rol' => $user_data['rol']
        ];

        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }

    // Verificar y decodificar token
    public static function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::$secret_key, self::$algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    // Obtener token del header Authorization
    public static function getBearerToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
```

---

## 🔧 Paso 3: Actualizar Login para Generar JWT

**Archivo**: `/workspace/backend/controllers/login.php`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/Database.php';
include_once '../config/JWT.php';
include_once '../models/Usuario.php';

$method = $_SERVER['REQUEST_METHOD'];

if($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->email) && !empty($data->password)) {
        $database = new Database();
        $db = $database->getConnection();
        $usuario = new Usuario($db);
        
        $usuario->email = $data->email;
        $result = $usuario->login();

        if($result && password_verify($data->password, $result['password'])) {
            // Generar JWT
            $token = JWTHandler::generateToken($result);
            
            unset($result['password']);
            
            http_response_code(200);
            echo json_encode([
                'mensaje' => 'Login exitoso',
                'token' => $token,        // ← NUEVO: Token JWT
                'usuario' => $result
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['mensaje' => 'Credenciales inválidas']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['mensaje' => 'Email y contraseña requeridos']);
    }
} else {
    http_response_code(405);
    echo json_encode(['mensaje' => 'Método no permitido']);
}
```

---

## 🛡️ Paso 4: Crear Middleware de Autenticación

**Archivo**: `/workspace/backend/middleware/auth.php`

```php
<?php
include_once __DIR__ . '/../config/JWT.php';

function requireAuth() {
    $token = JWTHandler::getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['mensaje' => 'Token no proporcionado']);
        exit();
    }
    
    $decoded = JWTHandler::validateToken($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['mensaje' => 'Token inválido o expirado']);
        exit();
    }
    
    return $decoded; // Retorna datos del usuario
}

function requireAdmin() {
    $user = requireAuth();
    
    if ($user['rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['mensaje' => 'Acceso denegado. Se requiere rol de administrador']);
        exit();
    }
    
    return $user;
}
```

---

## 🔒 Paso 5: Proteger Endpoints

**Ejemplo**: Proteger CRUD de cursos (solo admin)

**Archivo**: `/workspace/backend/controllers/cursos.php`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../config/Database.php';
include_once '../models/Curso.php';
include_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$curso = new Curso($db);

switch($method) {
    case 'GET':
        // GET es público (no requiere auth)
        if(isset($_GET['id'])) {
            $curso->id = $_GET['id'];
            $result = $curso->leerUno();
            echo json_encode($result ?: ['mensaje' => 'Curso no encontrado']);
        } else {
            $stmt = $curso->leer();
            $cursos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($cursos);
        }
        break;

    case 'POST':
        // POST requiere autenticación de admin
        $user = requireAdmin(); // ← Valida token y rol
        
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->nombre)) {
            $curso->nombre = $data->nombre;
            $curso->descripcion = $data->descripcion ?? '';
            $curso->resumen = $data->resumen ?? '';
            $curso->duracion = $data->duracion ?? '';
            $curso->instructor = $data->instructor ?? '';
            $curso->precio = $data->precio ?? 0;
            $curso->imagen = $data->imagen ?? '';

            if($curso->crear()) {
                http_response_code(201);
                echo json_encode(['mensaje' => 'Curso creado exitosamente']);
            } else {
                http_response_code(503);
                echo json_encode(['mensaje' => 'Error al crear curso']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['mensaje' => 'Nombre del curso requerido']);
        }
        break;

    case 'PUT':
        $user = requireAdmin(); // ← Valida token y rol
        // ... resto del código
        break;

    case 'DELETE':
        $user = requireAdmin(); // ← Valida token y rol
        // ... resto del código
        break;

    default:
        http_response_code(405);
        echo json_encode(['mensaje' => 'Método no permitido']);
        break;
}
```

---

## 🎯 Flujo Completo con JWT

```
┌─────────────┐                    ┌─────────────┐
│   CLIENTE   │                    │   SERVIDOR  │
│  (Angular)  │                    │    (PHP)    │
└─────────────┘                    └─────────────┘
       │                                  │
       │  1. POST /login                  │
       │  { email, password }             │
       ├─────────────────────────────────>│
       │                                  │
       │                                  │ 2. Valida credenciales
       │                                  │ 3. Genera JWT
       │                                  │
       │  4. { token, usuario }           │
       │<─────────────────────────────────┤
       │                                  │
       │ 5. Guarda token en localStorage  │
       │                                  │
       │  6. POST /cursos                 │
       │  Header: Authorization: Bearer {token}
       ├─────────────────────────────────>│
       │                                  │
       │                                  │ 7. Valida token
       │                                  │ 8. Verifica rol
       │                                  │ 9. Ejecuta acción
       │                                  │
       │  10. { mensaje: "Curso creado" } │
       │<─────────────────────────────────┤
       │                                  │
```

---

## 💻 Frontend (Angular) - Ya Implementado

Tu `authInterceptor` ya está listo para enviar el token:

```typescript
// core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // ← Envía token automáticamente
      }
    });
  }
  
  return next(req);
};
```

**AuthService** debe guardar el token:

```typescript
// core/services/auth.service.ts
login(email: string, password: string) {
  return this.http.post<LoginResponse>(this.apiUrl, { email, password })
    .pipe(
      tap(response => {
        localStorage.setItem('token', response.token);  // ← Guarda token
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.usuarioSignal.set(response.usuario);
      })
    );
}
```

---

## 🔍 Verificar JWT (Debugging)

Puedes decodificar un JWT en: **https://jwt.io**

Pega tu token y verás:
- Header
- Payload (datos del usuario)
- Signature (verificación)

**Ejemplo de token decodificado**:
```json
{
  "iat": 1708300800,
  "exp": 1708387200,
  "user_id": 1,
  "email": "admin@example.com",
  "rol": "admin"
}
```

---

## ⚠️ Seguridad - Mejores Prácticas

### ✅ DO (Hacer)
- ✅ Usar HTTPS en producción
- ✅ Guardar secret_key en variable de entorno
- ✅ Establecer tiempo de expiración corto (1-24 horas)
- ✅ Validar token en cada petición protegida
- ✅ Usar algoritmo HS256 o RS256
- ✅ Limpiar token al hacer logout

### ❌ DON'T (No hacer)
- ❌ Guardar datos sensibles en el payload (contraseñas, tarjetas)
- ❌ Usar secret_key débil o predecible
- ❌ Compartir secret_key en el código
- ❌ Tokens sin expiración
- ❌ Enviar token en URL (solo en headers)

---

## 🆚 JWT vs Sesiones

| Característica | JWT | Sesiones |
|----------------|-----|----------|
| Estado | Stateless | Stateful |
| Almacenamiento servidor | No | Sí (memoria/BD) |
| Escalabilidad | Excelente | Limitada |
| Revocación | Difícil | Fácil |
| Tamaño | Grande (~200 bytes) | Pequeño (session_id) |
| Velocidad | Rápido | Requiere consulta BD |
| Uso | APIs, microservicios | Apps monolíticas |

---

## 📝 Resumen

**JWT es un token autofirmado que:**
1. Se genera al hacer login
2. Contiene datos del usuario (id, email, rol)
3. Tiene fecha de expiración
4. Se envía en cada petición (header Authorization)
5. El servidor lo valida sin consultar BD
6. Permite autenticación stateless y escalable

**En tu proyecto:**
- ✅ Frontend ya tiene interceptor listo
- ❌ Backend NO genera JWT (debes implementarlo)
- 🔧 Necesitas instalar `firebase/php-jwt`
- 🔧 Crear clase JWTHandler
- 🔧 Actualizar login.php
- 🔧 Proteger endpoints con middleware

---

**¿Quieres que implemente JWT en el backend ahora?**
