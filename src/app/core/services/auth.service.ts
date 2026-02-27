import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, LoginResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/login.php`;
  private registroUrl = `${environment.apiUrl}/registro.php`;
  private usuarioActual = signal<Usuario | null>(null);

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }

  login(email: string, password: string, recordarme: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password })
      .pipe(
        tap((response: LoginResponse) => {
          if (response.token && response.usuario) {
            // Limpiar ambos storages para evitar sesiones viejas mezcladas
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('usuario');

            const storage = recordarme ? localStorage : sessionStorage;
            storage.setItem('token', response.token);
            storage.setItem('usuario', JSON.stringify(response.usuario));
            this.usuarioActual.set(response.usuario);
          }
        })
      );
  }

  registro(nombre: string, email: string, password: string): Observable<any> {
    return this.http.post(this.registroUrl, { nombre, email, password });
  }

  logout(): void {
    this.usuarioActual.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

  estaAutenticado(): boolean {
    return this.usuarioActual() !== null &&
      !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioActual();
  }

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  private cargarUsuarioDesdeStorage(): void {
    const ssToken = sessionStorage.getItem('token');
    const ssUsuario = sessionStorage.getItem('usuario');
    if (ssToken && ssUsuario) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      this.usuarioActual.set(JSON.parse(ssUsuario));
      return;
    }
    const lsToken = localStorage.getItem('token');
    const lsUsuario = localStorage.getItem('usuario');
    if (lsToken && lsUsuario) {
      this.usuarioActual.set(JSON.parse(lsUsuario));
    }
  }
}
