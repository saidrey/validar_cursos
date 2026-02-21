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
  private usuarioActual = signal<Usuario | null>(null);

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }

  login(email: string, password: string, recordarme: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password })
      .pipe(
        tap((response: LoginResponse) => {
          if (response.token && response.usuario) {
            const storage = recordarme ? localStorage : sessionStorage;
            storage.setItem('token', response.token);
            storage.setItem('usuario', JSON.stringify(response.usuario));
            this.usuarioActual.set(response.usuario);
          }
        })
      );
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
    // Primero busca en localStorage (recordarme), luego en sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (token && usuarioGuardado) {
      this.usuarioActual.set(JSON.parse(usuarioGuardado));
    }
  }
}
