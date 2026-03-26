import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-validar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './validar.component.html',
  styleUrl: './validar.component.css'
})
export class ValidarComponent implements OnInit {
  private seo = inject(SeoService);
  validacionForm: FormGroup;
  isLoading = false;
  resultado: any = null;

  constructor(
    private fb: FormBuilder,
    private diplomasService: DiplomasService
  ) {
    this.validacionForm = this.fb.group({
      tipoDocumento: ['CC', Validators.required],
      documento: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    // Página estática — el resultado es dinámico (se carga tras submit del formulario),
    // pero el shell de la página es siempre el mismo. Meta tags fijos son suficientes.
    this.seo.setPage({
      title: 'Validar Diploma',
      description: 'Verifica la autenticidad de un diploma emitido por Aula Virtual. Ingresa el número de documento del certificado para validarlo.',
      keywords: 'validar diploma, verificar certificado, autenticidad diploma'
    });
  }

  onValidar() {
    if (this.validacionForm.valid) {
      this.isLoading = true;
      this.resultado = null;

      const { tipoDocumento, documento } = this.validacionForm.value;

      this.diplomasService.validarPorDocumento(tipoDocumento, documento)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.resultado = response;
          },
          error: (_error) => {
            this.isLoading = false;
            this.resultado = {
              valido: false,
              mensaje: 'No se encontraron certificaciones para el documento proporcionado.'
            };
          }
        });
    }
  }
}
