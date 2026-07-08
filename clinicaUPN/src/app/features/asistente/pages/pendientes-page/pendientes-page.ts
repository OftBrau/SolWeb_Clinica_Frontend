import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface CitaPendiente {
  idCita: number;
  idPaciente: number;
  nombrePaciente: string;
  emailPaciente: string;
  codigoEstudiante: string;
  idEspecialidad: number;
  nombreEspecialidad: string;
  costoExtra: number;
  fecha: string;
  hora: string;
  tipo: string;
  motivo: string;
  estado: string;
}

interface DoctorDisponible {
  idDoctor: number;
  nombreDoctor: string;
  especialidad: string;
}

@Component({
  selector: 'app-pendientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Citas Pendientes" subtitle="Asignar doctores a citas con especialista"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Pendientes'}]">
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando citas pendientes...</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="exito()" class="alert alert-success alert-dismissible fade show">
      {{ exito() }}
      <button class="btn-close" (click)="exito.set('')"></button>
    </div>

    <div *ngIf="!loading() && !error()">
      <div *ngIf="pendientes().length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-check-circle fs-1"></i>
        <p class="mt-2">No hay citas pendientes de asignacion</p>
      </div>

      <div class="table-responsive">
        <table class="table" *ngIf="pendientes().length > 0">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Especialidad</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Costo Extra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of pendientes()">
              <td>
                <strong>{{ c.nombrePaciente }}</strong>
                <br><small class="text-muted">{{ c.emailPaciente }}</small>
              </td>
              <td><span class="badge bg-info">{{ c.nombreEspecialidad }}</span></td>
              <td>{{ c.fecha }}</td>
              <td>{{ c.hora }}</td>
              <td>S/ {{ c.costoExtra || '0.00' }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-primary" (click)="abrirAsignar(c)">
                    <i class="bi bi-person-check me-1"></i>Asignar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="rechazarCita(c)">
                    <i class="bi bi-x-lg me-1"></i>Rechazar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Asignar Doctor -->
    <div class="modal d-block" *ngIf="modalVisible()" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Doctor</h5>
            <button class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="citaSeleccionada() as c" class="mb-3">
              <p><strong>Paciente:</strong> {{ c.nombrePaciente }}</p>
              <p><strong>Especialidad:</strong> {{ c.nombreEspecialidad }}</p>
              <p><strong>Fecha/Hora:</strong> {{ c.fecha }} {{ c.hora }}</p>
            </div>

            <div *ngIf="cargandoDoctores()" class="text-center py-3">
              <div class="spinner-border spinner-border-sm"></div> Cargando doctores...
            </div>

            <div *ngIf="!cargandoDoctores() && doctoresDisponibles().length === 0" class="text-muted">
              No hay doctores disponibles para esta especialidad en ese horario.
            </div>

            <div class="list-group" *ngIf="!cargandoDoctores() && doctoresDisponibles().length > 0">
              <button *ngFor="let d of doctoresDisponibles()"
                      class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      [class.active]="doctorSeleccionado() === d.idDoctor"
                      (click)="doctorSeleccionado.set(d.idDoctor)">
                {{ d.nombreDoctor }}
                <span class="badge bg-secondary">{{ d.especialidad }}</span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarAsignar()"
                    [disabled]="!doctorSeleccionado() || asignando()">
              {{ asignando() ? 'Asignando...' : 'Confirmar Asignacion' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  `
})
export class PendientesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  pendientes = signal<CitaPendiente[]>([]);
  loading = signal(true);
  error = signal('');
  exito = signal('');
  modalVisible = signal(false);
  citaSeleccionada = signal<CitaPendiente | null>(null);
  doctoresDisponibles = signal<DoctorDisponible[]>([]);
  doctorSeleccionado = signal<number | null>(null);
  cargandoDoctores = signal(false);
  asignando = signal(false);

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<{ data: CitaPendiente[] }>(`${this.api}/asistente/citas/pendientes`).subscribe({
      next: (r) => {
        this.pendientes.set(r.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar citas pendientes');
        this.loading.set(false);
      }
    });
  }

  abrirAsignar(cita: CitaPendiente): void {
    this.citaSeleccionada.set(cita);
    this.doctorSeleccionado.set(null);
    this.modalVisible.set(true);
    this.cargarDoctores(cita);
  }

  cargarDoctores(cita: CitaPendiente): void {
    this.cargandoDoctores.set(true);
    this.http.get<{ data: DoctorDisponible[] }>(
      `${this.api}/asistente/doctores/disponibles?idEspecialidad=${cita.idEspecialidad || 1}&fecha=${cita.fecha}&hora=${cita.hora}`
    ).subscribe({
      next: (r) => {
        this.doctoresDisponibles.set(r.data || []);
        this.cargandoDoctores.set(false);
      },
      error: () => {
        this.doctoresDisponibles.set([]);
        this.cargandoDoctores.set(false);
      }
    });
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.citaSeleccionada.set(null);
    this.doctorSeleccionado.set(null);
  }

  confirmarAsignar(): void {
    const idCita = this.citaSeleccionada()?.idCita;
    const idDoctor = this.doctorSeleccionado();
    if (!idCita || !idDoctor) return;

    this.asignando.set(true);
    this.http.post(`${this.api}/asistente/citas/${idCita}/asignar-doctor`, { idDoctor, idConsultorio: null }).subscribe({
      next: () => {
        this.asignando.set(false);
        this.cerrarModal();
        this.exito.set('Cita asignada correctamente');
        setTimeout(() => this.exito.set(''), 4000);
        this.cargarPendientes();
      },
      error: (err) => {
        this.asignando.set(false);
        this.error.set(err.error?.message || 'Error al asignar doctor');
      }
    });
  }

  rechazarCita(cita: CitaPendiente): void {
    const motivo = prompt('Motivo del rechazo (opcional):') || 'Sin motivo';
    this.http.patch(`${this.api}/asistente/citas/${cita.idCita}/rechazar`, { motivo }).subscribe({
      next: () => {
        this.exito.set('Cita rechazada');
        setTimeout(() => this.exito.set(''), 4000);
        this.cargarPendientes();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al rechazar');
      }
    });
  }
}
