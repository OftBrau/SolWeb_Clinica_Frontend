import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, UpperCasePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentDTO } from '../../../../core/models/scheduling.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-my-appointments-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, UpperCasePipe, ConfirmDialogComponent, PageHeaderComponent],
  template: `
    <div class="container py-4 cita-container">
      <app-page-header
        title="Mis Citas"
        subtitle="Gestiona tus citas médicas programadas"
        icon="bi-calendar-check"
        [breadcrumbs]="[
          { label: 'Inicio', link: '/app' },
          { label: 'Mis Citas' }
        ]">
      </app-page-header>

      <ul class="nav nav-tabs cita-tabs">
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab()==='upcoming'"
             (click)="activeTab.set('upcoming');load()">
            <i class="bi bi-calendar-event me-1"></i> Próximas
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab()==='past'"
             (click)="activeTab.set('past');load()">
            <i class="bi bi-clock-history me-1"></i> Pasadas
          </a>
        </li>
      </ul>

      <div *ngIf="appointments().length===0" class="cita-empty">
        <i class="bi bi-inbox"></i>
        <p>No tienes citas {{ activeTab()==='upcoming' ? 'próximas' : 'pasadas' }}</p>
      </div>

      <div class="cita-timeline">
        <div *ngFor="let apt of appointments()" class="cita-card"
             [class.cita-past]="!isActive(apt.status)">
          <div class="cita-date-badge" [class]="dateBadgeClass(apt.date)">
            <span class="cita-date-day">{{ apt.date | date:'dd' }}</span>
            <span class="cita-date-month">{{ apt.date | date:'MMM' | uppercase }}</span>
          </div>

          <div class="cita-body">
            <div class="cita-info">
              <div class="cita-doctor">
                <div class="cita-avatar">
                  {{ apt.doctorName.charAt(0) }}
                </div>
                <div>
                  <span class="cita-doctor-name">Dr(a). {{ apt.doctorName }}</span>
                  <span class="cita-time">
                    <i class="bi bi-clock"></i> {{ apt.startTime }} – {{ apt.endTime }}
                  </span>
                </div>
              </div>
              <div class="cita-meta">
                <span class="cita-day-label">{{ diasRestantes(apt.date) }}</span>
                <span class="cita-status" [class]="'cita-status--'+apt.status.toLowerCase()">
                  <span class="cita-status-dot"></span>
                  {{ statusLabel(apt.status) }}
                </span>
              </div>
            </div>

            <div *ngIf="isActive(apt.status)" class="cita-actions">
              <button class="btn-cancel" (click)="confirmCancel(apt)">
                <i class="bi bi-x-circle"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog *ngIf="appointmentToCancel" title="Cancelar cita"
      [message]="'¿Cancelar cita con '+appointmentToCancel.doctorName+' el '+(appointmentToCancel.date|date:'dd/MM/yyyy')+' a las '+appointmentToCancel.startTime+'?'"
      (confirmed)="cancelAppointment()" (cancelled)="appointmentToCancel=null"></app-confirm-dialog>

    <div *ngIf="error" class="position-fixed bottom-0 end-0 p-3" style="z-index:9999">
      <div class="toast show text-bg-danger">
        <div class="d-flex">
          <div class="toast-body">{{ error }}</div>
          <button class="btn-close btn-close-white me-2 m-auto" (click)="error=''"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cita-container {
      max-width: 1320px;
    }

    .cita-tabs {
      margin-bottom: 28px;
      border-bottom: 2px solid var(--bs-border-color, #e0e0e0);
    }

    .cita-tabs .nav-link {
      border: none;
      color: var(--bs-secondary-color, #888);
      font-weight: 500;
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 0;
      transition: all 0.2s;
    }

    .cita-tabs .nav-link:hover {
      color: var(--bs-primary, #1976d2);
      border-bottom: 2px solid var(--bs-primary, #1976d2);
      margin-bottom: -2px;
      background: transparent;
    }

    .cita-tabs .nav-link.active {
      color: var(--bs-primary, #1976d2);
      background: transparent;
      border-bottom: 2px solid var(--bs-primary, #1976d2);
      margin-bottom: -2px;
      font-weight: 600;
    }

    .cita-empty {
      text-align: center;
      padding: 60px 20px;
      color: var(--bs-secondary-color, #999);
    }

    .cita-empty i {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    .cita-empty p {
      font-size: 15px;
      margin: 0;
    }

    .cita-timeline {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .cita-card {
      display: flex;
      gap: 16px;
      background: var(--bs-body-bg, #fff);
      border: 1px solid var(--bs-border-color, #e8e8e8);
      border-radius: 14px;
      padding: 16px;
      transition: box-shadow 0.2s, transform 0.2s;
      position: relative;
      overflow: hidden;
    }

    .cita-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--bs-primary, #1976d2);
      border-radius: 0 4px 4px 0;
    }

    .cita-card.cita-past::before {
      background: var(--bs-secondary-color, #bbb);
    }

    .cita-card:hover {
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transform: translateY(-1px);
    }

    .cita-date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 60px;
      height: 60px;
      border-radius: 12px;
      background: #e3f2fd;
      color: #1565c0;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cita-date-badge.cita-badge-today {
      background: #1976d2;
      color: #fff;
    }

    .cita-date-badge.cita-badge-past {
      background: #f5f5f5;
      color: #999;
    }

    .cita-date-day {
      font-size: 20px;
      line-height: 1;
    }

    .cita-date-month {
      font-size: 11px;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .cita-body {
      flex: 1;
      min-width: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .cita-info {
      flex: 1;
      min-width: 0;
    }

    .cita-doctor {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .cita-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bs-primary, #1976d2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      flex-shrink: 0;
    }

    .cita-card.cita-past .cita-avatar {
      background: #9e9e9e;
    }

    .cita-doctor-name {
      font-weight: 600;
      font-size: 15px;
      color: var(--bs-body-color, #222);
      display: block;
    }

    .cita-time {
      font-size: 13px;
      color: var(--bs-secondary-color, #777);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cita-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cita-day-label {
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 20px;
      background: #e8f5e9;
      color: #2e7d32;
    }

    .cita-card.cita-past .cita-day-label {
      background: #f5f5f5;
      color: #999;
    }

    .cita-status {
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .cita-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cita-status--scheduled,
    .cita-status--confirmada {
      background: #e3f2fd;
      color: #1565c0;
    }

    .cita-status--scheduled .cita-status-dot,
    .cita-status--confirmada .cita-status-dot {
      background: #1565c0;
    }

    .cita-status--completed,
    .cita-status--atendida {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .cita-status--completed .cita-status-dot,
    .cita-status--atendida .cita-status-dot {
      background: #2e7d32;
    }

    .cita-status--cancelled,
    .cita-status--cancelada {
      background: #ffebee;
      color: #c62828;
    }

    .cita-status--cancelled .cita-status-dot,
    .cita-status--cancelada .cita-status-dot {
      background: #c62828;
    }

    .cita-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
      align-items: center;
    }

    .btn-cancel {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border: 1px solid #ffcdd2;
      border-radius: 8px;
      background: transparent;
      color: #c62828;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-cancel:hover {
      background: #ffebee;
      border-color: #ef9a9a;
    }

    @media (max-width: 576px) {
      .cita-body {
        flex-direction: column;
      }

      .cita-actions {
        width: 100%;
      }

      .btn-cancel {
        width: 100%;
        justify-content: center;
      }

      .cita-date-badge {
        min-width: 50px;
        height: 50px;
        border-radius: 10px;
      }

      .cita-date-day {
        font-size: 17px;
      }
    }
  `]
})
export class MyAppointmentsPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  activeTab = signal<'upcoming'|'past'>('upcoming');
  appointments = signal<AppointmentDTO[]>([]);
  appointmentToCancel: AppointmentDTO|null = null;
  error = '';

  ngOnInit() { this.load(); }

  load() {
    const today = new Date().toISOString().split('T')[0];
    this.appointmentService.getPatientAppointments('').subscribe({
      next: data => {
        if (this.activeTab() === 'upcoming')
          this.appointments.set(data.filter(a => a.date >= today && this.isActive(a.status)));
        else
          this.appointments.set(data.filter(a => a.date < today || !this.isActive(a.status)));
      }
    });
  }

  isActive(s: string): boolean { return s === 'SCHEDULED' || s === 'CONFIRMADA'; }

  statusLabel(s: string): string {
    const m: Record<string,string> = { SCHEDULED:'Programada', CONFIRMADA:'Confirmada',
      COMPLETED:'Completada', ATENDIDA:'Atendida', CANCELLED:'Cancelada', CANCELADA:'Cancelada' };
    return m[s] || s;
  }

  statusBadge(s: string): string {
    if (s==='SCHEDULED'||s==='CONFIRMADA') return 'bg-primary';
    if (s==='COMPLETED'||s==='ATENDIDA') return 'bg-success';
    if (s==='CANCELLED'||s==='CANCELADA') return 'bg-danger';
    return 'bg-secondary';
  }

  diasRestantes(date: string): string {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const cita = new Date(date + 'T00:00:00');
    const diff = Math.ceil((cita.getTime() - hoy.getTime()) / 86400000);
    if (diff < 0) return 'Pasada';
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `en ${diff} días`;
  }

  dateBadgeClass(date: string): string {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const cita = new Date(date + 'T00:00:00');
    const diff = Math.ceil((cita.getTime() - hoy.getTime()) / 86400000);
    if (diff < 0) return 'cita-badge-past';
    if (diff === 0) return 'cita-badge-today';
    return '';
  }

  confirmCancel(apt: AppointmentDTO) { this.appointmentToCancel = apt; }
  cancelAppointment() {
    if (!this.appointmentToCancel) return;
    this.appointmentService.cancelPatientAppointment(this.appointmentToCancel.id).subscribe({
      next: () => { this.appointmentToCancel = null; this.load(); },
      error: err => { this.error = err.error?.message||'Error al cancelar'; this.appointmentToCancel = null; }
    });
  }
}
