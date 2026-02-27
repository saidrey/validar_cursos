import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Examen } from '../models/examen.model';

@Injectable({ providedIn: 'root' })
export class ExamenesService {
  private url = `${environment.apiUrl}/examenes.php`;

  constructor(private http: HttpClient) {}

  getMisExamenes(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.url);
  }
}
