import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * FontSizeService — gestiona el tamaño de fuente de la zona pública.
 *
 * Estrategia: modifica el font-size del elemento <html>.
 * Como Tailwind usa rem para todos sus tamaños de texto (text-sm = 0.875rem,
 * text-base = 1rem, etc.), cambiar la base del rem escala proporcionalmente
 * TODAS las fuentes de la app sin tocar ningún componente.
 *
 * Niveles:
 *   Normal  → 16px (base del browser por defecto)
 *   Mediano → 18px (+12.5%)
 *   Grande  → 20px (+25%)
 */
@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly STORAGE_KEY = 'app-font-size';
  private readonly SIZES = [16, 18, 20]; // px — base del rem
  private readonly LABELS = ['Normal', 'Mediano', 'Grande'];
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** Índice del nivel activo (0 = normal, 1 = mediano, 2 = grande) */
  currentIndex = signal<number>(0);

  /** Etiqueta legible del nivel activo */
  currentLabel = computed(() => this.LABELS[this.currentIndex()]);

  /** Tamaño en px del nivel activo */
  currentSize = computed(() => this.SIZES[this.currentIndex()]);

  /** Límites para deshabilitar botones en el template */
  isMin = computed(() => this.currentIndex() === 0);
  isMax = computed(() => this.currentIndex() === this.SIZES.length - 1);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const index = saved !== null ? Number(saved) : 0;
      // Validar que el índice guardado es válido (por si cambiamos los niveles en el futuro)
      const safeIndex = index >= 0 && index < this.SIZES.length ? index : 0;
      this.apply(safeIndex);
    }
  }

  increase(): void {
    if (!this.isMax()) this.apply(this.currentIndex() + 1);
  }

  decrease(): void {
    if (!this.isMin()) this.apply(this.currentIndex() - 1);
  }

  reset(): void {
    this.apply(0);
  }

  private apply(index: number): void {
    this.currentIndex.set(index);
    // Cambiar font-size en <html> reescala todos los rem de la app
    this.doc.documentElement.style.fontSize = `${this.SIZES[index]}px`;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, String(index));
    }
  }
}
