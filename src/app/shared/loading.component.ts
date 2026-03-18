import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- role="status" + aria-live="polite": el lector de pantalla anuncia "Cargando..." cuando aparece -->
    <!-- aria-busy="true": indica a tecnologías asistivas que la aplicación está procesando -->
    <div *ngIf="loadingService.isLoading()"
         role="status"
         aria-live="polite"
         aria-busy="true"
         aria-label="Cargando, por favor espera"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary" aria-hidden="true"></div>
        <p class="text-slate-700 font-semibold">Cargando...</p>
      </div>
    </div>
  `
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
