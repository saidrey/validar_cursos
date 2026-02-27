import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DataTableComponent, TableColumn } from '../../../shared/data-table.component';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/usuario.model';
import { TableParams } from '../../../core/models/pagination.model';

// ─── Diálogo de confirmación ──────────────────────────────────
@Component({
  selector: 'app-confirm-usuario-dialog',
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
export class ConfirmUsuarioDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { titulo: string; mensaje: string };
}

// ─── Diálogo de formulario de usuario ────────────────────────
@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatSlideToggleModule],
  template: `
    <div class="dialog-header">
      <span class="material-symbols-outlined dialog-title-icon">{{ data.usuario ? 'manage_accounts' : 'person_add' }}</span>
      <h2>{{ data.usuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
    </div>

    <div class="dialog-body">
      <form [formGroup]="form">

        <!-- Nombre -->
        <div class="field-group">
          <label class="field-label">Nombre completo <span class="req">*</span></label>
          <input type="text" formControlName="nombre" placeholder="Nombre del usuario"
                 class="field-input" [class.field-error]="form.get('nombre')?.invalid && form.get('nombre')?.touched">
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <span class="error-msg">El nombre es requerido</span>
          }
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">Correo electrónico <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">mail</span>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com"
                   class="field-input has-icon" [class.field-error]="form.get('email')?.invalid && form.get('email')?.touched">
          </div>
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <span class="error-msg">Ingresa un correo válido</span>
          }
        </div>

        <!-- Password (solo creación) -->
        @if (!data.usuario) {
          <div class="field-group">
            <label class="field-label">Contraseña <span class="req">*</span></label>
            <div class="input-with-icon">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input [type]="mostrarPassword ? 'text' : 'password'" formControlName="password"
                     placeholder="Mínimo 6 caracteres"
                     class="field-input has-icon has-suffix" [class.field-error]="form.get('password')?.invalid && form.get('password')?.touched">
              <button type="button" class="toggle-password" (click)="mostrarPassword = !mostrarPassword">
                <span class="material-symbols-outlined">{{ mostrarPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error-msg">Mínimo 6 caracteres</span>
            }
          </div>
        }

        <!-- Rol -->
        <div class="field-group">
          <label class="field-label">Rol <span class="req">*</span></label>
          <select formControlName="rol" class="field-input">
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <!-- Estado (solo edición) -->
        @if (data.usuario) {
          <div class="toggle-field">
            <mat-slide-toggle formControlName="activo" color="primary">
              Usuario activo (puede iniciar sesión)
            </mat-slide-toggle>
          </div>

          <!-- Cambiar contraseña -->
          <div class="pass-separator"></div>
          <div class="toggle-field">
            <mat-slide-toggle formControlName="cambiarPassword" color="warn">
              Cambiar contraseña
            </mat-slide-toggle>
          </div>

          @if (form.get('cambiarPassword')?.value) {
            <div class="field-group" style="margin-top:12px">
              <label class="field-label">Nueva contraseña <span class="req">*</span></label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">lock_reset</span>
                <input [type]="mostrarNuevaPassword ? 'text' : 'password'"
                       formControlName="nueva_password"
                       placeholder="Mínimo 6 caracteres"
                       class="field-input has-icon has-suffix">
                <button type="button" class="toggle-password" (click)="mostrarNuevaPassword = !mostrarNuevaPassword">
                  <span class="material-symbols-outlined">{{ mostrarNuevaPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('nueva_password')?.value?.length > 0 && form.get('nueva_password')?.value?.length < 6) {
                <span class="error-msg">Mínimo 6 caracteres</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Confirmar contraseña <span class="req">*</span></label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input [type]="mostrarNuevaPassword ? 'text' : 'password'"
                       formControlName="confirmar_password"
                       placeholder="Repite la nueva contraseña"
                       class="field-input has-icon"
                       [class.field-error]="passwordMismatch">
              </div>
              @if (passwordMismatch) {
                <span class="error-msg">Las contraseñas no coinciden</span>
              }
            </div>
          }
        }

      </form>
    </div>

    <div class="dialog-footer">
      <button mat-button mat-dialog-close class="btn-cancel">Cancelar</button>
      <button mat-flat-button color="primary"
              (click)="guardar()"
              [disabled]="form.invalid || guardando"
              class="btn-save">
        @if (guardando) { Guardando... } @else { {{ data.usuario ? 'Actualizar' : 'Crear usuario' }} }
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
    .has-suffix { padding-right: 40px; }
    .toggle-password { position: absolute; right: 8px; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; color: #9ca3af; }
    .toggle-password:hover { color: #64748b; }
    .toggle-password .material-symbols-outlined { font-size: 18px; }
    .error-msg { font-size: 0.75rem; color: #ef4444; }
    .toggle-field { margin-top: 4px; margin-bottom: 4px; }
    .pass-separator { border-top: 1px dashed #e2e8f0; margin: 14px 0 10px; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0.875rem 1.5rem; border-top: 1px solid #e2e8f0; }
    .btn-cancel { color: #64748b; }
    .btn-save { font-weight: 600; }
  `]
})
export class UsuarioFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { usuario: Usuario | null; onSave: (data: any) => Promise<void> };

  guardando = false;
  mostrarPassword = false;
  mostrarNuevaPassword = false;
  passwordMismatch = false;

  form: FormGroup = this.fb.group({
    nombre: [this.data.usuario?.nombre ?? '', Validators.required],
    email: [this.data.usuario?.email ?? '', [Validators.required, Validators.email]],
    ...(this.data.usuario
      ? { cambiarPassword: [false], nueva_password: [''], confirmar_password: [''] }
      : { password: ['', [Validators.required, Validators.minLength(6)]] }),
    rol: [this.data.usuario?.rol ?? 'usuario', Validators.required],
    activo: [this.data.usuario ? this.data.usuario.activo === 1 : true]
  });

  async guardar() {
    if (this.form.invalid) return;
    const values = this.form.value;

    // Validar contraseña si el toggle está activo
    if (values.cambiarPassword) {
      if (!values.nueva_password || values.nueva_password.length < 6) return;
      if (values.nueva_password !== values.confirmar_password) {
        this.passwordMismatch = true;
        return;
      }
    }
    this.passwordMismatch = false;

    this.guardando = true;
    const payload: any = { ...values, activo: values.activo ? 1 : 0 };
    if (values.cambiarPassword && values.nueva_password) {
      payload.nueva_password = values.nueva_password;
    } else {
      delete payload.nueva_password;
    }
    delete payload.cambiarPassword;
    delete payload.confirmar_password;

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
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  usuarios: Usuario[] = [];
  paginacion: any = null;
  cargando = false;
  params: TableParams = { page: 1, limit: 10, sort: 'id', order: 'DESC' };
  ocultarInactivos = false;

  columnas: TableColumn[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Correo', sortable: true },
    {
      key: 'rol',
      label: 'Rol',
      sortable: true,
      format: (v) => v === 'admin' ? '★ Admin' : 'Usuario'
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      format: (v) => Number(v) === 1 ? '● Activo' : '○ Inactivo'
    }
  ];

  rowClass = (usuario: Usuario) => Number(usuario.activo) === 0 ? 'row-inactive' : '';

  ngOnInit() { this.cargarUsuarios(); }

  toggleOcultarInactivos() {
    this.ocultarInactivos = !this.ocultarInactivos;
    this.params = { ...this.params, page: 1 };
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuariosService.obtenerUsuariosPaginadosAdmin(this.params, this.ocultarInactivos).subscribe({
      next: (res) => {
        this.usuarios = res.data;
        this.paginacion = res.pagination;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar los usuarios', 'error');
        this.cargando = false;
      }
    });
  }

  onParamsChange(nuevosParams: TableParams) {
    this.params = { ...this.params, ...nuevosParams };
    this.cargarUsuarios();
  }

  abrirDialogoCrear() {
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: {
        usuario: null,
        onSave: (payload: any) => new Promise<void>((resolve, reject) => {
          this.usuariosService.crearUsuario(payload).subscribe({
            next: () => { this.mostrarMensaje('Usuario creado correctamente', 'success'); this.cargarUsuarios(); resolve(); },
            error: () => { this.mostrarMensaje('Error al crear el usuario', 'error'); reject(); }
          });
        })
      }
    });
  }

  abrirDialogoEditar(usuario: Usuario) {
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: {
        usuario,
        onSave: (payload: any) => new Promise<void>((resolve, reject) => {
          this.usuariosService.actualizarUsuario({ ...usuario, ...payload }).subscribe({
            next: () => { this.mostrarMensaje('Usuario actualizado correctamente', 'success'); this.cargarUsuarios(); resolve(); },
            error: () => { this.mostrarMensaje('Error al actualizar el usuario', 'error'); reject(); }
          });
        })
      }
    });
  }

  confirmarEliminar(usuario: Usuario) {
    const ref = this.dialog.open(ConfirmUsuarioDialogComponent, {
      panelClass: 'no-padding-dialog',
      data: {
        titulo: 'Eliminar usuario',
        mensaje: `¿Eliminar a "${usuario.nombre}"? El usuario no podrá iniciar sesión.`
      }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.usuariosService.eliminarUsuario(usuario.id).subscribe({
          next: () => { this.mostrarMensaje('Usuario eliminado correctamente', 'success'); this.cargarUsuarios(); },
          error: () => this.mostrarMensaje('Error al eliminar el usuario', 'error')
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
