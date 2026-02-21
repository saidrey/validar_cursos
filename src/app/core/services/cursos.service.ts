import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curso } from '../models/curso.model';
import { PaginatedResponse, TableParams } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private apiUrl = `${environment.apiUrl}/cursos.php`;
  private apiAdminPaginadosUrl = `${environment.apiUrl}/cursos-paginados-admin.php`;

  constructor(private http: HttpClient) {}

  obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  obtenerCurso(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}?id=${id}`);
  }

  obtenerCursosPaginadosAdmin(params: TableParams = {}, soloActivos = false): Observable<PaginatedResponse<Curso>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search !== undefined) httpParams = httpParams.set('search', params.search);
    if (soloActivos) httpParams = httpParams.set('soloActivos', '1');
    return this.http.get<PaginatedResponse<Curso>>(this.apiAdminPaginadosUrl, { params: httpParams });
  }

  crearCurso(curso: Partial<Curso>): Observable<any> {
    return this.http.post(this.apiUrl, curso);
  }

  actualizarCurso(curso: Curso): Observable<any> {
    return this.http.put(this.apiUrl, curso);
  }

  eliminarCurso(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id } });
  }

  subirImagen(file: File): Observable<{ url: string; mensaje: string }> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<{ url: string; mensaje: string }>(
      `${environment.apiUrl}/upload.php`,
      formData
    );
  }
}
