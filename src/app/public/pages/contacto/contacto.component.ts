import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactoService } from '../../../core/services/contacto.service';
import { CursosService } from '../../../core/services/cursos.service';
import { Curso } from '../../../core/models/curso.model';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private contactoService = inject(ContactoService);
  private cursosService = inject(CursosService);

  contactoForm!: FormGroup;
  cursos: Curso[] = [];
  enviando = false;
  mensajeExito = '';
  mensajeError = '';

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarCursos();
    
    // Preseleccionar curso si viene desde query params
    this.route.queryParams.subscribe(params => {
      if (params['curso']) {
        this.contactoForm.patchValue({ curso_id: params['curso'] });
      }
    });
  }

  inicializarFormulario() {
    this.contactoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      curso_id: ['', Validators.required],
      mensaje: [''],
      privacidad: [false, Validators.requiredTrue]
    });
  }

  cargarCursos() {
    this.cursosService.obtenerCursos().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
      }
    });
  }

  enviarFormulario() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.contactoService.enviarSolicitud(this.contactoForm.value).subscribe({
      next: (response) => {
        this.mensajeExito = 'Gracias por tu interés. Pronto recibirás un correo con la información del curso seleccionado.';
        this.contactoForm.reset();
        this.enviando = false;
      },
      error: (error) => {
        this.mensajeError = 'Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.';
        this.enviando = false;
      }
    });
  }

  get nombre() { return this.contactoForm.get('nombre'); }
  get email() { return this.contactoForm.get('email'); }
  get telefono() { return this.contactoForm.get('telefono'); }
  get curso_id() { return this.contactoForm.get('curso_id'); }
  get privacidad() { return this.contactoForm.get('privacidad'); }
}
