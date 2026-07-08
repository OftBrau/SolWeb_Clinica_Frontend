import { Component, signal, input } from '@angular/core';
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

  isCollapsed = signal(false);
  mobileOpen = signal(false);

  constructor(
    private authService: AuthService,
    protected themeService: ThemeService,
  ) {}

  toggleSidebar(): void {
    this.isCollapsed.update(v => !v);
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

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
      ASISTENTE: 'Asistente',
      ENFERMERO: 'Enfermero',
      MEDICO: 'Medico',
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
  get esAsistente(): boolean      { return this.rolUsuario === 'ASISTENTE'; }
  get esEnfermero(): boolean      { return this.rolUsuario === 'ENFERMERO'; }

  get verFarmacia(): boolean {
    return this.esPaciente || this.esAdmin || this.esAdministrativo;
  }

  get verFarmaciaAdmin(): boolean {
    return this.esAdministrativo;
  }

  get verPerfilProfesional(): boolean {
    return this.esPracticante || this.esDirector;
  }

  get verPracticantesDisponibles(): boolean {
    return this.esDoctor || this.esAdmin || this.esDirector;
  }

  get verInvitaciones(): boolean {
    return this.esPracticante || this.esDoctor;
  }

  get verMisTareas(): boolean {
    return this.esPracticante;
  }

  get verRafa(): boolean {
    return this.esPracticante;
  }

  // ──────────────────────────────────────────
  // Visibilidad de ítems del menú
  // ──────────────────────────────────────────

  /** Dashboard/KPIs: solo director y admin */
  get verDashboard(): boolean {
    return this.esDirector || this.esAdmin;
  }

  /** Pacientes: admin, doctor, administrativo, director, enfermero */
  get verPacientes(): boolean {
    return this.esAdmin || this.esDoctor || this.esAdministrativo || this.esDirector || this.esEnfermero;
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

  get verMisPagos(): boolean {
    return this.esPaciente;
  }

  /** Citas: admin, doctor, administrativo */
  get verCitas(): boolean {
    return this.esAdmin || this.esDoctor || this.esAdministrativo;
  }

  /** Mi Perfil: solo paciente o enfermero */
  get verMiPerfil(): boolean {
    return this.esPaciente || this.esEnfermero;
  }

  /** Mi Historia Clínica: solo paciente */
  get verMiHistoria(): boolean {
    return this.esPaciente;
  }

  /** Mi Agenda: solo practicante */
  get verMiAgenda(): boolean {
    return false; // oculto para practicante — ahora usa Mis Tareas
  }

  /** Registrar Consulta: solo practicante */
  get verRegistrarConsulta(): boolean {
    return this.esPracticante;
  }

  /** Mis Evaluaciones: solo practicante */
  get verMisEvaluaciones(): boolean {
    return this.esPracticante;
  }

  /** Historia Clínica: admin, doctor */
  get verHistoriaClinica(): boolean {
    return this.esAdmin || this.esDoctor;
  }

  /** Teleconsulta: admin, doctor, paciente */
  get verTeleconsulta(): boolean {
    return this.esAdmin || this.esDoctor || this.esPaciente;
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

  get verAsistente(): boolean {
    return this.esAsistente;
  }

  get verEnfermero(): boolean {
    return this.esEnfermero;
  }

  get verAdminEnfermeros(): boolean {
    return this.esAdmin;
  }

  get verAdminAsistentes(): boolean {
    return this.esAdmin;
  }

  get verAdminEspecialidades(): boolean {
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
      PRACTICANTE:    '/',
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