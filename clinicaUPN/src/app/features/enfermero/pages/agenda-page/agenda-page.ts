import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-enfermero-agenda-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Mi Agenda" subtitle="Citas del dia y triaje de pacientes"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Agenda Enfermeria'}]">
      <div *ngIf="doctorInfo()" class="d-flex gap-2 align-items-center">
        <span class="badge bg-info"><i class="bi bi-person-badge me-1"></i>Dr. {{ doctorInfo()?.nombreDoctor || 'Asignado' }}</span>
        <span class="badge bg-secondary">{{ doctorInfo()?.especialidad || '' }}</span>
      </div>
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando agenda...</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="!loading() && !error()">
      <div *ngIf="!doctorInfo()" class="text-center py-5 text-muted">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="mt-2">No tienes un doctor asignado. Contacta al administrador.</p>
      </div>

      <div *ngIf="doctorInfo()">
        <div class="d-flex gap-2 mb-3">
          <input type="date" class="form-control form-control-sm" style="max-width:180px"
                 [ngModel]="fecha()" (ngModelChange)="fecha.set($event); cargarCitas()" />
          <button class="btn btn-sm btn-outline-secondary" (click)="cargarPracticantes()">
            <i class="bi bi-people me-1"></i>Practicantes
          </button>
        </div>

        <div *ngIf="citas().length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-calendar-check fs-1"></i>
          <p class="mt-2">No hay citas programadas para esta fecha</p>
        </div>

        <div class="table-responsive" *ngIf="citas().length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of citas()" [class.table-warning]="c.estado === 'PENDIENTE_ASIGNACION'">
                <td><strong>{{ c.hora?.substring(0,5) }}</strong></td>
                <td>
                  <a href="javascript:void(0)" class="text-decoration-none" (click)="verPaciente(c.idPaciente)">
                    {{ c.paciente }}
                  </a>
                </td>
                <td><span class="badge" [class]="estadoClass(c.estado)">{{ c.estado }}</span></td>
                <td><small>{{ c.motivo || '—' }}</small></td>
                <td>
                  <div class="d-flex gap-1">
                    <a class="btn btn-sm btn-primary" [routerLink]="['/app/enfermero/triaje', c.idCita]">
                      <i class="bi bi-clipboard2-pulse"></i> Triaje
                    </a>
                    <a class="btn btn-sm btn-outline-info" [routerLink]="['/app/enfermero/historial', c.idPaciente]">
                      <i class="bi bi-file-medical"></i> HCE
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Datos Paciente -->
    <div class="modal d-block" *ngIf="modalPaciente()" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Datos del Paciente</h5>
            <button class="btn-close" (click)="modalPaciente.set(null)"></button>
          </div>
          <div class="modal-body" *ngIf="pacienteData() as p">
            <dl class="row small mb-0">
              <dt class="col-5">Nombre</dt><dd class="col-7"><strong>{{ p.nombre }}</strong></dd>
              <dt class="col-5">Email</dt><dd class="col-7">{{ p.email }}</dd>
              <dt class="col-5">Telefono</dt><dd class="col-7">{{ p.telefono || '—' }}</dd>
              <dt class="col-5">Codigo</dt><dd class="col-7">{{ p.codigoEstudiante || '—' }}</dd>
              <dt class="col-5">Nacimiento</dt><dd class="col-7">{{ p.fechaNacimiento | date:'dd/MM/yyyy' }}</dd>
              <dt class="col-5">Genero</dt><dd class="col-7">{{ p.genero }}</dd>
              <dt class="col-5">Tipo Sangre</dt><dd class="col-7">{{ p.tipoSangre || '—' }}</dd>
              <dt class="col-5">Alergias</dt><dd class="col-7"><span class="text-danger">{{ p.alergias || 'Ninguna' }}</span></dd>
            </dl>
          </div>
          <div class="modal-footer">
            <a class="btn btn-outline-info btn-sm" [routerLink]="['/app/enfermero/historial', pacienteData()?.idPaciente]" (click)="modalPaciente.set(null)">
              <i class="bi bi-file-medical me-1"></i>Ver historial
            </a>
            <button class="btn btn-secondary btn-sm" (click)="modalPaciente.set(null)">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Practicantes -->
    <div class="modal d-block" *ngIf="modalPracticantes()" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Practicantes del Doctor</h5>
            <button class="btn-close" (click)="modalPracticantes.set(false)"></button>
          </div>
          <div class="modal-body">
            <table class="table table-sm" *ngIf="practicantes().length > 0">
              <thead><tr><th>Practicante</th><th>Email</th></tr></thead>
              <tbody>
                <tr *ngFor="let pr of practicantes()">
                  <td>{{ pr.nombre }}</td>
                  <td>{{ pr.email }}</td>
                </tr>
              </tbody>
            </table>
            <p *ngIf="practicantes().length === 0" class="text-muted text-center">No hay practicantes asignados al doctor.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" (click)="modalPracticantes.set(false)">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    </div>
  `
})
export class EnfermeroAgendaPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  doctorInfo = signal<any>(null);
  citas = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);

  modalPaciente = signal<any>(null);
  pacienteData = signal<any>(null);

  modalPracticantes = signal(false);
  practicantes = signal<any[]>([]);

  ngOnInit(): void { this.cargarDoctor(); }

  cargarDoctor(): void {
    this.loading.set(true);
    this.http.get<{ data: any }>(`${this.api}/enfermero/mi-doctor`).subscribe({
      next: (r) => { this.doctorInfo.set(r.data); this.cargarCitas(); },
      error: () => { this.error.set('No tienes un doctor asignado.'); this.loading.set(false); }
    });
  }

  cargarCitas(): void {
    const idDoctor = this.doctorInfo()?.idDoctor;
    if (!idDoctor) return;
    this.http.get<{ data: any[] }>(
      `${this.api}/enfermero/mi-agenda?fecha=${this.fecha()}&idDoctor=${idDoctor}`
    ).subscribe({
      next: (r) => { this.citas.set(r.data || []); this.loading.set(false); },
      error: () => { this.citas.set([]); this.loading.set(false); }
    });
  }

  verPaciente(idPaciente: number): void {
    this.http.get<{ data: any }>(`${this.api}/pacientes/${idPaciente}`).subscribe({
      next: (r) => { this.pacienteData.set(r.data); this.modalPaciente.set(r.data); },
      error: () => {}
    });
  }

  cargarPracticantes(): void {
    this.http.get<{ data: any[] }>(`${this.api}/enfermero/practicantes`).subscribe({
      next: (r) => { this.practicantes.set(r.data || []); this.modalPracticantes.set(true); },
      error: () => this.modalPracticantes.set(true)
    });
  }

  estadoClass(e: string): string {
    if (e === 'CONFIRMADA' || e === 'SCHEDULED') return 'bg-primary';
    if (e === 'PENDIENTE_ASIGNACION') return 'bg-warning text-dark';
    if (e === 'ATENDIDA' || e === 'COMPLETED') return 'bg-success';
    if (e === 'CANCELADA' || e === 'CANCELADO') return 'bg-danger';
    return 'bg-secondary';
  }
}
