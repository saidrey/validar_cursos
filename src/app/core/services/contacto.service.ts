import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactoRequest {
  nombre: string;
  email: string;
  telefono: string;
  curso_id: number;
}

export interface ContactoGeneralRequest {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

export interface ContactoResponse {
  mensaje: string;
  nota?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contacto.php`;
  private apiUrlGeneral = `${environment.apiUrl}/contacto-general.php`;

  enviarSolicitud(datos: ContactoRequest): Observable<ContactoResponse> {
    return this.http.post<ContactoResponse>(this.apiUrl, datos);
  }

  enviarMensajeGeneral(datos: ContactoGeneralRequest): Observable<ContactoResponse> {
    return this.http.post<ContactoResponse>(this.apiUrlGeneral, datos);
  }
}
