import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { AppointmentDTO, AvailabilityTemplateDTO, AvailabilityOverrideDTO } from '../../../core/models/scheduling.models';

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="weekly-grid">
      <div class="row g-0">
        <div class="col-1 time-col">
          <div class="time-header"></div>
          <div *ngFor="let t of timeRows" class="time-slot-cell time-label">
            <span>{{ t }}</span>
          </div>
        </div>
        <div *ngFor="let day of dayHeaders" class="col day-col">
          <div class="day-header">{{ day }}</div>
          <div *ngFor="let t of timeRows" class="time-slot-cell grid-cell"
               [class.available]="isAvailable(day, t)"
               [class.booked]="isBooked(day, t)"
               [class.blocked]="!isAvailable(day, t) && !isBooked(day, t)"
               [class.completed]="isCompleted(day, t)"
               (click)="onCellClick(day, t)">
            <span *ngIf="getAppointment(day, t)" class="appt-label">
              {{ getAppointment(day, t)?.patientName }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .weekly-grid { width: 100%; overflow-x: auto; }
    .time-col { min-width: 60px; }
    .day-col { min-width: 120px; flex: 1; }
    .day-header { background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; border: 1px solid #dee2e6; }
    .time-header { padding: 8px; border: 1px solid #dee2e6; background: #f8f9fa; }
    .time-slot-cell { height: 32px; border: 1px solid #eee; display: flex; align-items: center; padding: 2px 4px; font-size: 0.75rem; cursor: pointer; }
    .time-label { justify-content: flex-end; padding-right: 8px; border-right: 2px solid #dee2e6; background: #f8f9fa; font-size: 0.7rem; }
    .grid-cell.available { background: #e8f5e9; }
    .grid-cell.booked { background: #e3f2fd; }
    .grid-cell.blocked { background: #f5f5f5; }
    .grid-cell.completed { background: #f3e5f5; }
    .appt-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; color: #1565c0; }
  `]
})
export class WeeklyGridComponent {
  @Input() appointments: AppointmentDTO[] = [];
  @Input() templates: AvailabilityTemplateDTO[] = [];
  @Input() overrides: AvailabilityOverrideDTO[] = [];
  @Input() weekStart: string = '';
  @Input() mode: 'config' | 'dashboard' = 'config';
  @Output() cellToggled = new EventEmitter<{ day: string; time: string }>();
  @Output() cellClicked = new EventEmitter<{ day: string; time: string; appointment?: AppointmentDTO }>();

  timeRows = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
              '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  isAvailable(day: string, time: string): boolean {
    return false; // Simplified — actual logic in parent
  }

  isBooked(day: string, time: string): boolean {
    return !!this.getAppointment(day, time);
  }

  isCompleted(day: string, time: string): boolean {
    const a = this.getAppointment(day, time);
    return a?.status === 'COMPLETED';
  }

  getAppointment(day: string, time: string): AppointmentDTO | undefined {
    return this.appointments.find(a => {
      const date = new Date(a.date);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return dayNames[date.getDay()] === day && a.startTime === time;
    });
  }

  onCellClick(day: string, time: string) {
    if (this.mode === 'config') {
      this.cellToggled.emit({ day, time });
    } else {
      this.cellClicked.emit({ day, time, appointment: this.getAppointment(day, time) });
    }
  }
}
