export interface CorreoEnviado {
  id: number;
  destinatario_email: string;
  destinatario_nombre: string;
  destinatario_telefono: string | null;
  asunto: string;
  cuerpo: string;
  curso_id: number | null;
  curso_nombre: string | null;
  fecha_envio: string;
  estado: 'enviado' | 'fallido';
  error_mensaje: string | null;
}
