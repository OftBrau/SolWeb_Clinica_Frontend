import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface AgendaItem {
  idCita: number;
  hora: string;
  paciente: string;
  doctor: string;
  especialidad: string;
  consultorio: string;
  estado: string;
  tipoReserva: string;
  tipo: string;
}

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Agenda Diaria" subtitle="Vista general de todas las citas del dia"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Agenda'}]">
      <input type="date" class="form-control form-control-sm" style="max-width:180px"
             [ngModel]="fecha()" (ngModelChange)="fecha.set($event); cargarAgenda()" />
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando agenda...</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="!loading() && !error()">
      <div *ngIf="agenda().length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-calendar-x fs-1"></i>
        <p class="mt-2">No hay citas programadas para esta fecha</p>
      </div>

      <div class="table-responsive" *ngIf="agenda().length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Doctor</th>
              <th>Especialidad</th>
              <th>Consultorio</th>
              <th>Estado</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of agenda()">
              <td><strong>{{ c.hora }}</strong></td>
              <td>{{ c.paciente }}</td>
              <td>{{ c.doctor || '—' }}</td>
              <td><span class="badge bg-info">{{ c.especialidad || '—' }}</span></td>
              <td>{{ c.consultorio || '—' }}</td>
              <td>
                <span [class]="estadoClass(c.estado)">{{ c.estado }}</span>
              </td>
              <td>{{ c.tipoReserva || c.tipo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    </div>
  `
})
export class AgendaPageComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  agenda = signal<AgendaItem[]>([]);
  loading = signal(true);
  error = signal('');
  fecha = signal(new Date().toISOString().split('T')[0]);

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<{ data: AgendaItem[] }>(
      `${this.api}/asistente/agenda-diaria?fecha=${this.fecha()}`
    ).subscribe({
      next: (r) => {
        this.agenda.set(r.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar agenda');
        this.loading.set(false);
      }
    });
  }

  estadoClass(estado: string): string {
    const m: Record<string, string> = {
      CONFIRMADA: 'badge bg-primary',
      PENDIENTE_ASIGNACION: 'badge bg-warning',
      EN_ATENCION: 'badge bg-info',
      ATENDIDA: 'badge bg-success',
      CANCELADA: 'badge bg-danger',
      NO_ASISTIO: 'badge bg-secondary'
    };
    return 'badge ' + (m[estado] || 'bg-secondary');
  }
}
