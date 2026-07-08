import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface Enfermero {
  idEnfermero: number;
  idAsignacion: number;
  nombreEnfermero: string;
  apellidoEnfermero: string;
  emailEnfermero: string;
  idDoctor: number;
  nombreDoctor: string;
  apellidoDoctor: string;
  activo: boolean;
}

interface Doctor {
  idDoctor: number;
  nombreDoctor: string;
  especialidad: string;
}

@Component({
  selector: 'app-admin-enfermeros-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Enfermeros" subtitle="Gestion de enfermeros y asignacion a doctores"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Enfermeros'}]">
      <button class="btn btn-primary btn-sm" (click)="abrirModalAsignar()" *ngIf="!modalAbierto()">
        + Asignar Enfermero
      </button>
    </app-page-header>

    <div class="row mt-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Enfermero</th>
                  <th>Email</th>
                  <th>Doctor Asignado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of enfermeros()">
                  <td>{{ e.nombreEnfermero }} {{ e.apellidoEnfermero }}</td>
                  <td>{{ e.emailEnfermero }}</td>
                  <td>
                    <span *ngIf="e.nombreDoctor" class="badge bg-success">{{ e.nombreDoctor }} {{ e.apellidoDoctor }}</span>
                    <span *ngIf="!e.nombreDoctor" class="badge bg-warning">Sin asignar</span>
                  </td>
                  <td>
                    <span [class.bg-success]="e.activo" [class.bg-secondary]="!e.activo" class="badge">
                      {{ e.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline-primary btn-sm me-1" (click)="abrirModalAsignar(e)" *ngIf="!e.nombreDoctor">
                      Asignar
                    </button>
                    <button class="btn btn-outline-danger btn-sm" (click)="desasignar(e.idAsignacion)" *ngIf="e.nombreDoctor">
                      Desasignar
                    </button>
                  </td>
                </tr>
                <tr *ngIf="enfermeros().length === 0">
                  <td colspan="5" class="text-center text-muted py-3">No hay enfermeros registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="modalAbierto()" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Enfermero a Doctor</h5>
            <button class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Enfermero</label>
              <select class="form-select" [(ngModel)]="formEnfermeroId" [disabled]="enfermeroSeleccionado()">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let e of enfermerosDisponibles()" [ngValue]="e.idEnfermero">
                  {{ e.nombreEnfermero }} {{ e.apellidoEnfermero }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Doctor</label>
              <select class="form-select" [(ngModel)]="formDoctorId">
                <option [ngValue]="null">Seleccionar...</option>
                <option *ngFor="let d of doctores()" [ngValue]="d.idDoctor">
                  {{ d.nombreDoctor }} ({{ d.especialidad }})
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="asignar()" [disabled]="!formEnfermeroId() || !formDoctorId()">
              Asignar
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  `,
})
export class AdminEnfermerosPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  enfermeros = signal<Enfermero[]>([]);
  enfermerosDisponibles = signal<Enfermero[]>([]);
  doctores = signal<Doctor[]>([]);
  modalAbierto = signal(false);
  formEnfermeroId = signal<number | null>(null);
  formDoctorId = signal<number | null>(null);
  enfermeroSeleccionado = signal(false);

  ngOnInit(): void {
    this.cargarEnfermeros();
    this.cargarDoctores();
  }

  cargarEnfermeros(): void {
    this.http.get<any>(`${this.api}/admin/enfermeros`).subscribe({
      next: (r) => this.enfermeros.set(r.data || []),
      error: () => {}
    });
  }

  cargarDoctores(): void {
    this.http.get<any>(`${this.api}/asistente/doctores`).subscribe({
      next: (r) => this.doctores.set(r.data || []),
      error: () => {}
    });
  }

  abrirModalAsignar(enf?: Enfermero): void {
    this.cargarDisponibles();
    this.modalAbierto.set(true);
    if (enf) {
      this.formEnfermeroId.set(enf.idEnfermero);
      this.enfermeroSeleccionado.set(true);
    }
  }

  cargarDisponibles(): void {
    this.http.get<any>(`${this.api}/admin/enfermeros/disponibles`).subscribe({
      next: (r) => this.enfermerosDisponibles.set(r.data || []),
      error: () => {}
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.formEnfermeroId.set(null);
    this.formDoctorId.set(null);
    this.enfermeroSeleccionado.set(false);
  }

  asignar(): void {
    const idEnf = this.formEnfermeroId();
    const idDoc = this.formDoctorId();
    if (!idEnf || !idDoc) return;
    this.http.post(`${this.api}/admin/enfermeros/${idEnf}/asignar`, { idDoctor: idDoc }).subscribe({
      next: () => { this.cerrarModal(); this.cargarEnfermeros(); },
      error: (err) => alert(err.error?.message || 'Error al asignar')
    });
  }

  desasignar(idAsignacion: number): void {
    if (!confirm('Desasignar este enfermero de su doctor?')) return;
    this.http.delete(`${this.api}/admin/enfermeros/asignaciones/${idAsignacion}`).subscribe({
      next: () => this.cargarEnfermeros(),
      error: (err) => alert(err.error?.message || 'Error al desasignar')
    });
  }
}
