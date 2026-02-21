import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, TableParams } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  constructor(private http: HttpClient) {}

  /**
   * Obtener datos paginados de cualquier endpoint
   */
  getPaginated<T>(url: string, params: TableParams = {}): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);
    
    return this.http.get<PaginatedResponse<T>>(url, { params: httpParams });
  }
}
