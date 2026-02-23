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
      icono: 'account_balance',
      titulo: 'Gestión Pública y Gobernanza',
      descripcion: 'Formación estratégica en administración pública, contratación estatal y liderazgo institucional orientado a la toma de decisiones.'
    },
    {
      icono: 'gavel',
      titulo: 'Justicia y Seguridad Integral',
      descripcion: 'Actualización jurídica, sistema penal, derechos humanos y gestión de seguridad en entornos públicos y privados.'
    },
    {
      icono: 'business_center',
      titulo: 'Gestión Organizacional y Liderazgo',
      descripcion: 'Desarrollo empresarial, control interno, calidad, gestión humana y fortalecimiento del talento.'
    },
    {
      icono: 'analytics',
      titulo: 'Finanzas, Datos y Gestión de Riesgos',
      descripcion: 'Análisis estratégico, herramientas financieras, estadística aplicada y protección integral de activos.'
    },
    {
      icono: 'health_and_safety',
      titulo: 'Salud, Seguridad y Prevención',
      descripcion: 'Administración en salud, seguridad laboral, prevención de riesgos y gestión de emergencias.'
    },
    {
      icono: 'public',
      titulo: 'Ambiente, Logística y Sectores Productivos',
      descripcion: 'Gestión ambiental, logística, movilidad, turismo y formación técnica orientada a la eficiencia operativa.'
    }
];
}
