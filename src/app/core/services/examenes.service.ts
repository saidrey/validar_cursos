import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Examen } from '../models/examen.model';
import { PaginatedResponse, TableParams } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ExamenesService {
  private url = `${environment.apiUrl}/examenes.php`;

  constructor(private http: HttpClient) {}

  getMisExamenes(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.url);
  }

  guardarExamen(cursoId: number, nota: number): Observable<any> {
    return this.http.post(this.url, { curso_id: cursoId, nota });
  }

  getExamenesPaginadosAdmin(params: TableParams = {}): Observable<PaginatedResponse<any>> {
    let httpParams = new HttpParams();
    if (params.page)   httpParams = httpParams.set('page', params.page.toString());
    if (params.limit)  httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sort)   httpParams = httpParams.set('sort', params.sort);
    if (params.order)  httpParams = httpParams.set('order', params.order);
    if (params.search !== undefined) httpParams = httpParams.set('search', params.search);
    return this.http.get<PaginatedResponse<any>>(
      `${environment.apiUrl}/examenes-paginados-admin.php`,
      { params: httpParams }
    );
  }
}
