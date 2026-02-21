import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../core/services/contacto.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private contactoService = inject(ContactoService);

  formData = {
    nombre: '',
    telefono: '',
    email: '',
    mensaje: ''
  };

  isLoading = false;
  enviado = false;
  error = false;

  onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.enviado = false;
    this.error = false;

    this.contactoService.enviarMensajeGeneral(this.formData).subscribe({
      next: () => {
        this.enviado = true;
        this.formData = { nombre: '', telefono: '', email: '', mensaje: '' };
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
