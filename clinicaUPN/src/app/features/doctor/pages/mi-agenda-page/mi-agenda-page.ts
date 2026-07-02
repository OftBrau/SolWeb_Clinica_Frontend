import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentDTO } from '../../../../core/models/scheduling.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mi-agenda-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, ConfirmDialogComponent],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Mi Agenda</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="prevWeek()">&laquo; Semana anterior</button>
          <strong class="align-self-center">{{ weekLabel() }}</strong>
          <button class="btn btn-outline-secondary btn-sm" (click)="nextWeek()">Semana siguiente &raquo;</button>
        </div>
      </div>

      <!-- Weekly Grid -->
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width: 80px;">Hora</th>
              <th *ngFor="let day of weekDays()" class="text-center">
                {{ day.date | date:'EEE dd/MM' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let time of timeSlots">
              <td class="text-muted small">{{ time }}</td>
              <td *ngFor="let day of weekDays()" class="text-center slot-cell"
                  [class.available]="false"
                  [class.booked]="getAppointment(day.date, time)?.status === 'SCHEDULED'"
                  [class.completed]="getAppointment(day.date, time)?.status === 'COMPLETED'"
                  (click)="selectAppointment(getAppointment(day.date, time))">
                <span *ngIf="getAppointment(day.date, time) as apt" class="small">
                  {{ apt.patientName }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Appointment Detail -->
      <div *ngIf="selectedAppt" class="card mt-3">
        <div class="card-header d-flex justify-content-between">
          <span>Detalle de cita</span>
          <button class="btn-close" (click)="selectedAppt = null"></button>
        </div>
        <div class="card-body">
          <p><strong>Paciente:</strong> {{ selectedAppt.patientName }}</p>
          <p><strong>Fecha:</strong> {{ selectedAppt.date | date:'dd/MM/yyyy' }}</p>
          <p><strong>Hora:</strong> {{ selectedAppt.startTime }} - {{ selectedAppt.endTime }}</p>
          <p><strong>Estado:</strong>
            <span class="badge" [class.bg-warning]="selectedAppt.status === 'SCHEDULED'"
                           [class.bg-success]="selectedAppt.status === 'COMPLETED'">
              {{ selectedAppt.status }}
            </span>
          </p>
          <div class="d-flex gap-2" *ngIf="selectedAppt.status === 'SCHEDULED'">
            <button class="btn btn-success btn-sm" (click)="markCompleted()">Marcar como completada</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slot-cell { height: 36px; cursor: pointer; }
    .slot-cell.available { background: #e8f5e9; }
    .slot-cell.booked { background: #e3f2fd; cursor: pointer; }
    .slot-cell.completed { background: #f3e5f5; }
    .slot-cell:hover { opacity: 0.8; }
  `]
})
export class MiAgendaPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  weekStart = signal<Date>(this.getMonday(new Date()));
  appointments = signal<AppointmentDTO[]>([]);
  selectedAppt: AppointmentDTO | null = null;

  timeSlots: string[] = [];

  ngOnInit() {
    for (let h = 8; h < 17; h++) {
      this.timeSlots.push(`${String(h).padStart(2, '0')}:00`);
      this.timeSlots.push(`${String(h).padStart(2, '0')}:30`);
    }
    this.loadWeek();
  }

  weekDays = () => {
    const start = this.weekStart();
    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({ date: d.toISOString().split('T')[0] });
    }
    return days;
  };

  weekLabel = () => {
    const days = this.weekDays();
    return `${days[0].date} - ${days[days.length - 1].date}`;
  };

  prevWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  nextWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  loadWeek() {
    const days = this.weekDays();
    this.appointmentService.getDoctorAppointments(days[0].date, days[days.length - 1].date).subscribe({
      next: data => this.appointments.set(data),
      error: () => {}
    });
  }

  getAppointment(date: string, time: string): AppointmentDTO | undefined {
    return this.appointments().find(a => a.date === date && a.startTime === time);
  }

  selectAppointment(apt: AppointmentDTO | undefined) {
    this.selectedAppt = apt || null;
  }

  markCompleted() {
    if (!this.selectedAppt) return;
    this.appointmentService.updateAppointmentStatus(this.selectedAppt.id, 'COMPLETED').subscribe({
      next: () => {
        this.loadWeek();
        this.selectedAppt = null;
      },
      error: () => {}
    });
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  }
}
