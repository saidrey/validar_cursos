import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DataTableComponent, TableColumn } from '../../../shared/data-table.component';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { CursosService } from '../../../core/services/cursos.service';
import { Diploma } from '../../../core/models/diploma.model';
import { Curso } from '../../../core/models/curso.model';
import { TableParams } from '../../../core/models/pagination.model';

// ─── Diálogo de confirmación ─────────────────────────────────
@Component({
  selector: 'app-confirm-diploma-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="confirm-wrap">
      <div class="confirm-icon"><span class="material-symbols-outlined">warning</span></div>
      <h2 class="confirm-title">{{ data.titulo }}</h2>
      <p class="confirm-msg">{{ data.mensaje }}</p>
      <div class="confirm-actions">
        <button mat-button mat-dialog-close class="btn-cancel-confirm">Cancelar</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true">Eliminar</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-wrap { padding: 2rem 1.5rem 1.5rem; min-width: 320px; max-width: 400px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .confirm-icon .material-symbols-outlined { font-size: 52px; color: #f59e0b; display: block; }
    .confirm-title { margin: 0.25rem 0 0; font-size: 1.125rem; font-weight: 700; color: #0f172a; text-align: center; }
    .confirm-msg { margin: 0 0 0.75rem; font-size: 0.875rem; color: #64748b; text-align: center; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 8px; justify-content: flex-end; width: 100%; }
    .btn-cancel-confirm { color: #64748b; }
  `]
})
export class ConfirmDiplomaDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { titulo: string; mensaje: string };
}

// ─── Diálogo de formulario de diploma ────────────────────────
@Component({
  selector: 'app-diploma-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatSlideToggleModule],
  template: `
    <div class="dialog-header">
      <span class="material-symbols-outlined dialog-title-icon">{{ data.diploma ? 'edit' : 'workspace_premium' }}</span>
      <h2>{{ data.diploma ? 'Editar Diploma' : 'Nuevo Diploma' }}</h2>
    </div>

    <div class="dialog-body">
      <form [formGroup]="form">

        <!-- Curso -->
        <div class="field-group">
          <label class="field-label">Curso <span class="req">*</span></label>
          <select formControlName="curso_id" class="field-input" [class.field-error]="form.get('curso_id')?.invalid && form.get('curso_id')?.touched">
            <option value="">Seleccionar curso...</option>
            @for (curso of data.cursos; track curso.id) {
              <option [value]="curso.id">{{ curso.nombre }}</option>
            }
          </select>
          @if (form.get('curso_id')?.invalid && form.get('curso_id')?.touched) {
            <span class="error-msg">El curso es requerido</span>
          }
        </div>

        <!-- Nombre estudiante -->
        <div class="field-group">
          <label class="field-label">Nombre del estudiante <span class="req">*</span></label>
          <input type="text" formControlName="nombre_estudiante"
                 placeholder="Nombre completo"
                 class="field-input" [class.field-error]="form.get('nombre_estudiante')?.invalid && form.get('nombre_estudiante')?.touched">
          @if (form.get('nombre_estudiante')?.invalid && form.get('nombre_estudiante')?.touched) {
            <span class="error-msg">El nombre es requerido</span>
          }
        </div>

        <!-- Tipo doc + Documento -->
        <div class="field-row">
          <div class="field-group" style="flex: 0 0 140px">
            <label class="field-label">Tipo doc. <span class="req">*</span></label>
            <select formControlName="tipo_documento" class="field-input" [class.field-error]="form.get('tipo_documento')?.invalid && form.get('tipo_documento')?.touched">
              <option value="">--</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PA">PA</option>
              <option value="NIT">NIT</option>
            </select>
            @if (form.get('tipo_documento')?.invalid && form.get('tipo_documento')?.touched) {
              <span class="error-msg">Requerido</span>
            }
          </div>
          <div class="field-group">
            <label class="field-label">Número de documento <span class="req">*</span></label>
            <input type="text" formControlName="documento"
                   placeholder="Ej: 1234567890"
                   class="field-input" [class.field-error]="form.get('documento')?.invalid && form.get('documento')?.touched">
            @if (form.get('documento')?.invalid && form.get('documento')?.touched) {
              <span class="error-msg">El documento es requerido</span>
            }
          </div>
        </div>

        <!-- Fecha emisión -->
        <div class="field-group">
          <label class="field-label">Fecha de emisión</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">calendar_today</span>
            <input type="date" formControlName="fecha_emision" class="field-input has-icon">
          </div>
        </div>

        <!-- Código verificación (solo edición) -->
        @if (data.diploma) {
          <div class="field-group">
            <label class="field-label">Código de verificación</label>
            <div class="codigo-box">
              <span class="material-symbols-outlined" style="font-size:16px;color:#64748b">qr_code</span>
              <span class="codigo-val">{{ data.diploma.codigo_verificacion }}</span>
            </div>
          </div>
          <div class="toggle-field">
            <mat-slide-toggle formControlName="activo" color="primary">
              Diploma activo (visible para consulta pública)
            </mat-slide-toggle>
          </div>
        }

      </form>
    </div>

    <div class="dialog-footer">
      <button mat-button mat-dialog-close class="btn-cancel">Cancelar</button>
      <button mat-flat-button color="primary"
              (click)="guardar()"
              [disabled]="form.invalid || guardando"
              class="btn-save">
        @if (guardando) { Guardando... } @else { {{ data.diploma ? 'Actualizar' : 'Crear diploma' }} }
      </button>
    </div>
  `,
  styles: [`
    .dialog-header { display: flex; align-items: center; gap: 0.625rem; padding: 1.25rem 1.5rem 1rem; border-bottom: 1px solid #e2e8f0; }
    .dialog-header h2 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #0f172a; }
    .dialog-title-icon { font-size: 22px; color: #137fec; }
    .dialog-body { padding: 1.25rem 1.5rem; max-height: 65vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0; }
    .field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .field-label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
    .req { color: #ef4444; }
    .field-input { width: 100%; padding: 9px 12px; font-size: 0.875rem; color: #111827; background: #f9fafb; border: 1.5px solid #d1d5db; border-radius: 8px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; font-family: inherit; line-height: 1.5; }
    .field-input:focus { border-color: #137fec; box-shadow: 0 0 0 3px rgba(19,127,236,0.12); background: #fff; }
    .field-input.field-error { border-color: #ef4444; }
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 10px; font-size: 18px; color: #9ca3af; pointer-events: none; }
    .has-icon { padding-left: 36px; }
    .field-row { display: flex; gap: 16px; }
    .field-row .field-group { flex: 1; }
    .error-msg { font-size: 0.75rem; color: #ef4444; }
    .toggle-field { margin-top: 4px; margin-bottom: 4px; }
    .codigo-box { display: flex; align-items: center; gap: 8px; background: #f1f5f9; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
    .codigo-val { font-family: monospace; font-size: 0.875rem; color: #334155; letter-spacing: 0.05em; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0.875rem 1.5rem; border-top: 1px solid #e2e8f0; }
    .btn-cancel { color: #64748b; }
    .btn-save { font-weight: 600; }
    @media (max-width: 560px) { .field-row { flex-direction: column; gap: 0; } }
  `]
})
export class DiplomaFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DiplomaFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { diploma: Diploma | null; cursos: Curso[]; onSave: (data: any) => Promise<void> };

  guardando = false;

  form: FormGroup = this.fb.group({
    curso_id: [this.data.diploma?.curso_id ?? '', Validators.required],
    nombre_estudiante: [this.data.diploma?.nombre_estudiante ?? '', Validators.required],
    tipo_documento: [this.data.diploma?.tipo_documento ?? '', Validators.required],
    documento: [this.data.diploma?.documento ?? '', Validators.required],
    fecha_emision: [this.data.diploma?.fecha_emision ?? new Date().toISOString().split('T')[0]],
    activo: [this.data.diploma ? this.data.diploma.activo === 1 : true]
  });

  async guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const values = this.form.value;
    const payload = {
      ...values,
      curso_id: parseInt(values.curso_id),
      activo: values.activo ? 1 : 0
    };
    try {
      await this.data.onSave(payload);
      this.dialogRef.close(true);
    } finally {
      this.guardando = false;
    }
  }
}

// ─── Componente principal ─────────────────────────────────────
@Component({
  selector: 'app-gestion-diplomas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './gestion-diplomas.component.html',
  styleUrl: './gestion-diplomas.component.css'
})
export class GestionDiplomasComponent implements OnInit {
  private diplomasService = inject(DiplomasService);
  private cursosService = inject(CursosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  diplomas: Diploma[] = [];
  paginacion: any = null;
  cargando = false;
  params: TableParams = { page: 1, limit: 10, sort: 'id', order: 'DESC' };
  ocultarInactivos = false;
  private cursos: Curso[] = [];

  columnas: TableColumn[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'nombre_estudiante', label: 'Estudiante', sortable: true },
    { key: 'curso_nombre', label: 'Curso', sortable: true },
    {
      key: 'tipo_documento',
      label: 'Tipo doc.',
      sortable: false,
    },
    { key: 'documento', label: 'Documento', sortable: true },
    {
      key: 'fecha_emision',
      label: 'Fecha emisión',
      sortable: true,
      format: (v) => v ? new Date(v + 'T00:00:00').toLocaleDateString('es-CO') : '-'
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      format: (v) => Number(v) === 1 ? '● Activo' : '○ Inactivo'
    }
  ];

  rowClass = (diploma: Diploma) => Number(diploma.activo) === 0 ? 'row-inactive' : '';

  ngOnInit() {
    this.cargarDiplomas();
    this.cursosService.obtenerCursos().subscribe({
      next: (res) => this.cursos = res,
      error: () => {}
    });
  }

  toggleOcultarInactivos() {
    this.ocultarInactivos = !this.ocultarInactivos;
    this.params = { ...this.params, page: 1 };
    this.cargarDiplomas();
  }

  cargarDiplomas() {
    this.cargando = true;
    this.diplomasService.obtenerDiplomasPaginadosAdmin(this.params, this.ocultarInactivos).subscribe({
      next: (res) => {
        this.diplomas = res.data;
        this.paginacion = res.pagination;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar los diplomas', 'error');
        this.cargando = false;
      }
    });
  }

  onParamsChange(nuevosParams: TableParams) {
    this.params = { ...this.params, ...nuevosParams };
    this.cargarDiplomas();
  }

  abrirDialogoCrear() {
    this.dialog.open(DiplomaFormDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: {
        diploma: null,
        cursos: this.cursos,
        onSave: (payload: Partial<Diploma>) => new Promise<void>((resolve, reject) => {
          this.diplomasService.crearDiploma(payload).subscribe({
            next: () => { this.mostrarMensaje('Diploma creado correctamente', 'success'); this.cargarDiplomas(); resolve(); },
            error: () => { this.mostrarMensaje('Error al crear el diploma', 'error'); reject(); }
          });
        })
      }
    });
  }

  abrirDialogoEditar(diploma: Diploma) {
    this.dialog.open(DiplomaFormDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: {
        diploma,
        cursos: this.cursos,
        onSave: (payload: Partial<Diploma>) => new Promise<void>((resolve, reject) => {
          this.diplomasService.actualizarDiploma({ ...diploma, ...payload }).subscribe({
            next: () => { this.mostrarMensaje('Diploma actualizado correctamente', 'success'); this.cargarDiplomas(); resolve(); },
            error: () => { this.mostrarMensaje('Error al actualizar el diploma', 'error'); reject(); }
          });
        })
      }
    });
  }

  confirmarEliminar(diploma: Diploma) {
    const ref = this.dialog.open(ConfirmDiplomaDialogComponent, {
      panelClass: 'no-padding-dialog',
      data: {
        titulo: 'Eliminar diploma',
        mensaje: `¿Eliminar el diploma de "${diploma.nombre_estudiante}"? Esta acción no se puede deshacer.`
      }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.diplomasService.eliminarDiploma(diploma.id).subscribe({
          next: () => { this.mostrarMensaje('Diploma eliminado correctamente', 'success'); this.cargarDiplomas(); },
          error: () => this.mostrarMensaje('Error al eliminar el diploma', 'error')
        });
      }
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      panelClass: tipo === 'success' ? ['snack-success'] : ['snack-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
