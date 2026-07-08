import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { NotificacionBellComponent } from '../../../features/teleconsulta/components/notificacion-bell/notificacion-bell';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, NotificacionBellComponent, CartDrawerComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  private authService = inject(AuthService);

  get usuarioCargado(): boolean {
    return !!this.authService.getUser();
  }

  get nombreUsuario(): string {
    const u = this.authService.getUser();
    if (!u) return 'Usuario';
    return `${u.nombre}`.trim();
  }

  get iniciales(): string {
    const u = this.authService.getUser();
    if (!u) return 'U';
    const nombre = u.nombre?.[0] ?? '';
    return nombre.toUpperCase() || 'U';
  }

  get rolUsuarioLabel(): string {
    const roles: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      ADMINISTRATIVO: 'Administrativo',
      DOCTOR: 'Doctor',
      MEDICO: 'Médico',
      DIRECTOR: 'Director',
      PRACTICANTE: 'Practicante',
      PACIENTE: 'Paciente',
      PATIENT: 'Paciente',
      ASISTENTE: 'Asistente',
      ENFERMERO: 'Enfermero',
    };
    const r = this.authService.getRol() ?? '';
    return roles[r] || r;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
