import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DataTableComponent, TableColumn } from '../../../shared/data-table.component';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso, Pregunta } from '../../../core/models/curso.model';
import { TableParams } from '../../../core/models/pagination.model';

// ─── Diálogo de confirmación ─────────────────────────────────
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="confirm-wrap">
      <div class="confirm-icon">
        <span class="material-symbols-outlined">warning</span>
      </div>
      <h2 class="confirm-title">{{ data.titulo }}</h2>
      <p class="confirm-msg">{{ data.mensaje }}</p>
      <div class="confirm-actions">
        <button mat-button mat-dialog-close class="btn-cancel-confirm">Cancelar</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true">Eliminar</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-wrap {
      padding: 2rem 1.5rem 1.5rem;
      min-width: 320px;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .confirm-icon .material-symbols-outlined {
      font-size: 52px;
      color: #f59e0b;
      display: block;
    }
    .confirm-title {
      margin: 0.25rem 0 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      text-align: center;
    }
    .confirm-msg {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
      color: #64748b;
      text-align: center;
      line-height: 1.5;
    }
    .confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      width: 100%;
    }
    .btn-cancel-confirm { color: #64748b; }
  `]
})
export class ConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { titulo: string; mensaje: string };
}

// ─── Diálogo de formulario de curso ──────────────────────────
@Component({
  selector: 'app-curso-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatSlideToggleModule
  ],
  template: `
    <div class="dialog-header">
      <span class="material-symbols-outlined dialog-title-icon">{{ data.curso ? 'edit' : 'add_circle' }}</span>
      <h2>{{ data.curso ? 'Editar Curso' : 'Nuevo Curso' }}</h2>
    </div>

    <div class="dialog-body">
      <form [formGroup]="form">

        <!-- Nombre -->
        <div class="field-group">
          <label class="field-label">Nombre del curso <span class="req">*</span></label>
          <input type="text" formControlName="nombre"
                 placeholder="Ej: Desarrollo Web con Angular"
                 class="field-input" [class.field-error]="form.get('nombre')?.invalid && form.get('nombre')?.touched">
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <span class="error-msg">El nombre es requerido</span>
          }
        </div>

        <!-- Resumen -->
        <div class="field-group">
          <label class="field-label">Resumen</label>
          <input type="text" formControlName="resumen"
                 placeholder="Descripción corta para listados"
                 class="field-input">
        </div>

        <!-- Descripción -->
        <div class="field-group">
          <label class="field-label">Descripción</label>
          <textarea formControlName="descripcion" rows="3"
                    placeholder="Descripción completa del curso"
                    class="field-input field-textarea"></textarea>
        </div>

        <!-- Duración -->
        <div class="field-group">
          <label class="field-label">Duración</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">schedule</span>
            <input type="text" formControlName="duracion"
                   placeholder="Ej: 40 horas"
                   class="field-input has-icon">
          </div>
        </div>

        <!-- Imagen -->
        <div class="field-group">
          <label class="field-label">Imagen del curso</label>

          @if (previewUrl()) {
            <div class="img-preview-wrap">
              <img [src]="previewUrl()" alt="Preview" class="img-preview">
              <button type="button" class="img-remove-btn" (click)="quitarImagen()" title="Quitar imagen">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          }

          <label class="img-upload-label" [class.uploading]="subiendoImg()">
            <span class="material-symbols-outlined">{{ subiendoImg() ? 'hourglass_empty' : 'upload' }}</span>
            <span>{{ subiendoImg() ? 'Subiendo...' : (previewUrl() ? 'Cambiar imagen' : 'Seleccionar imagen') }}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp"
                   class="img-file-input" [disabled]="subiendoImg()"
                   (change)="onFileSelected($event)">
          </label>
          <span class="field-hint">JPG, PNG o WebP · Máx. 5 MB</span>
        </div>

        <!-- Video URL 1 -->
        <div class="field-group">
          <label class="field-label">Recurso 1 — URL YouTube</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">smart_display</span>
            <input type="url" formControlName="video_url_1"
                   placeholder="https://www.youtube.com/watch?v=..."
                   class="field-input has-icon">
          </div>
          <span class="field-hint">Pega el link de YouTube del primer video del curso</span>
        </div>

        <!-- Video URL 2 -->
        <div class="field-group">
          <label class="field-label">Recurso 2 — URL YouTube (opcional)</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">smart_display</span>
            <input type="url" formControlName="video_url_2"
                   placeholder="https://www.youtube.com/watch?v=..."
                   class="field-input has-icon">
          </div>
        </div>

        <!-- Contenido Markdown -->
        <div class="field-group">
          <label class="field-label">Contenido del curso (Markdown)</label>
          <textarea formControlName="contenido_markdown" rows="8"
                    placeholder="# Título&#10;## Sección&#10;Escribe aquí el contenido en formato Markdown..."
                    class="field-input field-textarea" style="font-family: monospace; font-size: 0.8125rem;"></textarea>
          <span class="field-hint">Soporta: # Títulos, **negrita**, *cursiva*, - listas</span>
        </div>

        <!-- Examen / Preguntas -->
        <div class="field-group">
          <div class="exam-header">
            <label class="field-label">Examen del curso</label>
            <button type="button" class="btn-agregar-pregunta" (click)="agregarPregunta()">
              <span class="material-symbols-outlined">add_circle</span>
              Agregar pregunta
            </button>
          </div>

          @if (preguntas().length === 0) {
            <div class="sin-preguntas">
              <span class="material-symbols-outlined">quiz</span>
              <span>Sin preguntas. El curso no tendrá examen.</span>
            </div>
          }

          @for (p of preguntas(); track $index; let pi = $index) {
            <div class="pregunta-card">
              <div class="pregunta-encabezado">
                <span class="pregunta-num">{{ pi + 1 }}</span>
                <input type="text"
                       class="field-input pregunta-texto"
                       [value]="p.pregunta"
                       placeholder="Escribe la pregunta aquí..."
                       (input)="actualizarTexto(pi, $any($event.target).value)">
                <button type="button" class="btn-eliminar-pregunta" (click)="eliminarPregunta(pi)" title="Eliminar pregunta">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
              <div class="opciones-wrap">
                @for (op of p.opciones; track $index; let oi = $index) {
                  <div class="opcion-fila">
                    <input type="radio"
                           [name]="'respuesta_' + pi"
                           [checked]="p.respuesta_correcta === oi"
                           (change)="setRespuesta(pi, oi)"
                           class="opcion-radio"
                           title="Marcar como respuesta correcta">
                    <input type="text"
                           class="field-input opcion-input"
                           [value]="op"
                           [placeholder]="'Opción ' + (oi + 1)"
                           (input)="actualizarOpcion(pi, oi, $any($event.target).value)">
                    @if (p.opciones.length > 2) {
                      <button type="button" class="btn-quitar-opcion" (click)="eliminarOpcion(pi, oi)" title="Quitar opción">
                        <span class="material-symbols-outlined">remove</span>
                      </button>
                    }
                  </div>
                }
              </div>
              @if (p.opciones.length < 6) {
                <button type="button" class="btn-add-opcion" (click)="agregarOpcion(pi)">
                  + Añadir opción
                </button>
              }
              @if (p.respuesta_correcta === -1) {
                <span class="error-msg">Selecciona la respuesta correcta con el radio button</span>
              }
            </div>
          }
          <span class="field-hint">Define las preguntas del examen y marca con el círculo la opción correcta.</span>
        </div>

        <!-- Estado (solo en edición) -->
        @if (data.curso) {
          <div class="toggle-field">
            <mat-slide-toggle formControlName="activo" color="primary">
              Curso activo (visible en el sitio)
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
        @if (guardando) { Guardando... } @else { {{ data.curso ? 'Actualizar' : 'Crear curso' }} }
      </button>
    </div>
  `,
  styles: [`
    /* Header */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1.25rem 1.5rem 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .dialog-header h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
    }
    .dialog-title-icon { font-size: 22px; color: #137fec; }

    /* Body */
    .dialog-body {
      padding: 1.25rem 1.5rem;
      max-height: 65vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Fields */
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 14px;
    }
    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #374151;
    }
    .req { color: #ef4444; }

    .field-input {
      width: 100%;
      padding: 9px 12px;
      font-size: 0.875rem;
      color: #111827;
      background: #f9fafb;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
      font-family: inherit;
      line-height: 1.5;
    }
    .field-input:focus {
      border-color: #137fec;
      box-shadow: 0 0 0 3px rgba(19,127,236,0.12);
      background: #fff;
    }
    .field-input.field-error {
      border-color: #ef4444;
    }
    .field-textarea {
      resize: vertical;
      min-height: 80px;
    }

    /* Input with icon */
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 10px;
      font-size: 18px;
      color: #9ca3af;
      pointer-events: none;
    }
    .input-prefix {
      position: absolute;
      left: 12px;
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
      pointer-events: none;
    }
    .has-icon { padding-left: 36px; }
    .has-prefix { padding-left: 22px; }

    /* Row layout */
    .field-row {
      display: flex;
      gap: 16px;
    }
    .field-row .field-group { flex: 1; }

    /* Error */
    .error-msg {
      font-size: 0.75rem;
      color: #ef4444;
    }

    /* Toggle */
    .toggle-field {
      margin-top: 4px;
      margin-bottom: 4px;
    }

    /* Image upload */
    .img-preview-wrap {
      position: relative;
      display: inline-block;
      margin-bottom: 8px;
    }
    .img-preview {
      display: block;
      width: 100%;
      max-height: 160px;
      object-fit: cover;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
    }
    .img-remove-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0,0,0,0.55);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      padding: 0;
    }
    .img-remove-btn .material-symbols-outlined { font-size: 16px; }
    .img-upload-label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 14px;
      border: 1.5px dashed #93c5fd;
      border-radius: 8px;
      background: #eff6ff;
      color: #137fec;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .img-upload-label:hover { background: #dbeafe; }
    .img-upload-label.uploading { opacity: 0.6; cursor: not-allowed; }
    .img-upload-label .material-symbols-outlined { font-size: 18px; }
    .img-file-input { display: none; }
    .field-hint {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* Exam questions */
    .exam-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .btn-agregar-pregunta {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #eff6ff;
      color: #137fec;
      border: 1.5px solid #bfdbfe;
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }
    .btn-agregar-pregunta:hover { background: #dbeafe; }
    .btn-agregar-pregunta .material-symbols-outlined { font-size: 16px; }
    .sin-preguntas {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 12px;
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.8125rem;
      margin-bottom: 4px;
    }
    .sin-preguntas .material-symbols-outlined { font-size: 20px; }
    .pregunta-card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .pregunta-encabezado {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .pregunta-num {
      background: #137fec;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pregunta-texto { flex: 1; }
    .btn-eliminar-pregunta {
      background: none;
      border: none;
      cursor: pointer;
      color: #ef4444;
      padding: 4px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .btn-eliminar-pregunta:hover { background: #fee2e2; }
    .btn-eliminar-pregunta .material-symbols-outlined { font-size: 18px; }
    .opciones-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .opcion-fila { display: flex; align-items: center; gap: 6px; }
    .opcion-radio { width: 16px; height: 16px; flex-shrink: 0; cursor: pointer; accent-color: #137fec; }
    .opcion-input { flex: 1; }
    .btn-quitar-opcion {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 2px;
      display: flex;
      align-items: center;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .btn-quitar-opcion:hover { color: #ef4444; }
    .btn-quitar-opcion .material-symbols-outlined { font-size: 16px; }
    .btn-add-opcion {
      background: none;
      border: none;
      cursor: pointer;
      color: #137fec;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 4px 0;
      font-family: inherit;
    }
    .btn-add-opcion:hover { text-decoration: underline; }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 0.875rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel { color: #64748b; }
    .btn-save { font-weight: 600; }

    @media (max-width: 560px) {
      .field-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class CursoFormDialogComponent {
  private fb            = inject(FormBuilder);
  private dialogRef     = inject(MatDialogRef<CursoFormDialogComponent>);
  private cursosService = inject(CursosService);
  data = inject(MAT_DIALOG_DATA) as { curso: Curso | null; onSave: (data: any) => Promise<void> };

  guardando     = false;
  subiendoImg   = signal(false);
  previewUrl    = signal<string>(this.data.curso?.imagen ?? '');
  preguntas     = signal<Pregunta[]>(
    this.data.curso?.preguntas
      ? this.data.curso.preguntas.map(p => ({ ...p, opciones: [...p.opciones] }))
      : []
  );

  form: FormGroup = this.fb.group({
    nombre:               [this.data.curso?.nombre               ?? '', Validators.required],
    instructor:           ['N/A'],
    resumen:              [this.data.curso?.resumen              ?? ''],
    descripcion:          [this.data.curso?.descripcion          ?? ''],
    duracion:             [this.data.curso?.duracion             ?? ''],
    precio:               [0],
    imagen:               [this.data.curso?.imagen               ?? ''],
    video_url_1:          [this.data.curso?.video_url_1          ?? ''],
    video_url_2:          [this.data.curso?.video_url_2          ?? ''],
    contenido_markdown:   [this.data.curso?.contenido_markdown   ?? ''],
    activo:               [this.data.curso ? this.data.curso.activo === 1 : true]
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG o WebP');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5 MB');
      input.value = '';
      return;
    }

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    // Subir al servidor
    this.subiendoImg.set(true);
    this.cursosService.subirImagen(file).subscribe({
      next: (res) => {
        this.form.patchValue({ imagen: res.url });
        this.previewUrl.set(res.url);
        this.subiendoImg.set(false);
      },
      error: () => {
        alert('Error al subir la imagen. Intenta de nuevo.');
        this.previewUrl.set(this.form.value.imagen ?? '');
        this.subiendoImg.set(false);
        input.value = '';
      }
    });
  }

  quitarImagen() {
    this.form.patchValue({ imagen: '' });
    this.previewUrl.set('');
  }

  agregarPregunta() {
    this.preguntas.update(ps => [...ps, { pregunta: '', opciones: ['', '', '', ''], respuesta_correcta: -1 }]);
  }

  eliminarPregunta(index: number) {
    this.preguntas.update(ps => ps.filter((_, i) => i !== index));
  }

  actualizarTexto(pIndex: number, value: string) {
    this.preguntas.update(ps => {
      const copy = ps.map(p => ({ ...p, opciones: [...p.opciones] }));
      copy[pIndex].pregunta = value;
      return copy;
    });
  }

  actualizarOpcion(pIndex: number, oIndex: number, value: string) {
    this.preguntas.update(ps => {
      const copy = ps.map(p => ({ ...p, opciones: [...p.opciones] }));
      copy[pIndex].opciones[oIndex] = value;
      return copy;
    });
  }

  setRespuesta(pIndex: number, oIndex: number) {
    this.preguntas.update(ps => {
      const copy = ps.map(p => ({ ...p, opciones: [...p.opciones] }));
      copy[pIndex].respuesta_correcta = oIndex;
      return copy;
    });
  }

  agregarOpcion(pIndex: number) {
    this.preguntas.update(ps => {
      const copy = ps.map(p => ({ ...p, opciones: [...p.opciones] }));
      copy[pIndex].opciones.push('');
      return copy;
    });
  }

  eliminarOpcion(pIndex: number, oIndex: number) {
    this.preguntas.update(ps => {
      const copy = ps.map(p => ({ ...p, opciones: [...p.opciones] }));
      copy[pIndex].opciones.splice(oIndex, 1);
      return copy;
    });
  }

  async guardar() {
    if (this.form.invalid || this.subiendoImg()) return;
    this.guardando = true;
    const values  = this.form.value;
    const payload = {
      ...values,
      instructor: 'N/A',
      precio: 0,
      activo: values.activo ? 1 : 0,
      preguntas: this.preguntas().length > 0 ? this.preguntas() : null
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
  selector: 'app-gestion-cursos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './gestion-cursos.component.html',
  styleUrl: './gestion-cursos.component.css'
})
export class GestionCursosComponent implements OnInit {
  private cursosService = inject(CursosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cursos: Curso[] = [];
  paginacion: any = null;
  cargando = false;
  params: TableParams = { page: 1, limit: 10, sort: 'id', order: 'DESC' };

  ocultarInactivos = false;

  columnas: TableColumn[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'instructor', label: 'Instructor', sortable: true },
    { key: 'duracion', label: 'Duración', sortable: false },
    {
      key: 'precio',
      label: 'Precio',
      sortable: true,
      format: (v) => v != null ? `$${Number(v).toLocaleString('es-CO')}` : '-'
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      format: (v) => Number(v) === 1 ? '● Activo' : '○ Inactivo'
    }
  ];

  rowClass = (curso: Curso) => Number(curso.activo) === 0 ? 'row-inactive' : '';

  ngOnInit() {
    this.cargarCursos();
  }

  toggleOcultarInactivos() {
    this.ocultarInactivos = !this.ocultarInactivos;
    this.params = { ...this.params, page: 1 };
    this.cargarCursos();
  }

  cargarCursos() {
    this.cargando = true;
    this.cursosService.obtenerCursosPaginadosAdmin(this.params, this.ocultarInactivos).subscribe({
      next: (res) => {
        this.cursos = res.data;
        this.paginacion = res.pagination;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar los cursos', 'error');
        this.cargando = false;
      }
    });
  }

  onParamsChange(nuevosParams: TableParams) {
    this.params = { ...this.params, ...nuevosParams };
    this.cargarCursos();
  }

  abrirDialogoCrear() {
    this.dialog.open(CursoFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: {
        curso: null,
        onSave: (payload: Partial<Curso>) => new Promise<void>((resolve, reject) => {
          this.cursosService.crearCurso(payload).subscribe({
            next: () => {
              this.mostrarMensaje('Curso creado correctamente', 'success');
              this.cargarCursos();
              resolve();
            },
            error: () => { this.mostrarMensaje('Error al crear el curso', 'error'); reject(); }
          });
        })
      }
    });
  }

  abrirDialogoEditar(curso: Curso) {
    this.cursosService.obtenerCurso(curso.id).subscribe({
      next: (cursoCompleto) => {
        this.dialog.open(CursoFormDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          panelClass: 'no-padding-dialog',
          data: {
            curso: cursoCompleto,
            onSave: (payload: Partial<Curso>) => new Promise<void>((resolve, reject) => {
              this.cursosService.actualizarCurso({ ...cursoCompleto, ...payload }).subscribe({
                next: () => {
                  this.mostrarMensaje('Curso actualizado correctamente', 'success');
                  this.cargarCursos();
                  resolve();
                },
                error: () => { this.mostrarMensaje('Error al actualizar el curso', 'error'); reject(); }
              });
            })
          }
        });
      },
      error: () => this.mostrarMensaje('Error al cargar el curso', 'error')
    });
  }

  confirmarEliminar(curso: Curso) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'no-padding-dialog',
      data: {
        titulo: 'Eliminar curso',
        mensaje: `¿Estás seguro de eliminar "${curso.nombre}"? Esta acción no se puede deshacer.`
      }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.cursosService.eliminarCurso(curso.id).subscribe({
          next: () => {
            this.mostrarMensaje('Curso eliminado correctamente', 'success');
            this.cargarCursos();
          },
          error: () => this.mostrarMensaje('Error al eliminar el curso', 'error')
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
