export interface Diploma {
  id: number;
  curso_id: number;
  curso_nombre?: string;
  curso_duracion?: string;
  nombre_estudiante: string;
  tipo_documento: 'CC' | 'TI' | 'CE' | 'PA' | 'NIT';
  documento: string;
  email?: string;
  fecha_emision: string;
  codigo_verificacion: string;
  instructor?: string;
  activo: number;
  fecha_creacion: string;
}

export interface ValidacionResponse {
  valido: boolean;
  diplomas?: Diploma[];
  diploma?: Diploma;
  mensaje?: string;
}
