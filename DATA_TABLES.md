# Sistema de Tablas Dinámicas con Paginación

Sistema completo para tablas con paginación, ordenamiento y búsqueda en backend y frontend.

---

## 📦 Componentes Implementados

### Backend (PHP)

#### 1. **Clase Pagination** (`/backend/config/Pagination.php`)

**Métodos:**

```php
// Construir query con paginación
Pagination::buildQuery($baseQuery, $params, $searchFields)

// Construir respuesta estándar
Pagination::buildResponse($data, $total, $page, $limit)
```

**Parámetros aceptados:**
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10, max: 100)
- `sort`: Campo para ordenar (default: 'id')
- `order`: ASC o DESC (default: DESC)
- `search`: Término de búsqueda

**Respuesta estándar:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 2. **Endpoint Ejemplo** (`/backend/controllers/cursos-paginados.php`)

```bash
GET /controllers/cursos-paginados.php?page=1&limit=10&sort=nombre&order=ASC&search=web
```

**Ejemplo de uso:**
```php
$baseQuery = "SELECT * FROM cursos WHERE activo = 1";
$searchFields = ['nombre', 'descripcion', 'instructor'];

$paginationData = Pagination::buildQuery($baseQuery, $_GET, $searchFields);

// Obtener total
$countStmt = $db->prepare($paginationData['countQuery']);
$countStmt->execute();
$total = $countStmt->fetch()['total'];

// Obtener datos
$stmt = $db->prepare($paginationData['query']);
$stmt->bindValue(':limit', $paginationData['limit'], PDO::PARAM_INT);
$stmt->bindValue(':offset', $paginationData['offset'], PDO::PARAM_INT);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Respuesta
$response = Pagination::buildResponse($data, $total, $page, $limit);
echo json_encode($response);
```

---

### Frontend (Angular + Material)

#### 1. **Angular Material Instalado**

```bash
ng add @angular/material
```

**Módulos disponibles:**
- MatTableModule
- MatPaginatorModule
- MatSortModule
- MatInputModule
- MatFormFieldModule

#### 2. **Interfaces** (`/frontend/src/app/core/models/pagination.model.ts`)

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TableParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}
```

#### 3. **Componente Reutilizable** (`/frontend/src/app/shared/data-table.component.ts`)

**Uso:**

```typescript
// En tu componente
import { DataTableComponent, TableColumn } from './shared/data-table.component';

columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { 
    key: 'precio', 
    label: 'Precio', 
    sortable: true,
    format: (value) => `$${value}`
  },
  { key: 'fecha_creacion', label: 'Fecha', sortable: true }
];

cursos: Curso[] = [];
pagination: any;

onParamsChange(params: TableParams) {
  // Cargar datos con nuevos parámetros
  this.loadData(params);
}
```

**Template:**

```html
<app-data-table
  [columns]="columns"
  [data]="cursos"
  [pagination]="pagination"
  [hasActions]="true"
  (paramsChange)="onParamsChange($event)">
  
  <!-- Acciones personalizadas -->
  <ng-template actions let-row>
    <button (click)="edit(row)">Editar</button>
    <button (click)="delete(row)">Eliminar</button>
  </ng-template>
</app-data-table>
```

#### 4. **Servicio de Paginación** (`/frontend/src/app/core/services/pagination.service.ts`)

```typescript
import { PaginationService } from './core/services/pagination.service';

constructor(private paginationService: PaginationService) {}

loadData(params: TableParams) {
  this.paginationService
    .getPaginated<Curso>('http://localhost:8080/controllers/cursos-paginados.php', params)
    .subscribe(response => {
      this.cursos = response.data;
      this.pagination = response.pagination;
    });
}
```

---

## 🎯 Ejemplo Completo

### Backend: Crear endpoint paginado

```php
<?php
// /backend/controllers/diplomas-paginados.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/Database.php';
include_once '../config/Pagination.php';
include_once '../middleware/auth.php';

// Requiere admin
$user = requireAdmin();

$database = new Database();
$db = $database->getConnection();

$baseQuery = "SELECT d.*, c.nombre as curso_nombre 
              FROM diplomas d 
              LEFT JOIN cursos c ON d.curso_id = c.id 
              WHERE d.activo = 1";

$searchFields = ['d.nombre_estudiante', 'd.documento', 'c.nombre'];

$paginationData = Pagination::buildQuery($baseQuery, $_GET, $searchFields);

// Total
$countStmt = $db->prepare($paginationData['countQuery']);
foreach ($paginationData['bindParams'] as $key => $value) {
    $countStmt->bindValue($key, $value);
}
$countStmt->execute();
$total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

// Datos
$stmt = $db->prepare($paginationData['query']);
foreach ($paginationData['bindParams'] as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->bindValue(':limit', $paginationData['limit'], PDO::PARAM_INT);
$stmt->bindValue(':offset', $paginationData['offset'], PDO::PARAM_INT);
$stmt->execute();

$diplomas = $stmt->fetchAll(PDO::FETCH_ASSOC);

$response = Pagination::buildResponse(
    $diplomas,
    $total,
    $paginationData['page'],
    $paginationData['limit']
);

echo json_encode($response);
```

### Frontend: Componente con tabla

```typescript
// diplomas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { DataTableComponent, TableColumn } from '../../shared/data-table.component';
import { PaginationService } from '../../core/services/pagination.service';
import { TableParams } from '../../core/models/pagination.model';

@Component({
  selector: 'app-diplomas-list',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">Gestión de Diplomas</h1>
      
      <app-data-table
        [columns]="columns"
        [data]="diplomas"
        [pagination]="pagination"
        [hasActions]="true"
        (paramsChange)="onParamsChange($event)">
        
        <ng-template actions let-row>
          <button (click)="edit(row)" class="text-blue-600">Editar</button>
          <button (click)="delete(row)" class="text-red-600 ml-2">Eliminar</button>
        </ng-template>
      </app-data-table>
    </div>
  `
})
export class DiplomasListComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre_estudiante', label: 'Estudiante', sortable: true },
    { key: 'documento', label: 'Documento', sortable: true },
    { key: 'curso_nombre', label: 'Curso', sortable: true },
    { 
      key: 'fecha_emision', 
      label: 'Fecha', 
      sortable: true,
      format: (value) => new Date(value).toLocaleDateString()
    }
  ];

  diplomas: any[] = [];
  pagination: any;
  currentParams: TableParams = { page: 1, limit: 10 };

  constructor(private paginationService: PaginationService) {}

  ngOnInit() {
    this.loadData(this.currentParams);
  }

  onParamsChange(params: TableParams) {
    this.currentParams = { ...this.currentParams, ...params };
    this.loadData(this.currentParams);
  }

  loadData(params: TableParams) {
    this.paginationService
      .getPaginated('http://localhost:8080/controllers/diplomas-paginados.php', params)
      .subscribe(response => {
        this.diplomas = response.data;
        this.pagination = response.pagination;
      });
  }

  edit(diploma: any) {
    console.log('Editar', diploma);
  }

  delete(diploma: any) {
    console.log('Eliminar', diploma);
  }
}
```

---

## 🎨 Características

### Backend
- ✅ Paginación automática
- ✅ Ordenamiento por cualquier campo
- ✅ Búsqueda en múltiples campos
- ✅ Límite máximo de 100 registros por página
- ✅ Respuesta estándar consistente
- ✅ SQL injection protection (prepared statements)

### Frontend
- ✅ Componente reutilizable
- ✅ Material Design
- ✅ Búsqueda en tiempo real
- ✅ Ordenamiento por columnas
- ✅ Paginador con opciones
- ✅ Columnas personalizables
- ✅ Formateo de datos
- ✅ Acciones personalizadas
- ✅ Responsive

---

## 📊 Ventajas

1. **Reutilizable**: Un componente para todas las tablas
2. **Consistente**: Misma UX en toda la app
3. **Performante**: Solo carga datos necesarios
4. **Escalable**: Funciona con miles de registros
5. **Mantenible**: Código centralizado
6. **Accesible**: Material Design incluye a11y

---

## 🚀 Próximos Pasos

Para usar en zona privada:

1. **Crear endpoints paginados** para cada entidad:
   - `/controllers/cursos-paginados.php` ✅
   - `/controllers/diplomas-paginados.php`
   - `/controllers/usuarios-paginados.php`
   - `/controllers/correos-enviados-paginados.php`

2. **Crear componentes de lista** para cada entidad:
   - `cursos-list.component.ts`
   - `diplomas-list.component.ts`
   - `usuarios-list.component.ts`

3. **Agregar filtros avanzados** (opcional):
   - Filtro por fecha
   - Filtro por estado
   - Filtro por categoría

---

## 📝 Archivos Creados

### Backend
- ✅ `/backend/config/Pagination.php`
- ✅ `/backend/controllers/cursos-paginados.php`

### Frontend
- ✅ `/frontend/src/app/core/models/pagination.model.ts`
- ✅ `/frontend/src/app/core/services/pagination.service.ts`
- ✅ `/frontend/src/app/shared/data-table.component.ts`

---

**Estado**: ✅ Listo para usar en zona privada  
**Requiere**: Angular Material instalado
