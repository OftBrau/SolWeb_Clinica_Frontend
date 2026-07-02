import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  constructor(
    private authService: AuthService,
    protected themeService: ThemeService,
  ) {}

  // ──────────────────────────────────────────
  // Datos del usuario
  // ──────────────────────────────────────────

  get usuarioCargado(): boolean {
    return !!this.authService.getUser();
  }

  get nombreUsuario(): string {
    const u = this.authService.getUser();
    if (!u) return 'Usuario';
    return `${u.nombre}`.trim(); // ← Bug corregido: se eliminó ''}
  }

  get rolUsuario(): string {
    return this.authService.getUser()?.rol ?? '';
  }

  get rolUsuarioLabel(): string {
    const labels: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      ADMINISTRATIVO: 'Administrativo',
      DOCTOR: 'Doctor',
      DIRECTOR: 'Director',
      PRACTICANTE: 'Practicante',
      PACIENTE: 'Paciente',
    };
    return labels[this.rolUsuario] || this.rolUsuario;
  }

  get iniciales(): string {
    const u = this.authService.getUser();
    if (!u) return 'U';
    const nombre = u.nombre?.[0] ?? '';
    return nombre.toUpperCase() || 'U';
  }

  // ──────────────────────────────────────────
  // Helpers de rol
  // ──────────────────────────────────────────

  get esAdmin(): boolean          { return this.rolUsuario === 'ADMINISTRADOR'; }
  get esDoctor(): boolean         { return this.rolUsuario === 'DOCTOR'; }
  get esDirector(): boolean       { return this.rolUsuario === 'DIRECTOR'; }
  get esPracticante(): boolean    { return this.rolUsuario === 'PRACTICANTE'; }
  get esPaciente(): boolean       { return this.rolUsuario === 'PACIENTE'; }
  get esAdministrativo(): boolean { return this.rolUsuario === 'ADMINISTRATIVO'; }

  // ──────────────────────────────────────────
  // Visibilidad de ítems del menú
  // ──────────────────────────────────────────

  /** Dashboard/KPIs: solo director y admin */
  get verDashboard(): boolean {
    return this.esDirector || this.esAdmin;
  }

  /** Pacientes: admin, doctor, administrativo, director */
  get verPacientes(): boolean {
    return this.esAdmin || this.esDoctor || this.esAdministrativo || this.esDirector;
  }

  /** Mi Horario: solo doctor */
  get verMiHorario(): boolean {
    return this.esDoctor;
  }

  /** Mi Agenda: doctor o practicante */
  get verMiAgendaDoctor(): boolean {
    return this.esDoctor;
  }

  /** Buscar Doctores: solo paciente */
  get verBuscarDoctores(): boolean {
    return this.esPaciente;
  }

  /** Mis Citas: solo paciente */
  get verMisCitas(): boolean {
    return this.esPaciente;
  }

  /** Citas: todos excepto director y paciente */
  get verCitas(): boolean {
    return !this.esDirector && !this.esPaciente;
  }

  /** Mi Perfil: solo paciente */
  get verMiPerfil(): boolean {
    return this.esPaciente;
  }

  /** Mi Historia Clínica: solo paciente */
  get verMiHistoria(): boolean {
    return this.esPaciente;
  }

  /** Mi Agenda: solo practicante */
  get verMiAgenda(): boolean {
    return this.esPracticante;
  }

  /** Registrar Consulta: solo practicante */
  get verRegistrarConsulta(): boolean {
    return this.esPracticante;
  }

  /** Mis Evaluaciones: solo practicante */
  get verMisEvaluaciones(): boolean {
    return this.esPracticante;
  }

  /** Historia Clínica: admin, doctor, practicante */
  get verHistoriaClinica(): boolean {
    return (this.esAdmin || this.esDoctor || this.esPracticante) && !this.esPaciente;
  }

  /** Teleconsulta: admin, doctor, paciente, practicante */
  get verTeleconsulta(): boolean {
    return this.esAdmin || this.esDoctor || this.esPaciente || this.esPracticante;
  }

  /** Consultorios: admin, administrativo */
  get verConsultorios(): boolean {
    return this.esAdmin || this.esAdministrativo;
  }

  /** Doctores: solo admin y director */
  get verDoctores(): boolean {
    return this.esAdmin || this.esDirector;
  }

  /** Asignación de practicantes: admin y director */
  get verPracticantes(): boolean {
    return this.esAdmin || this.esDirector;
  }

  /** Mis practicantes asignados: solo doctor */
  get verMisPracticantes(): boolean {
    return this.esDoctor;
  }

  /** Evaluaciones de Practicantes: admin, doctor, director */
  get verEvaluaciones(): boolean {
    return this.esAdmin || this.esDoctor || this.esDirector;
  }

  /** Reportes: admin, director, administrativo */
  get verReportes(): boolean {
    return this.esAdmin || this.esDirector || this.esAdministrativo;
  }

  /** Usuarios: solo admin */
  get verUsuarios(): boolean {
    return this.esAdmin;
  }

  // ──────────────────────────────────────────
  // Ruta de inicio dinámica por rol
  // ──────────────────────────────────────────

  get rutaInicio(): string {
    const rutas: Record<string, string> = {
      ADMINISTRADOR:  '/',
      DIRECTOR:       '/',
      DOCTOR:         '/',
      PRACTICANTE:    '/app/practicantes/agenda',
      PACIENTE:       '/',
      ADMINISTRATIVO: '/',
    };
    return rutas[this.rolUsuario] ?? '/inicio';
  }

  // ──────────────────────────────────────────
  // Acciones
  // ──────────────────────────────────────────

  toggleTheme(): void {
    this.themeService.toggle();
  }

  cerrarSesion(): void {
    try {
      this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}