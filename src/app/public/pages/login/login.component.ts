import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  registroForm: FormGroup;

  modoRegistro = false;
  mostrarModalPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.passwordsCoinciden });
  }

  passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  toggleModo() {
    this.modoRegistro = !this.modoRegistro;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset({ rememberMe: false });
    this.registroForm.reset();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password, rememberMe } = this.loginForm.value;

      this.authService.login(email, password, rememberMe).subscribe({
        next: () => {
          this.isLoading = false;
          const ruta = this.authService.esAdmin() ? '/admin' : '/admin/mis-examenes';
          this.router.navigate([ruta]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.message ?? 'Credenciales inválidas. Por favor, intenta de nuevo.';
        }
      });
    }
  }

  onRegistro() {
    if (this.registroForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { nombre, email, password } = this.registroForm.value;

      this.authService.registro(nombre, email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.';
          this.registroForm.reset();
          setTimeout(() => this.toggleModo(), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.message ?? 'Error al crear la cuenta. Intenta de nuevo.';
        }
      });
    }
  }
}
