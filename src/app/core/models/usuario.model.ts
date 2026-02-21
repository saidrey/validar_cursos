export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo?: number;
  fecha_creacion?: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}
