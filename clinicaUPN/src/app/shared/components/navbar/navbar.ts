import { Component, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  activeSection = 'inicio';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get tieneToken(): boolean {
    return this.authService.isAuthenticated(); // usa la clave correcta 'clinica_token'
  }

  irAlSistema(): void {
    const rol = this.authService.getRol();

    switch (rol) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/app/pacientes']);
        break;
      case 'MEDICO':
        this.router.navigate(['/app/citas']);
        break;
      case 'PRACTICANTE':
        this.router.navigate(['/app/practicantes']);
        break;
      default:
        this.router.navigate(['/app']);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    const sections = ['inicio', 'servicios', 'especialidades', 'nosotros', 'contacto'];
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 80) {
        this.activeSection = id;
        break;
      }
    }
  }
}