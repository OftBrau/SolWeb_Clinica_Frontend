import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { DoctoresService, Doctor, CrearDoctorData, ActualizarDoctorData, EspecialidadDTO } from '../../services/doctores.service';

@Component({
  selector: 'app-doctores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './doctores-page.html',
  styleUrl: './doctores-page.css',
})
export class DoctoresPageComponent implements OnInit {
  private doctoresService = inject(DoctoresService);

  doctores = signal<Doctor[]>([]);
  loading = signal(true);
  error = signal('');
  doctorPage = signal(0);
  pageSize = 10;
  totalPages = computed(() => Math.ceil(this.doctores().length / this.pageSize));
  doctoresPaginados = computed(() => {
    const s = this.doctorPage() * this.pageSize;
    return this.doctores().slice(s, s + this.pageSize);
  });

  doctorEditando = signal<Doctor | null>(null);
  especialidadEditando = signal('');

  // Modal
  modalVisible = signal(false);
  modalTitle = signal('');
  guardando = signal(false);
  especialidadesDisponibles = signal<EspecialidadDTO[]>([]);
  especialidadCostoEditando = signal<number | null>(null);
  costoInput = signal<number>(0);
  fotoSeleccionada = signal<File | null>(null);
  fotoPreview = signal<string | null>(null);
  formDoctor = signal<CrearDoctorData & { id?: number }>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
  });

  ngOnInit(): void {
    this.cargarDoctores();
    this.cargarEspecialidadesModal();
  }

  cargarDoctores(): void {
    this.loading.set(true);
    this.doctoresService.listar().subscribe({
      next: (res) => {
        this.doctores.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando doctores:', err);
        this.error.set('Error al cargar doctores');
        this.loading.set(false);
      },
    });
  }

  abrirCrear(): void {
    this.modalTitle.set('Crear Doctor');
    this.formDoctor.set({ nombre: '', apellido: '', email: '', telefono: '', especialidad: '', cmp: '' });
    this.fotoSeleccionada.set(null);
    this.fotoPreview.set(null);
    this.cargarEspecialidadesModal();
    this.modalVisible.set(true);
  }

  abrirEditar(doctor: Doctor): void {
    this.modalTitle.set('Editar Doctor');
    this.formDoctor.set({
      id: doctor.idDoctor,
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      email: doctor.email,
      telefono: doctor.telefono,
      especialidad: doctor.especialidad,
      cmp: doctor.cmp,
    });
    this.fotoSeleccionada.set(null);
    this.fotoPreview.set(doctor.fotoUrl ?? null);
    this.cargarEspecialidadesModal();
    this.modalVisible.set(true);
  }

  private cargarEspecialidadesModal(): void {
    this.doctoresService.listarEspecialidades().subscribe({
      next: (data) => this.especialidadesDisponibles.set(data),
      error: () => this.especialidadesDisponibles.set([]),
    });
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.error.set('');
    this.fotoSeleccionada.set(null);
    this.fotoPreview.set(null);
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fotoSeleccionada.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardarDoctor(): void {
    const form = this.formDoctor();
    if (!form.nombre || !form.apellido || !form.especialidad) return;
    if (!form.id && !form.email) return;

    this.guardando.set(true);
    this.error.set('');

    const subirFotoSiHay = (id: number) => {
      const file = this.fotoSeleccionada();
      if (file) {
        this.doctoresService.subirFoto(id, file).subscribe({
          error: (err) => {
            console.error('Error subiendo foto:', err);
          },
        });
      }
    };

    if (form.id) {
      const data: ActualizarDoctorData = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        especialidad: form.especialidad,
        cmp: form.cmp,
      };
      this.doctoresService.actualizar(form.id, data).subscribe({
        next: () => {
          subirFotoSiHay(form.id!);
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarDoctores();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err.error?.message || 'Error al actualizar doctor');
        },
      });
    } else {
      const data: CrearDoctorData = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email!,
        telefono: form.telefono,
        especialidad: form.especialidad,
        cmp: form.cmp || undefined,
      };
      this.doctoresService.crear(data).subscribe({
        next: (res: any) => {
          const id = form.id ?? res?.idDoctor;
          if (id) subirFotoSiHay(id);
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarDoctores();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err.error?.message || 'Error al crear doctor');
        },
      });
    }
  }

  confirmarEliminar(doctor: Doctor): void {
    if (!confirm(`¿Desactivar al doctor ${doctor.nombre} ${doctor.apellido}?`)) return;
    this.doctoresService.eliminar(doctor.idDoctor).subscribe({
      next: () => this.cargarDoctores(),
      error: (err) => {
        this.error.set(err.error?.message || 'Error al desactivar doctor');
      },
    });
  }

  activarDoctor(doctor: Doctor): void {
    this.doctoresService.activar(doctor.idDoctor).subscribe({
      next: () => this.cargarDoctores(),
      error: (err) => this.error.set(err.error?.message || 'Error al activar doctor')
    });
  }

  toggleDestacado(doctor: Doctor): void {
    this.doctoresService.toggleDestacado(doctor.idDoctor).subscribe({
      next: () => this.cargarDoctores()
    });
  }

  editarEspecialidad(doctor: Doctor): void {
    this.doctorEditando.set(doctor);
    this.especialidadEditando.set(doctor.especialidad);
  }

  cancelarEdicion(): void {
    this.doctorEditando.set(null);
    this.especialidadEditando.set('');
  }

  guardarEspecialidad(): void {
    const doctor = this.doctorEditando();
    if (!doctor) return;

    this.doctoresService.actualizarEspecialidad(doctor.idDoctor, this.especialidadEditando()).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarDoctores();
      },
      error: (err) => {
        console.error('Error actualizando especialidad:', err);
        this.error.set('Error al actualizar especialidad');
      },
    });
  }

  editarCostoEsp(esp: EspecialidadDTO): void {
    this.especialidadCostoEditando.set(esp.idEspecialidad);
    this.costoInput.set(esp.costoExtra || 0);
  }

  cancelarCostoEsp(): void {
    this.especialidadCostoEditando.set(null);
  }

  guardarCostoEsp(esp: EspecialidadDTO): void {
    this.doctoresService.actualizarCostoEspecialidad(
      esp.idEspecialidad, esp.nombre, '', this.costoInput()
    ).subscribe({
      next: () => {
        this.especialidadCostoEditando.set(null);
        this.cargarEspecialidadesModal();
      },
      error: () => this.error.set('Error al actualizar costo')
    });
  }

}
