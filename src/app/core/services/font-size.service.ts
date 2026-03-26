import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 *   Normal  → 16px (base del browser por defecto)
 *   Mediano → 18px (+12.5%)
 *   Grande  → 20px (+25%)
 */
@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly STORAGE_KEY = 'app-font-size';
  private readonly SIZES = [16, 18, 20]; 
  private readonly LABELS = ['Normal', 'Mediano', 'Grande'];
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  // nivel activo 0=normal, 1=mediano, 2=grande)
  currentIndex = signal<number>(0);

  currentLabel = computed(() => this.LABELS[this.currentIndex()]);

  currentSize = computed(() => this.SIZES[this.currentIndex()]);

  isMin = computed(() => this.currentIndex() === 0);
  isMax = computed(() => this.currentIndex() === this.SIZES.length - 1);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const index = saved !== null ? Number(saved) : 0;
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
    this.doc.documentElement.style.fontSize = `${this.SIZES[index]}px`;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, String(index));
    }
  }
}
