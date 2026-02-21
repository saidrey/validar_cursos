import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { PaginatedResponse, TableParams } from '../core/models/pagination.model';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  format?: (value: any) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ],
  template: `
    <div class="data-table-container">

      <!-- Búsqueda -->
      <div class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (keyup.enter)="onSearch()"
          placeholder="Buscar..."
          class="search-input">
        @if (searchTerm) {
          <button class="search-clear" (click)="searchTerm = ''; onSearch()" title="Limpiar">
            <span class="material-symbols-outlined">close</span>
          </button>
        }
        <button class="search-btn" (click)="onSearch()">Buscar</button>
      </div>

      <!-- Tabla -->
      <div class="mat-elevation-z2 rounded-lg overflow-x-auto">
        <table mat-table [dataSource]="data" matSort (matSortChange)="onSort($event)" class="w-full">

          <!-- Columnas dinámicas -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef
                [mat-sort-header]="column.sortable !== false ? column.key : ''"
                [disabled]="column.sortable === false">
              {{ column.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              {{ column.format ? column.format(row[column.key]) : row[column.key] }}
            </td>
          </ng-container>

          <!-- Columna de acciones -->
          <ng-container matColumnDef="actions" *ngIf="hasActions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
            <td mat-cell *matCellDef="let row" class="actions-cell">
              <button class="action-btn edit-btn"
                      (click)="editItem.emit(row)"
                      matTooltip="Editar">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn delete-btn"
                      (click)="deleteItem.emit(row)"
                      matTooltip="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="table-row"
              [class]="rowClass ? rowClass(row) : ''"></tr>

          <!-- Sin resultados -->
          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length">
              <div class="no-data">
                <span class="material-symbols-outlined">search_off</span>
                <span>No se encontraron resultados</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Paginador -->
        <mat-paginator
          [length]="pagination?.total || 0"
          [pageSize]="pagination?.limit || 10"
          [pageIndex]="(pagination?.page || 1) - 1"
          [pageSizeOptions]="[5, 10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container { width: 100%; }

    /* ── Buscador ─────────────────────────────── */
    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 0;
      background: #f9fafb;
      border: 1.5px solid #d1d5db;
      border-radius: 10px;
      padding: 0 4px 0 12px;
      margin-bottom: 1rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-wrapper:focus-within {
      border-color: #137fec;
      box-shadow: 0 0 0 3px rgba(19,127,236,0.12);
      background: #fff;
    }

    .search-icon {
      font-size: 20px;
      color: #9ca3af;
      flex-shrink: 0;
      pointer-events: none;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 10px 8px;
      font-size: 0.875rem;
      color: #111827;
      font-family: inherit;
    }

    .search-clear {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      color: #9ca3af;
      transition: background 0.15s, color 0.15s;
    }
    .search-clear:hover { background: #f1f5f9; color: #64748b; }
    .search-clear .material-symbols-outlined { font-size: 18px; }

    .search-btn {
      background: #137fec;
      color: white;
      border: none;
      border-radius: 7px;
      padding: 7px 16px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      margin: 4px;
      transition: background 0.15s;
      font-family: inherit;
    }
    .search-btn:hover { background: #0f6fd4; }

    /* ── Tabla ────────────────────────────────── */
    table { width: 100%; }

    th.mat-header-cell {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #334155;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    tr.table-row:hover { background-color: #f8fafc; }

    .actions-header { width: 100px; text-align: center; }
    .actions-cell { text-align: center; white-space: nowrap; }

    /* Botones de acción */
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      transition: background 0.15s, color 0.15s;
    }
    .action-btn .material-symbols-outlined { font-size: 18px; }

    .edit-btn  { color: #137fec; }
    .edit-btn:hover  { background: #e0f2fe; }
    .delete-btn { color: #dc2626; }
    .delete-btn:hover { background: #fee2e2; }

    /* Fila inactiva */
    tr.row-inactive td { opacity: 0.45; }
    tr.row-inactive { background: #f8fafc; }

    /* Sin resultados */
    .no-data-row .mat-cell { padding: 2rem; }
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .no-data .material-symbols-outlined { font-size: 22px; }
  `]
})
export class DataTableComponent<T> implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() pagination?: PaginatedResponse<T>['pagination'];
  @Input() hasActions = false;
  @Input() rowClass?: (row: T) => string;

  @Output() paramsChange = new EventEmitter<TableParams>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();

  searchTerm = '';
  displayedColumns: string[] = [];

  ngOnInit() {
    this.displayedColumns = this.columns.map(c => c.key);
    if (this.hasActions) {
      this.displayedColumns.push('actions');
    }
  }

  onPageChange(event: PageEvent) {
    this.paramsChange.emit({
      page: event.pageIndex + 1,
      limit: event.pageSize
    });
  }

  onSort(sort: Sort) {
    if (sort.direction) {
      this.paramsChange.emit({
        sort: sort.active,
        order: sort.direction.toUpperCase() as 'ASC' | 'DESC',
        page: 1
      });
    }
  }

  onSearch() {
    this.paramsChange.emit({
      search: this.searchTerm,
      page: 1
    });
  }
}
