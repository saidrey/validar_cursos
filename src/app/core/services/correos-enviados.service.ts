import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CorreoEnviado } from '../models/correo-enviado.model';

@Injectable({ providedIn: 'root' })
export class CorreosEnviadosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/correos-enviados.php`;

  obtenerTodos(): Observable<CorreoEnviado[]> {
    return this.http.get<CorreoEnviado[]>(this.apiUrl);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}?id=${id}`);
  }
}
