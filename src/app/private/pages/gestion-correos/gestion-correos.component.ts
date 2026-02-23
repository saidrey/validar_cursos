import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CorreosEnviadosService } from '../../../core/services/correos-enviados.service';
import { CorreoEnviado } from '../../../core/models/correo-enviado.model';

// ─── Dialog: Confirmar eliminar ───────────────────────────────
@Component({
  selector: 'app-confirm-correo-dialog',
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
export class ConfirmCorreoDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { titulo: string; mensaje: string };
}

// ─── Dialog: Ver detalle ──────────────────────────────────────
@Component({
  selector: 'app-ver-correo-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-header">
      <span class="material-symbols-outlined dialog-title-icon">mail</span>
      <h2>Detalle del mensaje</h2>
    </div>
    <div class="dialog-body">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Nombre</span>
          <span class="info-value">{{ data.destinatario_nombre }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value email-val">{{ data.destinatario_email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Teléfono</span>
          <span class="info-value">{{ data.destinatario_telefono || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Curso de interés</span>
          <span class="info-value">{{ data.curso_nombre || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha</span>
          <span class="info-value">{{ data.fecha_envio | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado</span>
          <span class="badge" [class.badge-ok]="data.estado === 'enviado'" [class.badge-fail]="data.estado === 'fallido'">
            {{ data.estado === 'enviado' ? '● Enviado' : '✗ Fallido' }}
          </span>
        </div>
      </div>

      <div class="info-item">
        <span class="info-label">Asunto</span>
        <span class="info-value">{{ data.asunto }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">Mensaje</span>
        <div class="msg-body">{{ data.cuerpo }}</div>
      </div>

      @if (data.error_mensaje) {
        <div class="info-item">
          <span class="info-label error-label">Error de envío</span>
          <div class="error-body">{{ data.error_mensaje }}</div>
        </div>
      }
    </div>
    <div class="dialog-footer">
      <button mat-button mat-dialog-close>Cerrar</button>
    </div>
  `,
  styles: [`
    .dialog-header { display: flex; align-items: center; gap: 0.625rem; padding: 1.25rem 1.5rem 1rem; border-bottom: 1px solid #e2e8f0; }
    .dialog-header h2 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #0f172a; }
    .dialog-title-icon { font-size: 22px; color: #137fec; }
    .dialog-body { padding: 1.25rem 1.5rem; max-height: 65vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.875rem; min-width: 480px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { font-size: 0.875rem; color: #1e293b; }
    .email-val { word-break: break-all; }
    .badge { font-size: 0.8rem; font-weight: 600; padding: 2px 10px; border-radius: 20px; display: inline-block; }
    .badge-ok { background: #d1fae5; color: #065f46; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .msg-body { font-size: 0.875rem; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; white-space: pre-wrap; line-height: 1.6; }
    .error-label { color: #ef4444; }
    .error-body { font-size: 0.8rem; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; white-space: pre-wrap; }
    .dialog-footer { display: flex; justify-content: flex-end; padding: 0.875rem 1.5rem; border-top: 1px solid #e2e8f0; }
    @media (max-width: 560px) {
      .info-grid { grid-template-columns: 1fr; }
      .dialog-body { min-width: unset; }
    }
  `]
})
export class VerCorreoDialogComponent {
  data = inject(MAT_DIALOG_DATA) as CorreoEnviado;
}

// ─── Componente principal ─────────────────────────────────────
@Component({
  selector: 'app-gestion-correos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-correos.component.html',
  styleUrl: './gestion-correos.component.css'
})
export class GestionCorreosComponent implements OnInit {
  private correosService = inject(CorreosEnviadosService);
  private dialog         = inject(MatDialog);
  private snackBar       = inject(MatSnackBar);

  correos: CorreoEnviado[] = [];
  cargando = false;
  busqueda = '';

  get correosFiltrados(): CorreoEnviado[] {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.correos;
    return this.correos.filter(c =>
      c.destinatario_nombre.toLowerCase().includes(q) ||
      c.destinatario_email.toLowerCase().includes(q) ||
      c.asunto.toLowerCase().includes(q)
    );
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.correosService.obtenerTodos().subscribe({
      next: (data) => { this.correos = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar los mensajes', 'error'); this.cargando = false; }
    });
  }

  verDetalle(correo: CorreoEnviado) {
    this.dialog.open(VerCorreoDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'no-padding-dialog',
      data: correo
    });
  }

  confirmarEliminar(correo: CorreoEnviado) {
    const ref = this.dialog.open(ConfirmCorreoDialogComponent, {
      panelClass: 'no-padding-dialog',
      data: {
        titulo: 'Eliminar mensaje',
        mensaje: `¿Eliminar el mensaje de "${correo.destinatario_nombre}"? Esta acción no se puede deshacer.`
      }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.correosService.eliminar(correo.id).subscribe({
          next: () => { this.mostrarMensaje('Mensaje eliminado correctamente', 'success'); this.cargar(); },
          error: () => this.mostrarMensaje('Error al eliminar el mensaje', 'error')
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
