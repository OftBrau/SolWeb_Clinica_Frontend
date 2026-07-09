import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { AuthService } from '../../../../core/services/auth';
import { PacienteService } from '../../services/paciente';

@Component({
  selector: 'app-mis-pagos-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Mis Pagos" subtitle="Historial de pagos por citas con especialista" icon="bi-credit-card"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Mis Pagos'}]">
    </app-page-header>

    <div *ngIf="cargando()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Cargando historial...</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger">{{ error() }}</div>

    <div *ngIf="!cargando() && !error()">
      <div class="table-responsive" *ngIf="pagos().length > 0">
        <table class="table">
          <thead>
            <tr>
              <th># Cita</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Código SUNAT</th>
              <th>Estado</th>
              <th>Referencia MP</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pagos()">
              <td><strong>#{{ p.idCita }}</strong></td>
              <td>S/ {{ p.monto }}</td>
              <td>{{ p.metodoPago }}</td>
              <td>
                <span *ngIf="p.codigoSunat === '003'" class="badge bg-info">003 Factura</span>
                <span *ngIf="p.codigoSunat === '005'" class="badge bg-info">005 Boleta</span>
                <span *ngIf="!p.codigoSunat" class="text-muted">—</span>
              </td>
              <td><span class="badge" [class]="estadoClass(p.estadoPago)">{{ p.estadoPago }}</span></td>
              <td><small class="text-muted">{{ p.referenciaMp || '—' }}</small></td>
              <td>{{ p.fechaPago ? (p.fechaPago | date:'dd/MM/yy HH:mm') : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="pagos().length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-credit-card fs-1 d-block mb-2" style="opacity:.4"></i>
        <p>No tienes pagos registrados</p>
      </div>
    </div>

    </div>
  `
})
export class MisPagosPageComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private pacienteService = inject(PacienteService);
  private api = 'http://localhost:8080/api';

  pagos = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const email = this.auth.getUser()?.email;
    if (!email) { this.error.set('Sesion no encontrada'); this.cargando.set(false); return; }

    this.pacienteService.buscarPorEmail(email).subscribe({
      next: (data) => {
        const idPaciente = data.idPaciente;
        if (!idPaciente) { this.cargando.set(false); return; }
        this.http.get<{ data: any[] }>(`${this.api}/pagos/citas/historial/${idPaciente}`).subscribe({
          next: (r) => { this.pagos.set(r.data || []); this.cargando.set(false); },
          error: () => { this.error.set('Error al cargar historial'); this.cargando.set(false); }
        });
      },
      error: () => { this.error.set('Error al cargar perfil'); this.cargando.set(false); }
    });
  }

  estadoClass(e: string): string {
    if (e === 'APROBADO') return 'bg-success';
    if (e === 'PENDIENTE') return 'bg-warning text-dark';
    if (e === 'RECHAZADO') return 'bg-danger';
    return 'bg-secondary';
  }
}
