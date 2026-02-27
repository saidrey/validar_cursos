import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/loading.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  get mostrarWhatsapp(): boolean {
    const enZonaAdmin = this.router.url.startsWith('/admin');
    return !(enZonaAdmin && this.authService.esAdmin());
  }
}
