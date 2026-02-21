import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  formData = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  onSubmit() {
    console.log('Formulario enviado:', this.formData);
    // TODO: Implementar envío al backend
    alert('Mensaje enviado correctamente');
    this.formData = { nombre: '', email: '', mensaje: '' };
  }
}
