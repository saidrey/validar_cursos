import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { PaginatedResponse, TableParams } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios.php`;
  private apiAdminPaginadosUrl = `${environment.apiUrl}/usuarios-paginados-admin.php`;

  constructor(private http: HttpClient) {}

  obtenerUsuariosPaginadosAdmin(params: TableParams = {}, soloActivos = false): Observable<PaginatedResponse<Usuario>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search !== undefined) httpParams = httpParams.set('search', params.search);
    if (soloActivos) httpParams = httpParams.set('soloActivos', '1');
    return this.http.get<PaginatedResponse<Usuario>>(this.apiAdminPaginadosUrl, { params: httpParams });
  }

  crearUsuario(usuario: { nombre: string; email: string; password: string; rol: string }): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  actualizarUsuario(usuario: Partial<Usuario> & { id: number }): Observable<any> {
    return this.http.put(this.apiUrl, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id } });
  }
}
