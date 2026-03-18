import { Injectable } from '@angular/core';
import { Diploma } from '../models/diploma.model';

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY PATTERN — Exportación de diplomas
//
// El contrato (interfaz) que deben cumplir todas las estrategias.
// Agregar un nuevo formato = crear una clase nueva, sin tocar ExportService.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportStrategy {
  exportar(diplomas: Diploma[]): string;
  mimeType(): string;
  extension(): string;
}

// ── Estrategia 1: CSV ────────────────────────────────────────────────────────
export class CsvExportStrategy implements ExportStrategy {
  exportar(diplomas: Diploma[]): string {
    const headers = [
      'ID', 'Estudiante', 'Tipo Doc', 'Documento',
      'Curso', 'Instructor', 'Fecha Emisión', 'Código Verificación', 'Activo'
    ];

    const filas = diplomas.map(d => [
      d.id,
      d.nombre_estudiante,
      d.tipo_documento,
      d.documento,
      d.curso_nombre ?? '',
      d.instructor ?? '',
      d.fecha_emision,
      d.codigo_verificacion,
      d.activo ? 'Sí' : 'No'
    ]);

    return [headers, ...filas]
      .map(fila => fila.map(celda => `"${celda}"`).join(','))
      .join('\n');
  }

  mimeType(): string { return 'text/csv;charset=utf-8;'; }
  extension(): string { return 'csv'; }
}

// ── Estrategia 2: JSON ───────────────────────────────────────────────────────
export class JsonExportStrategy implements ExportStrategy {
  exportar(diplomas: Diploma[]): string {
    return JSON.stringify(diplomas, null, 2);
  }

  mimeType(): string { return 'application/json'; }
  extension(): string { return 'json'; }
}

// ── Contexto: el servicio que usa la estrategia ──────────────────────────────
//
// ExportService NO sabe cómo exportar. Solo sabe CUÁNDO exportar y CÓMO
// descargar el archivo. La lógica de formato está en la estrategia elegida.
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private strategy: ExportStrategy = new CsvExportStrategy(); // estrategia por defecto

  /** Cambia la estrategia en tiempo de ejecución */
  setStrategy(strategy: ExportStrategy): void {
    this.strategy = strategy;
  }

  /** Exporta y descarga el archivo usando la estrategia activa */
  exportar(diplomas: Diploma[], nombreArchivo = 'diplomas'): void {
    const contenido = this.strategy.exportar(diplomas);
    const blob = new Blob([contenido], { type: this.strategy.mimeType() });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}.${this.strategy.extension()}`;
    link.click();

    URL.revokeObjectURL(url);
  }
}
