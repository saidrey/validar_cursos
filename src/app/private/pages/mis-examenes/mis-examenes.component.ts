import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamenesService } from '../../../core/services/examenes.service';
import { Examen } from '../../../core/models/examen.model';

@Component({
  selector: 'app-mis-examenes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-examenes.component.html',
  styleUrl: './mis-examenes.component.css'
})
export class MisExamenesComponent implements OnInit {
  private examenesService = inject(ExamenesService);

  examenes: Examen[] = [];
  cargando = true;

  ngOnInit() {
    this.examenesService.getMisExamenes().subscribe({
      next: (data) => {
        this.examenes = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  getNotaClase(nota: number): string {
    if (nota >= 80) return 'nota-alta';
    if (nota >= 60) return 'nota-media';
    return 'nota-baja';
  }
}
