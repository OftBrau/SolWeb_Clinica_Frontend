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
    <div class="container py-4">
      <h2 class="mb-4">Mis Citas</h2>

      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab() === 'upcoming'" (click)="activeTab.set('upcoming'); loadAppointments()">Próximas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab() === 'past'" (click)="activeTab.set('past'); loadAppointments()">Pasadas</a>
        </li>
      </ul>

      <div *ngIf="appointments().length === 0" class="text-center text-muted py-5">
        No tienes citas {{ activeTab() === 'upcoming' ? 'próximas' : 'pasadas' }}
      </div>

      <div *ngFor="let apt of appointments()" class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <h5 class="card-title">{{ apt.doctorName }}</h5>
              <p class="mb-1"><strong>Fecha:</strong> {{ apt.date | date:'dd/MM/yyyy' }}</p>
              <p class="mb-1"><strong>Hora:</strong> {{ apt.startTime }} - {{ apt.endTime }}</p>
              <span class="badge"
                    [class.bg-warning]="apt.status === 'SCHEDULED'"
                    [class.bg-success]="apt.status === 'COMPLETED'"
                    [class.bg-secondary]="apt.status === 'CANCELLED'">
                {{ apt.status === 'SCHEDULED' ? 'Programada' : apt.status === 'COMPLETED' ? 'Completada' : 'Cancelada' }}
              </span>
            </div>
            <div *ngIf="apt.status === 'SCHEDULED'">
              <button class="btn btn-outline-danger btn-sm" (click)="confirmCancel(apt)">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog *ngIf="appointmentToCancel"
      title="Cancelar cita"
      [message]="'¿Cancelar cita con ' + appointmentToCancel.doctorName + ' el ' + (appointmentToCancel.date | date:'dd/MM/yyyy') + ' a las ' + appointmentToCancel.startTime + '?'"
      (confirmed)="cancelAppointment()"
      (cancelled)="appointmentToCancel = null">
    </app-confirm-dialog>

    <div *ngIf="error" class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999;">
      <div class="toast show align-items-center text-bg-danger border-0">
        <div class="d-flex">
          <div class="toast-body">{{ error }}</div>
          <button class="btn-close btn-close-white me-2 m-auto" (click)="error = ''"></button>
        </div>
      </div>
    </div>
  `
})
export class MyAppointmentsPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  activeTab = signal<'upcoming' | 'past'>('upcoming');
  appointments = signal<AppointmentDTO[]>([]);
  appointmentToCancel: AppointmentDTO | null = null;
  error = '';

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const status = this.activeTab() === 'upcoming' ? 'SCHEDULED' : '';
    this.appointmentService.getPatientAppointments(status).subscribe({
      next: data => {
        const today = new Date().toISOString().split('T')[0];
        if (this.activeTab() === 'upcoming') {
          this.appointments.set(data.filter(a => a.date >= today));
        } else {
          this.appointments.set(data.filter(a => a.date < today || a.status !== 'SCHEDULED'));
        }
      },
      error: () => {}
    });
  }

  confirmCancel(apt: AppointmentDTO) {
    this.appointmentToCancel = apt;
  }

  cancelAppointment() {
    if (!this.appointmentToCancel) return;
    this.appointmentService.cancelPatientAppointment(this.appointmentToCancel.id).subscribe({
      next: () => {
        this.appointmentToCancel = null;
        this.loadAppointments();
      },
      error: err => {
        this.error = err.error?.message || 'Error al cancelar la cita';
        this.appointmentToCancel = null;
      }
    });
  }
}
