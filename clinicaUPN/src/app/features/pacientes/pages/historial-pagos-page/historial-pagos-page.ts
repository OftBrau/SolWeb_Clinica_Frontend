import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AuthService } from '../../../../core/services/auth';
import { PacienteService } from '../../services/paciente';

interface PagoCita {
  idPago: number;
  idCita: number;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  referenciaMp: string;
  fechaPago: string;
}

@Component({
  selector: 'app-historial-pagos-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Historial de Pagos" subtitle="Pagos realizados por citas con especialista"
      icon="bi-credit-card"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Historial de Pagos'}]">
    </app-page-header>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando historial...</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="!loading() && pagos().length === 0 && !error()" class="text-center py-5 text-muted">
      <i class="bi bi-receipt fs-1 d-block mb-2" style="opacity:.4"></i>
      <p>No tienes pagos registrados</p>
    </div>

    <div class="table-responsive" *ngIf="pagos().length > 0">
      <table class="table">
        <thead>
          <tr>
            <th># Pago</th>
            <th># Cita</th>
            <th>Monto</th>
            <th>Metodo</th>
            <th>Estado</th>
            <th>Referencia MP</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of pagos()">
            <td>{{ p.idPago }}</td>
            <td>{{ p.idCita }}</td>
            <td><strong>S/ {{ p.monto }}</strong></td>
            <td>{{ p.metodoPago }}</td>
            <td><span class="badge" [class]="badgeClass(p.estadoPago)">{{ p.estadoPago }}</span></td>
            <td><small class="text-muted">{{ p.referenciaMp || '—' }}</small></td>
            <td>{{ p.fechaPago ? (p.fechaPago | date:'dd/MM/yy HH:mm') : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    </div>
  `
})
export class HistorialPagosPageComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private pacienteService = inject(PacienteService);
  private api = 'http://localhost:8080/api';

  pagos = signal<PagoCita[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const email = this.auth.getUser()?.email;
    if (!email) { this.error.set('Sesion no encontrada'); this.loading.set(false); return; }
    this.pacienteService.buscarPorEmail(email).subscribe({
      next: (paciente) => {
        this.cargarHistorial(paciente.idPaciente!);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil');
        this.loading.set(false);
      }
    });
  }

  cargarHistorial(idPaciente: number) {
    this.http.get<{ data: PagoCita[] }>(`${this.api}/pagos/citas/historial/${idPaciente}`).subscribe({
      next: (r) => {
        this.pagos.set(r.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar historial de pagos');
        this.loading.set(false);
      }
    });
  }

  badgeClass(e: string): string {
    if (e === 'APROBADO') return 'bg-success';
    if (e === 'PENDIENTE') return 'bg-warning text-dark';
    if (e === 'RECHAZADO') return 'bg-danger';
    return 'bg-secondary';
  }
}
