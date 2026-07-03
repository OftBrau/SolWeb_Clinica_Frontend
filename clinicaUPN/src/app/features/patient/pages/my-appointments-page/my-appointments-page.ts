import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentDTO } from '../../../../core/models/scheduling.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-my-appointments-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, ConfirmDialogComponent],
  template: `
    <div class="container py-4" style="max-width:800px">
      <h2 class="mb-4">Mis Citas</h2>
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item"><a class="nav-link" [class.active]="activeTab()==='upcoming'" (click)="activeTab.set('upcoming');load()">Próximas</a></li>
        <li class="nav-item"><a class="nav-link" [class.active]="activeTab()==='past'" (click)="activeTab.set('past');load()">Pasadas</a></li>
      </ul>
      <div *ngIf="appointments().length===0" class="text-center text-muted py-5">No tienes citas {{activeTab()==='upcoming'?'próximas':'pasadas'}}</div>
      <div *ngFor="let apt of appointments()" class="card mb-3">
        <div class="card-body"><div class="d-flex justify-content-between">
          <div>
            <h5 class="card-title">{{apt.doctorName}}</h5>
            <p class="mb-1"><strong>Fecha:</strong> {{apt.date|date:'dd/MM/yyyy'}} <small class="text-muted ms-2">({{diasRestantes(apt.date)}})</small></p>
            <p class="mb-1"><strong>Hora:</strong> {{apt.startTime}} - {{apt.endTime}}</p>
            <span class="badge" [class]="statusBadge(apt.status)">{{statusLabel(apt.status)}}</span>
          </div>
          <div *ngIf="isActive(apt.status)"><button class="btn btn-outline-danger btn-sm" (click)="confirmCancel(apt)">Cancelar</button></div>
        </div></div>
      </div>
    </div>
    <app-confirm-dialog *ngIf="appointmentToCancel" title="Cancelar cita"
      [message]="'¿Cancelar cita con '+appointmentToCancel.doctorName+' el '+(appointmentToCancel.date|date:'dd/MM/yyyy')+' a las '+appointmentToCancel.startTime+'?'"
      (confirmed)="cancelAppointment()" (cancelled)="appointmentToCancel=null"></app-confirm-dialog>
    <div *ngIf="error" class="position-fixed bottom-0 end-0 p-3" style="z-index:9999"><div class="toast show text-bg-danger"><div class="d-flex"><div class="toast-body">{{error}}</div><button class="btn-close btn-close-white me-2 m-auto" (click)="error=''"></button></div></div></div>
  `
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

  confirmCancel(apt: AppointmentDTO) { this.appointmentToCancel = apt; }
  cancelAppointment() {
    if (!this.appointmentToCancel) return;
    this.appointmentService.cancelPatientAppointment(this.appointmentToCancel.id).subscribe({
      next: () => { this.appointmentToCancel = null; this.load(); },
      error: err => { this.error = err.error?.message||'Error al cancelar'; this.appointmentToCancel = null; }
    });
  }
}
