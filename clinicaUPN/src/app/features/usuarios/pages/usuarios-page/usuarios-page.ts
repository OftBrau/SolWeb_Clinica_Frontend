import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { UsuariosService, Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
})
export class UsuariosPageComponent implements OnInit {
  private usuariosService = inject(UsuariosService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  error = signal('');

  page = signal(0);
  size = 10;
  totalElements = signal(0);
  totalPages = signal(0);

  rolesDisponibles = [
    'ADMINISTRADOR',
    'ADMINISTRATIVO',
    'DOCTOR',
    'DIRECTOR',
    'PRACTICANTE',
    'PACIENTE',
    'ASISTENTE',
    'ENFERMERO',
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.usuariosService.listar(this.page(), this.size).subscribe({
      next: (res) => {
        this.usuarios.set(res.content);
        this.page.set(res.page);
        this.size = res.size;
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  irPagina(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.cargarUsuarios();
  }

  // ==========================================
  //  Modal: Crear usuario
  // ==========================================

  mostrarModalCrear = signal(false);
  guardando = signal(false);
  exitoMsg = signal('');
  errorModal = signal('');

  formNombre = signal('');
  formApellido = signal('');
  formEmail = signal('');
  formTelefono = signal('');
  formRol = signal('');
  formPassword = signal('');
  formAutoPassword = signal(true);

  abrirModalCrear(): void {
    this.formNombre.set('');
    this.formApellido.set('');
    this.formEmail.set('');
    this.formTelefono.set('');
    this.formRol.set('');
    this.formPassword.set('');
    this.formAutoPassword.set(true);
    this.errorModal.set('');
    this.mostrarModalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear.set(false);
    this.guardando.set(false);
    this.errorModal.set('');
  }

  guardarUsuario(): void {
    if (!this.formNombre() || !this.formApellido() || !this.formEmail() || !this.formRol()) {
      this.errorModal.set('Todos los campos obligatorios deben estar llenos.');
      return;
    }

    const request: CrearUsuarioRequest = {
      nombre: this.formNombre(),
      apellido: this.formApellido(),
      email: this.formEmail(),
      telefono: this.formTelefono() || undefined,
      rol: this.formRol(),
    };

    if (!this.formAutoPassword()) {
      request.password = this.formPassword();
    }

    this.guardando.set(true);
    this.errorModal.set('');

    this.usuariosService.crear(request).subscribe({
      next: () => {
        this.cerrarModalCrear();
        this.cargarUsuarios();
        this.exitoMsg.set(`Usuario creado. La contraseña temporal fue enviada a ${this.formEmail()}`);
        setTimeout(() => this.exitoMsg.set(''), 6000);
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.errorModal.set(err.error?.message || 'Error al crear usuario');
        this.guardando.set(false);
      },
    });
  }

  generarPasswordAleatoria(): void {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.formPassword.set(pass);
  }

  onAutoPasswordChange(value: boolean): void {
    this.formAutoPassword.set(value);
    if (!value) this.formPassword.set('');
  }

  // ==========================================
  //  Modal: Editar usuario
  // ==========================================

  mostrarModalEditar = signal(false);
  editandoUsuario = signal<Usuario | null>(null);

  editNombre = signal('');
  editApellido = signal('');
  editTelefono = signal('');
  editEmail = signal('');
  editRol = signal('');

  abrirModalEditar(usuario: Usuario): void {
    this.editandoUsuario.set(usuario);
    this.editNombre.set(usuario.nombre);
    this.editApellido.set(usuario.apellido);
    this.editTelefono.set(usuario.telefono || '');
    this.editEmail.set(usuario.email);
    this.editRol.set(usuario.rol);
    this.errorModal.set('');
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar.set(false);
    this.editandoUsuario.set(null);
    this.guardando.set(false);
    this.errorModal.set('');
  }

  guardarEdicion(): void {
    const usuario = this.editandoUsuario();
    if (!usuario) return;

    if (!this.editNombre() || !this.editApellido()) {
      this.errorModal.set('Nombre y apellido son obligatorios.');
      return;
    }

    const request: EditarUsuarioRequest = {
      nombre: this.editNombre(),
      apellido: this.editApellido(),
      telefono: this.editTelefono() || undefined,
    };

    this.guardando.set(true);
    this.errorModal.set('');

    this.usuariosService.editar(usuario.id, request).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error editando usuario:', err);
        this.errorModal.set(err.error?.message || 'Error al editar usuario');
        this.guardando.set(false);
      },
    });
  }

  // ==========================================
  //  Modal: Asignar rol
  // ==========================================

  mostrarModalRol = signal(false);
  rolUsuario = signal<Usuario | null>(null);
  rolSeleccionado = signal('');

  editarRol(usuario: Usuario): void {
    this.rolUsuario.set(usuario);
    this.rolSeleccionado.set(usuario.rol);
    this.errorModal.set('');
    this.mostrarModalRol.set(true);
  }

  cerrarModalRol(): void {
    this.mostrarModalRol.set(false);
    this.rolUsuario.set(null);
    this.guardando.set(false);
    this.errorModal.set('');
  }

  guardarRolModal(): void {
    const usuario = this.rolUsuario();
    if (!usuario || !this.rolSeleccionado()) return;

    this.guardando.set(true);
    this.errorModal.set('');

    this.usuariosService.asignarRol(usuario.id, this.rolSeleccionado()).subscribe({
      next: () => {
        this.cerrarModalRol();
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error asignando rol:', err);
        this.errorModal.set(err.error?.message || 'Error al asignar rol');
        this.guardando.set(false);
      },
    });
  }

  // ==========================================
  //  Activar / Desactivar usuario
  // ==========================================

  desactivarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Desactivar usuario "${usuario.nombre} ${usuario.apellido}"?`)) return;
    this.usuariosService.cambiarEstado(usuario.id, 'INACTIVO').subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        console.error('Error desactivando usuario:', err);
        this.error.set('Error al desactivar usuario');
      },
    });
  }

  activarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Activar usuario "${usuario.nombre} ${usuario.apellido}"?`)) return;
    this.usuariosService.cambiarEstado(usuario.id, 'ACTIVO').subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        console.error('Error activando usuario:', err);
        this.error.set('Error al activar usuario');
      },
    });
  }
}
