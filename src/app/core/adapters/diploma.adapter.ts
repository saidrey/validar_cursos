import { Diploma } from '../models/diploma.model';

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER PATTERN — Normalización de respuestas de la API
//
// El backend puede devolver datos con tipos incorrectos (números como strings,
// campos faltantes, valores nulos), o cambiar su estructura sin avisar.
// DiplomaAdapter es el único lugar donde se traduce "lo que llega del servidor"
// al modelo tipado que usa el frontend.
//
// Beneficio: si el backend cambia un campo, solo se toca este archivo.
// ─────────────────────────────────────────────────────────────────────────────

export class DiplomaAdapter {

  /**
   * Convierte un objeto crudo de la API en un Diploma tipado y normalizado.
   * - Fuerza tipos correctos (Number, String)
   * - Provee valores por defecto para campos opcionales
   * - Centraliza reglas de negocio de normalización
   */
  static fromApi(raw: any): Diploma {
    return {
      id:                   Number(raw.id),
      curso_id:             Number(raw.curso_id),
      curso_nombre:         raw.curso_nombre    ?? 'Sin nombre',
      curso_duracion:       raw.curso_duracion  ?? '',
      nombre_estudiante:    String(raw.nombre_estudiante),
      tipo_documento:       raw.tipo_documento  as Diploma['tipo_documento'],
      documento:            String(raw.documento),
      email:                raw.email           ?? '',
      fecha_emision:        String(raw.fecha_emision),
      codigo_verificacion:  String(raw.codigo_verificacion),
      instructor:           raw.instructor      ?? '',
      activo:               Number(raw.activo),
      fecha_creacion:       String(raw.fecha_creacion)
    };
  }

  /**
   * Convierte una lista de objetos crudos.
   * Filtra null/undefined que puedan venir del servidor.
   */
  static fromApiList(rawList: any[]): Diploma[] {
    return (rawList ?? [])
      .filter(item => item != null)
      .map(DiplomaAdapter.fromApi);
  }

  /**
   * Prepara un Diploma para enviarlo a la API.
   * Útil si necesitas transformar de vuelta (ej: camelCase → snake_case).
   * Por ahora el backend ya usa snake_case igual que el modelo.
   */
  static toApi(diploma: Partial<Diploma>): Record<string, any> {
    return { ...diploma };
  }
}
