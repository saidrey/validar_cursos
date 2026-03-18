import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVER / EVENT BUS PATTERN — Comunicación desacoplada entre componentes
//
// Problema que resuelve: dos componentes que no son padre-hijo no pueden
// comunicarse fácilmente en Angular sin pasar por un ancestro común o sin
// acoplarse entre sí. El EventBus actúa como intermediario: cualquier
// componente puede emitir eventos y cualquier otro puede escucharlos
// sin que se conozcan entre sí.
// ─────────────────────────────────────────────────────────────────────────────

/** Tipos de eventos de la aplicación — agregar nuevos aquí */
export type AppEventType =
  | 'diploma:creado'
  | 'diploma:eliminado'
  | 'diploma:actualizado'
  | 'examen:aprobado'
  | 'examen:reprobado'
  | 'usuario:logout';

/** Estructura de un evento */
export interface AppEvent<T = any> {
  tipo: AppEventType;
  payload?: T;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  // Subject privado: solo este servicio puede emitir eventos
  private subject = new Subject<AppEvent>();

  // Observable público: cualquier componente puede suscribirse (solo lectura)
  readonly eventos$ = this.subject.asObservable();

  /** Emite un evento al bus */
  emit(event: AppEvent): void {
    this.subject.next(event);
  }

  /**
   * Suscribirse a un tipo específico de evento.
   * Más cómodo que filtrar manualmente en el componente.
   *
   * Uso: this.eventBus.on('diploma:creado').subscribe(e => ...)
   */
  on<T = any>(tipo: AppEventType): Observable<AppEvent<T>> {
    return this.eventos$.pipe(
      filter(event => event.tipo === tipo)
    );
  }
}
