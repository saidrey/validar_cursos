import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Diploma, ValidacionResponse } from '../models/diploma.model';
import { PaginatedResponse, TableParams } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class DiplomasService {
  private apiUrl = `${environment.apiUrl}/diplomas.php`;
  private validarUrl = `${environment.apiUrl}/validar.php`;
  private apiAdminPaginadosUrl = `${environment.apiUrl}/diplomas-paginados-admin.php`;

  constructor(private http: HttpClient) {}

  obtenerDiplomas(): Observable<Diploma[]> {
    return this.http.get<Diploma[]>(this.apiUrl);
  }

  obtenerDiploma(id: number): Observable<Diploma> {
    return this.http.get<Diploma>(`${this.apiUrl}?id=${id}`);
  }

  obtenerDiplomasPaginadosAdmin(params: TableParams = {}, soloActivos = false): Observable<PaginatedResponse<Diploma>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search !== undefined) httpParams = httpParams.set('search', params.search);
    if (soloActivos) httpParams = httpParams.set('soloActivos', '1');
    return this.http.get<PaginatedResponse<Diploma>>(this.apiAdminPaginadosUrl, { params: httpParams });
  }

  crearDiploma(diploma: Partial<Diploma>): Observable<any> {
    return this.http.post(this.apiUrl, diploma);
  }

  actualizarDiploma(diploma: Diploma): Observable<any> {
    return this.http.put(this.apiUrl, diploma);
  }

  eliminarDiploma(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id } });
  }

  validarPorDocumento(tipoDocumento: string, documento: string): Observable<ValidacionResponse> {
    return this.http.get<ValidacionResponse>(
      `${this.validarUrl}?tipo_documento=${tipoDocumento}&documento=${documento}`
    );
  }

  validarPorCodigo(codigo: string): Observable<ValidacionResponse> {
    return this.http.get<ValidacionResponse>(`${this.validarUrl}?codigo=${codigo}`);
  }
}
