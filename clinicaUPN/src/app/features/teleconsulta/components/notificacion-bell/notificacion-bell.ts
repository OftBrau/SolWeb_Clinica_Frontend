import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-notificacion-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-bell.html',
  styleUrl: './notificacion-bell.css',
})
export class NotificacionBellComponent {
  private router = inject(Router);
  notiSvc = inject(NotificacionService);
  auth = inject(AuthService);

  abierto = false;

  get soloDoctor() {
    const r = this.auth.getRol();
    return r === 'DOCTOR' || r === 'MEDICO';
  }

  toggle() {
    this.abierto = !this.abierto;
    if (this.abierto) {
      this.notiSvc.marcarLeidas();
      this.notiSvc.activarNotificacionesSO();
    }
  }

  cerrar() {
    this.abierto = false;
  }

  ir(tipo: string, teleconsultaId: number) {
    this.cerrar();
    if (tipo === 'CITA_ATENDIDA' || tipo === 'CONSULTA_ACTUALIZADA') {
      this.router.navigate(['/app/mi-historia']);
    } else if (tipo === 'INVITACION_PRACTICA' || tipo === 'INVITACION_ACEPTADA' || tipo === 'INVITACION_RECHAZADA') {
      this.router.navigate(['/app/invitaciones']);
    } else if (tipo === 'NUEVA_CITA_ESPECIALISTA' || tipo === 'CITA_ASIGNADA' || tipo === 'CITA_RECHAZADA') {
      const rol = this.auth.getRol();
      if (rol === 'ASISTENTE') {
        this.router.navigate(['/app/asistente/pendientes']);
      } else {
        this.router.navigate(['/app/mis-citas']);
      }
    } else if (tipo === 'TAREA_ASIGNADA') {
      this.router.navigate(['/app/mis-tareas']);
    } else {
      this.router.navigate(['/app/teleconsulta']);
    }
  }
}
