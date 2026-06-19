import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AdminPracticanteService, Asignacion, PracticanteDisponible } from '../../services/admin-practicante.service';

interface DoctorRow {
  idDoctor: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  practicantes: Asignacion[];
}

@Component({
  selector: 'app-asignar-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './asignar-page.html',
  styleUrl: './asignar-page.css',
})
export class AsignarPageComponent implements OnInit {
  private service = inject(AdminPracticanteService);

  doctores = signal<DoctorRow[]>([]);
  todasLasAsignaciones = signal<Asignacion[]>([]);
  loading = signal(true);
  error = signal('');
  successMsg = signal('');

  disponibles = signal<PracticanteDisponible[]>([]);
  modalVisible = signal(false);
  doctorSeleccionado = signal<DoctorRow | null>(null);
  practicanteSeleccionado = signal<number>(0);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.listarAsignaciones().subscribe({
      next: (asignaciones) => {
        this.todasLasAsignaciones.set(asignaciones);
        this.service.listarDoctores().subscribe({
          next: (doctores) => {
            const rows: DoctorRow[] = doctores.map((d: any) => ({
              idDoctor: d.idDoctor,
              nombre: d.nombre,
              apellido: d.apellido,
              especialidad: d.especialidad,
              practicantes: asignaciones.filter(a => a.idSupervisor === d.idDoctor),
            }));
            this.doctores.set(rows);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Error al cargar doctores');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Error al cargar asignaciones');
        this.loading.set(false);
      },
    });
  }

  abrirAsignar(doctor: DoctorRow): void {
    this.doctorSeleccionado.set(doctor);
    this.practicanteSeleccionado.set(0);
    this.service.listarDisponibles().subscribe({
      next: (data) => this.disponibles.set(data),
      error: () => this.disponibles.set([]),
    });
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.doctorSeleccionado.set(null);
    this.practicanteSeleccionado.set(0);
  }

  confirmarAsignar(): void {
    const doctor = this.doctorSeleccionado();
    const idPracticante = this.practicanteSeleccionado();
    if (!doctor || !idPracticante) return;

    this.service.asignar({ idPracticante, idSupervisor: doctor.idDoctor }).subscribe({
      next: () => {
        this.successMsg.set('Practicante asignado correctamente');
        this.cerrarModal();
        this.cargarDatos();
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al asignar practicante');
      },
    });
  }

  confirmarEliminar(asignacion: Asignacion): void {
    if (!confirm(`¿Quitar asignación de ${asignacion.nombreUsuario} ${asignacion.apellidoUsuario}?`)) return;
    this.service.eliminar(asignacion.idAsignacion).subscribe({
      next: () => {
        this.successMsg.set('Asignación eliminada');
        this.cargarDatos();
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar asignación');
      },
    });
  }
}
