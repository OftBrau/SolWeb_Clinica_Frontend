import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AuthService } from '../../../../core/services/auth';
import { PacienteService, PacienteDTO } from '../../services/paciente';

@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.css',
})
export class MiPerfilPageComponent implements OnInit {
  private auth = inject(AuthService);
  private pacienteService = inject(PacienteService);
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  paciente = signal<PacienteDTO | null>(null);
  cargando = signal(true);
  error = signal('');
  editando = signal(false);
  guardando = signal(false);
  exito = signal('');

  form: Partial<PacienteDTO> = {};

  modalPassword = signal(false);
  cambiandoPassword = signal(false);
  passwordActual = signal('');
  passwordNueva = signal('');
  passwordConfirmar = signal('');
  errorPassword = signal('');

  ngOnInit() {
    const user = this.auth.getUser();
    const email = user?.email;
    const rol = user?.rol;
    if (!email) { this.error.set('Sesion no encontrada'); this.cargando.set(false); return; }

    if (rol === 'ENFERMERO') {
      this.http.get<{ data: any }>(`${this.api}/auth/perfil`).subscribe({
        next: (r) => {
          const u = r.data;
          this.paciente.set({
            idPaciente: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email,
            telefono: u.telefono || '', estado: u.estado, fechaNacimiento: '2000-01-01', genero: 'OTRO'
          });
          this.cargando.set(false);
        },
        error: () => { this.error.set('No se pudo cargar tu perfil.'); this.cargando.set(false); }
      });
      return;
    }

    this.pacienteService.buscarPorEmail(email).subscribe({
      next: (data) => {
        this.paciente.set(data);
        this.form = { ...data };
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      }
    });
  }

  activarEdicion() {
    this.form = { ...this.paciente()! };
    this.editando.set(true);
    this.exito.set('');
  }

  cancelarEdicion() {
    this.editando.set(false);
    this.form = {};
    this.exito.set('');
  }

  guardar() {
    if (!this.form.nombre || !this.form.apellido || !this.form.email) {
      this.error.set('Nombre, apellido y email son obligatorios');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');
    this.pacienteService.actualizar(this.paciente()!.idPaciente!, this.form as PacienteDTO).subscribe({
      next: (actualizado) => {
        this.paciente.set(actualizado);
        this.form = { ...actualizado };
        this.editando.set(false);
        this.guardando.set(false);
        this.exito.set('Datos actualizados correctamente');
      },
      error: () => {
        this.error.set('Error al actualizar. Intenta de nuevo.');
        this.guardando.set(false);
      }
    });
  }

  abrirCambiarPassword() {
    this.passwordActual.set('');
    this.passwordNueva.set('');
    this.passwordConfirmar.set('');
    this.errorPassword.set('');
    this.modalPassword.set(true);
  }

  cambiarPassword() {
    if (!this.passwordActual() || !this.passwordNueva() || !this.passwordConfirmar()) {
      this.errorPassword.set('Completa todos los campos');
      return;
    }
    if (this.passwordNueva() !== this.passwordConfirmar()) {
      this.errorPassword.set('Las contraseñas no coinciden');
      return;
    }
    if (this.passwordNueva().length < 6) {
      this.errorPassword.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.cambiandoPassword.set(true);
    this.errorPassword.set('');
    this.http.put(`${this.api}/auth/cambiar-password`, {
      passwordActual: this.passwordActual(),
      passwordNueva: this.passwordNueva()
    }).subscribe({
      next: () => {
        this.modalPassword.set(false);
        this.cambiandoPassword.set(false);
        this.exito.set('Contraseña cambiada correctamente');
      },
      error: (err) => {
        this.cambiandoPassword.set(false);
        this.errorPassword.set(err.error?.message || 'Error al cambiar contraseña');
      }
    });
  }
}
