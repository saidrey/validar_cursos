import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  categorias = [
    {
      icono: 'code',
      titulo: 'Desarrollo Web',
      descripcion: 'De principiante a experto en los lenguajes más demandados del mercado.'
    },
    {
      icono: 'monitoring',
      titulo: 'Marketing Digital',
      descripcion: 'Estrategias de crecimiento, SEO, SEM y gestión de comunidades digitales.'
    },
    {
      icono: 'leaderboard',
      titulo: 'Gestión de Proyectos',
      descripcion: 'Metodologías ágiles y tradicionales para liderar equipos de alto impacto.'
    },
    {
      icono: 'palette',
      titulo: 'Diseño UI/UX',
      descripcion: 'Crea experiencias digitales memorables con enfoque en el usuario final.'
    }
  ];
}
