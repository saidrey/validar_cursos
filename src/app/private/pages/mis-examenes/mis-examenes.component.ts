import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamenesService } from '../../../core/services/examenes.service';
import { CursosService } from '../../../core/services/cursos.service';
import { AuthService } from '../../../core/services/auth.service';
import { Examen } from '../../../core/models/examen.model';
import { Curso, Pregunta } from '../../../core/models/curso.model';
import { DataTableComponent, TableColumn } from '../../../shared/data-table.component';
import { TableParams } from '../../../core/models/pagination.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type Vista = 'lista' | 'seleccionar' | 'examen' | 'resultado';

@Component({
  selector: 'app-mis-examenes',
  standalone: true,
  imports: [CommonModule, DataTableComponent, MatProgressSpinnerModule],
  templateUrl: './mis-examenes.component.html',
  styleUrl: './mis-examenes.component.css'
})
export class MisExamenesComponent implements OnInit {
  private examenesService = inject(ExamenesService);
  private cursosService   = inject(CursosService);
  private authService     = inject(AuthService);

  get esAdmin(): boolean { return this.authService.esAdmin(); }

  // ══ Vista ADMIN: tabla paginada con todos los exámenes ══════
  examenesAdmin: any[] = [];
  paginacionAdmin: any = null;
  cargandoAdmin = false;
  paramsAdmin: TableParams = { page: 1, limit: 10, sort: 'id', order: 'DESC' };

  columnasAdmin: TableColumn[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'curso_nombre', label: 'Curso', sortable: true },
    {
      key: 'nota', label: 'Nota', sortable: true,
      format: (v) => `${Number(v).toFixed(1)}%`
    },
    {
      key: 'estado', label: 'Estado', sortable: false,
      format: (v) => v === 'Aprobado' ? 'Aprobado' : 'Reprobado',
      cellClass: (v) => v === 'Aprobado' ? 'badge badge-aprobado' : 'badge badge-reprobado'
    },
    {
      key: 'fecha_presentacion', label: 'Fecha', sortable: true,
      format: (v) => v ? new Date(v).toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }) : '-'
    }
  ];

  rowClassAdmin = (_row: any) => '';

  // ══ Vista USUARIO: historial + flujo de examen ══════════════
  examenes: Examen[] = [];
  cargando = true;

  vista: Vista = 'lista';
  cargandoCursos = false;
  cursosConExamen: Curso[] = [];
  cursoSeleccionado: Curso | null = null;
  respuestas: string[] = [];
  resultadoNota = 0;
  correctas = 0;
  guardando = false;
  guardado = false;

  // ══ Ciclo de vida ═══════════════════════════════════════════

  ngOnInit() {
    if (this.esAdmin) {
      this.cargarExamenesAdmin();
    } else {
      this.cargarExamenes();
    }
  }

  // ── Admin: cargar todos los exámenes paginados ─────────────

  cargarExamenesAdmin() {
    this.cargandoAdmin = true;
    this.examenesService.getExamenesPaginadosAdmin(this.paramsAdmin).subscribe({
      next: (res) => {
        this.examenesAdmin  = res.data;
        this.paginacionAdmin = res.pagination;
        this.cargandoAdmin   = false;
      },
      error: () => { this.cargandoAdmin = false; }
    });
  }

  onParamsAdminChange(params: TableParams) {
    this.paramsAdmin = { ...this.paramsAdmin, ...params };
    this.cargarExamenesAdmin();
  }

  // ── Usuario: historial propio ──────────────────────────────

  cargarExamenes() {
    this.cargando = true;
    this.examenesService.getMisExamenes().subscribe({
      next: (data) => { this.examenes = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  // ── Seleccionar curso ──────────────────────────────────────

  iniciarFlujo() {
    this.cargandoCursos = true;
    this.vista = 'seleccionar';
    this.cursosService.obtenerCursos().subscribe({
      next: (cursos) => {
        this.cursosConExamen = cursos.filter(c => c.preguntas && c.preguntas.length > 0);
        this.cargandoCursos = false;
      },
      error: () => { this.cargandoCursos = false; }
    });
  }

  seleccionarCurso(curso: Curso) {
    this.cursoSeleccionado = curso;
    this.respuestas = new Array(curso.preguntas!.length).fill('');
    this.guardado = false;
    this.vista = 'examen';
  }

  // ── Tomar examen ───────────────────────────────────────────

  get preguntas(): Pregunta[] {
    return this.cursoSeleccionado?.preguntas ?? [];
  }

  responder(preguntaIdx: number, opcion: string) {
    this.respuestas[preguntaIdx] = opcion;
  }

  todasRespondidas(): boolean {
    return this.respuestas.every(r => r !== '');
  }

  respondidas(): number {
    return this.respuestas.filter(r => r !== '').length;
  }

  verificar() {
    this.correctas = this.preguntas.filter((p, i) => p.opciones[p.respuesta_correcta] === this.respuestas[i]).length;
    this.resultadoNota = Math.round((this.correctas / this.preguntas.length) * 100 * 10) / 10;
    this.vista = 'resultado';
  }

  get aprobado(): boolean { return this.resultadoNota >= 60; }

  // ── Guardar resultado ──────────────────────────────────────

  guardarResultado() {
    if (!this.cursoSeleccionado || this.guardando || this.guardado) return;
    this.guardando = true;
    this.examenesService.guardarExamen(this.cursoSeleccionado.id, this.resultadoNota).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado  = true;
        this.cargarExamenes();
      },
      error: () => { this.guardando = false; }
    });
  }

  intentarDeNuevo() {
    this.respuestas = new Array(this.preguntas.length).fill('');
    this.guardado = false;
    this.vista = 'examen';
  }

  volverALista() {
    this.vista = 'lista';
    this.cursoSeleccionado = null;
    this.respuestas = [];
    this.guardado = false;
  }

  // ── Utilidades ─────────────────────────────────────────────

  getNotaClase(nota: number): string {
    if (nota >= 80) return 'nota-alta';
    if (nota >= 60) return 'nota-media';
    return 'nota-baja';
  }
}
