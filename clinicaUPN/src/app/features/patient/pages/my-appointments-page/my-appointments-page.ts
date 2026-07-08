import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentDTO } from '../../../../core/models/scheduling.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-my-appointments-page',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, DatePipe, UpperCasePipe, FormsModule, RouterLink, ConfirmDialogComponent, PageHeaderComponent],
  template: `
    <div class="content-wrapper">

    <app-page-header title="Mis Citas" subtitle="Gestiona tus citas medicas programadas" icon="bi-calendar-check"
      [breadcrumbs]="[{label:'Inicio',link:'/app'},{label:'Mis Citas'}]">
      <a routerLink="/" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Agendar cita
      </a>
    </app-page-header>

    <div class="d-flex gap-2 mb-3">
      <select class="form-select form-select-sm" style="max-width:200px" [ngModel]="filtroEstado()" (ngModelChange)="filtroEstado.set($event); filtrar()">
        <option value="activas">Citas activas</option>
        <option value="pendientes_pago">Pendientes de pago</option>
        <option value="proximas">Proximas</option>
        <option value="pasadas">Pasadas</option>
        <option value="todas">Todas</option>
      </select>
    </div>

    <div *ngIf="appointments().length===0" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2" style="opacity:.4"></i>
      <p>No tienes citas que mostrar</p>
    </div>

    <div class="d-flex flex-column gap-3">
      <div *ngFor="let apt of appointments()" class="card border shadow-sm"
           [class.opacity-50]="!isActive(apt.status)">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="d-flex gap-3 align-items-start">
              <div class="text-center rounded-3 px-3 py-2" style="min-width:60px;background:#e3f2fd;color:#1565c0" [class.bg-secondary]="dateBadgeClass(apt.date)==='past'" [class.text-white]="dateBadgeClass(apt.date)==='today'" [class.bg-primary]="dateBadgeClass(apt.date)==='today'">
                <strong class="d-block" style="font-size:1.3rem;line-height:1">{{ apt.date | date:'dd' }}</strong>
                <small style="font-size:.7rem">{{ apt.date | date:'MMM' | uppercase }}</small>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                       style="width:32px;height:32px;background:var(--bs-primary);font-size:14px">
                    {{ apt.doctorName ? apt.doctorName.charAt(0) : '?' }}
                  </div>
                  <strong>{{ apt.doctorName || 'Pendiente de asignacion' }}</strong>
                </div>
                <div class="text-muted small">
                  <i class="bi bi-clock me-1"></i>{{ apt.startTime }} – {{ apt.endTime }}
                  <span class="ms-2" *ngIf="apt.tipoReserva">
                    <span [class]="apt.tipoReserva === 'ESPECIALISTA' ? 'badge bg-warning' : 'badge bg-info'">
                      {{ apt.tipoReserva === 'ESPECIALISTA' ? 'Especialista' : 'Basica' }}
                    </span>
                  </span>
                  <span class="ms-1" *ngIf="apt.tipo">
                    <span class="badge bg-light text-dark">{{ apt.tipo }}</span>
                  </span>
                </div>
                <div class="d-flex gap-2 align-items-center mt-1 flex-wrap">
                  <span class="badge rounded-pill" [class]="statusClass(apt.status)">{{ statusLabel(apt.status) }}</span>
                  <span class="small text-muted">{{ diasRestantes(apt.date) }}</span>
                  <span class="small" *ngIf="apt.motivo" style="color:var(--text-secondary)">
                    <i class="bi bi-chat-left-text me-1"></i>{{ apt.motivo }}
                  </span>
                </div>
                <div class="mt-1" *ngIf="apt.tipoReserva === 'ESPECIALISTA' && apt.montoExtra">
                  <span class="badge bg-success" *ngIf="pagosAprobados()[apt.id]">Pagado S/ {{ apt.montoExtra }}</span>
                  <span class="badge bg-danger" *ngIf="!pagosAprobados()[apt.id] && !cargandoPago()[apt.id]">
                    Pendiente pago S/ {{ apt.montoExtra }}
                    <button class="btn btn-sm btn-outline-success ms-1 py-0 px-1" (click)="pagarCita(apt)">Pagar</button>
                  </span>
                  <span class="spinner-border spinner-border-sm" *ngIf="cargandoPago()[apt.id]"></span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-1 flex-wrap" *ngIf="isActive(apt.status)">
              <button class="btn btn-sm btn-outline-primary" (click)="verDetalle(apt)" title="Ver detalle">
                <i class="bi bi-info-circle"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" (click)="abrirReprogramar(apt)" title="Reprogramar">
                <i class="bi bi-arrow-repeat"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="confirmCancel(apt)" title="Cancelar">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Reprogramar -->
    <div class="modal d-block" *ngIf="modalReprogramar()" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reprogramar cita</h5>
            <button class="btn-close" (click)="cerrarReprogramar()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Nueva fecha</label>
              <input type="date" class="form-control" [ngModel]="nuevaFecha" [min]="today" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Nueva hora</label>
              <select class="form-select" [ngModel]="nuevaHora">
                <option value="">Seleccionar</option>
                <option *ngFor="let h of slotsHora" [value]="h">{{ h }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarReprogramar()">Cancelar</button>
            <button class="btn btn-primary" (click)="reprogramarCita()" [disabled]="!nuevaFecha() || !nuevaHora() || reprogramando()">
              {{ reprogramando() ? 'Reprogramando...' : 'Reprogramar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalle -->
    @if (modalDetalle()) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalle de cita #{{ modalDetalle()!.id }}</h5>
            <button class="btn-close" (click)="modalDetalle.set(null)"></button>
          </div>
          <div class="modal-body">
            <dl class="row small mb-0">
              <dt class="col-5">Estado</dt><dd class="col-7"><span class="badge" [class]="statusClass(modalDetalle()!.status)">{{ statusLabel(modalDetalle()!.status) }}</span></dd>
              <dt class="col-5">Tipo reserva</dt><dd class="col-7">{{ modalDetalle()!.tipoReserva || '—' }}</dd>
              <dt class="col-5">Modalidad</dt><dd class="col-7">{{ modalDetalle()!.tipo || 'PRESENCIAL' }}</dd>
              <dt class="col-5">Doctor</dt><dd class="col-7">{{ modalDetalle()!.doctorName || 'Sin asignar' }}</dd>
              <dt class="col-5">Fecha</dt><dd class="col-7">{{ modalDetalle()!.date | date:'dd/MM/yyyy' }}</dd>
              <dt class="col-5">Hora</dt><dd class="col-7">{{ modalDetalle()!.startTime }} – {{ modalDetalle()!.endTime }}</dd>
              <dt class="col-5">Motivo</dt><dd class="col-7">{{ modalDetalle()!.motivo || '—' }}</dd>
              <dt class="col-5">Costo extra</dt><dd class="col-7">S/ {{ modalDetalle()!.montoExtra || '0.00' }}</dd>
              <dt class="col-5">Pago</dt><dd class="col-7">{{ pagosAprobados()[modalDetalle()!.id] ? 'Pagado' : 'Pendiente' }}</dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="modalDetalle.set(null)">Cerrar</button>
          </div>
        </div>
      </div>
      </div>
    }

    <app-confirm-dialog *ngIf="appointmentToCancel" title="Cancelar cita"
      [message]="'Cancelar cita con '+appointmentToCancel.doctorName+' el '+(appointmentToCancel.date|date:'dd/MM/yyyy')+' a las '+appointmentToCancel.startTime+'?'"
      (confirmed)="cancelAppointment()" (cancelled)="appointmentToCancel=null"></app-confirm-dialog>

    <div *ngIf="error" class="position-fixed bottom-0 end-0 p-3" style="z-index:9999">
      <div class="toast show text-bg-danger"><div class="d-flex">
        <div class="toast-body">{{ error }}</div>
        <button class="btn-close btn-close-white me-2 m-auto" (click)="error=''"></button>
      </div></div>
    </div>

    </div>
  `,
  styles: [`
    @media (max-width:576px) { .card-body { padding: 12px; } }
  `]
})
export class MyAppointmentsPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  filtroEstado = signal<string>('activas');
  appointments = signal<AppointmentDTO[]>([]);
  allAppointments: AppointmentDTO[] = [];
  appointmentToCancel: AppointmentDTO|null = null;
  error = '';
  modalDetalle = signal<AppointmentDTO|null>(null);
  modalReprogramar = signal(false);
  citaReprogramar = signal<AppointmentDTO|null>(null);
  nuevaFecha = signal('');
  nuevaHora = signal('');
  reprogramando = signal(false);
  pagosAprobados = signal<Record<number,boolean>>({});
  pagosCargados = signal(false);
  cargandoPago = signal<Record<number,boolean>>({});
  today = new Date().toISOString().split('T')[0];
  slotsHora = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  ngOnInit() { this.load(); }

  load() {
    this.appointmentService.getPatientAppointments('').subscribe({
      next: data => {
        this.allAppointments = data;
        this.filtrar();
        this.cargarEstadosPago(data);
      }
    });
  }

  filtrar() {
    const today = new Date().toISOString().split('T')[0];
    const f = this.filtroEstado();
    let list = [...this.allAppointments];

    if (f === 'activas') {
      list = list.filter(a => this.isActive(a.status));
    } else if (f === 'pendientes_pago') {
      list = list.filter(a => a.tipoReserva === 'ESPECIALISTA' && a.montoExtra
        && !this.pagosAprobados()[a.id] && a.status !== 'CANCELADA');
    } else if (f === 'proximas') {
      list = list.filter(a => a.date >= today && this.isActive(a.status));
    } else if (f === 'pasadas') {
      list = list.filter(a => a.date < today || !this.isActive(a.status));
    }
    this.appointments.set(list);
  }

  cargarEstadosPago(data: AppointmentDTO[]) {
    const esp = data.filter(a => a.tipoReserva === 'ESPECIALISTA' && a.montoExtra);
    if (esp.length === 0) {
      this.pagosCargados.set(true);
      return;
    }
    let loaded = 0;
    esp.forEach(a => {
      this.http.get<{ data: { estadoPago: string } }>(`${this.api}/pagos/citas/cita/${a.id}`).subscribe({
        next: r => {
          const aprobado = r.data?.estadoPago === 'APROBADO';
          this.pagosAprobados.update(m => ({ ...m, [a.id]: aprobado }));
          loaded++;
          if (loaded === esp.length) this.pagosCargados.set(true);
        },
        error: () => {
          loaded++;
          if (loaded === esp.length) this.pagosCargados.set(true);
        }
      });
    });
  }

  isActive(s: string): boolean {
    return s === 'SCHEDULED' || s === 'CONFIRMADA' || s === 'PENDIENTE_ASIGNACION';
  }

  statusLabel(s: string): string {
    const m: Record<string,string> = {
      SCHEDULED:'Programada', CONFIRMADA:'Confirmada', PENDIENTE_ASIGNACION:'Pendiente asignacion',
      COMPLETED:'Completada', ATENDIDA:'Atendida', EN_ATENCION:'En atencion',
      CANCELLED:'Cancelada', CANCELADA:'Cancelada', NO_ASISTIO:'No asistio'
    };
    return m[s] || s;
  }

  statusClass(s: string): string {
    if (s==='SCHEDULED'||s==='CONFIRMADA') return 'bg-primary';
    if (s==='PENDIENTE_ASIGNACION') return 'bg-warning text-dark';
    if (s==='COMPLETED'||s==='ATENDIDA') return 'bg-success';
    if (s==='CANCELLED'||s==='CANCELADA'||s==='NO_ASISTIO') return 'bg-danger';
    if (s==='EN_ATENCION') return 'bg-info';
    return 'bg-secondary';
  }

  diasRestantes(date: string): string {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const cita = new Date(date + 'T00:00:00');
    const diff = Math.ceil((cita.getTime() - hoy.getTime()) / 86400000);
    if (diff < 0) return 'Pasada';
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `en ${diff} dias`;
  }

  dateBadgeClass(date: string): string {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const cita = new Date(date + 'T00:00:00');
    const diff = Math.ceil((cita.getTime() - hoy.getTime()) / 86400000);
    if (diff < 0) return 'past';
    if (diff === 0) return 'today';
    return '';
  }

  verDetalle(apt: AppointmentDTO) { this.modalDetalle.set(apt); }

  confirmCancel(apt: AppointmentDTO) { this.appointmentToCancel = apt; }
  cancelAppointment() {
    if (!this.appointmentToCancel) return;
    this.appointmentService.cancelPatientAppointment(this.appointmentToCancel.id).subscribe({
      next: () => { this.appointmentToCancel = null; this.load(); },
      error: err => { this.error = err.error?.message||'Error al cancelar'; this.appointmentToCancel = null; }
    });
  }

  abrirReprogramar(apt: AppointmentDTO) {
    this.citaReprogramar.set(apt);
    this.nuevaFecha.set(apt.date);
    this.nuevaHora.set('');
    this.modalReprogramar.set(true);
  }

  cerrarReprogramar() { this.modalReprogramar.set(false); this.citaReprogramar.set(null); }

  reprogramarCita() {
    const cita = this.citaReprogramar();
    if (!cita || !this.nuevaFecha() || !this.nuevaHora()) return;
    this.reprogramando.set(true);
    this.http.put(`http://localhost:8080/api/citas/${cita.id}/reprogramar`, {
      fecha: this.nuevaFecha(), hora: this.nuevaHora()
    }).subscribe({
      next: () => { this.reprogramando.set(false); this.cerrarReprogramar(); this.load(); },
      error: err => { this.reprogramando.set(false); this.error = err.error?.message||'Error al reprogramar'; }
    });
  }

  pagarCita(apt: AppointmentDTO) {
    this.cargandoPago.update(m => ({ ...m, [apt.id]: true }));
    this.http.post<{ data: { urlPago: string } }>(`${this.api}/pagos/citas/crear`, {
      idCita: apt.id, monto: apt.montoExtra, metodoPago: 'MERCADOPAGO'
    }).subscribe({
      next: r => {
        this.cargandoPago.update(m => ({ ...m, [apt.id]: false }));
        if (r.data?.urlPago) window.location.href = r.data.urlPago;
      },
      error: () => {
        this.cargandoPago.update(m => ({ ...m, [apt.id]: false }));
        this.error = 'Error al crear el pago';
      }
    });
  }
}
