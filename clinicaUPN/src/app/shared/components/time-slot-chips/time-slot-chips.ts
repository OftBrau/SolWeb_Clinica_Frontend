import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { TimeSlotDTO } from '../../../core/models/scheduling.models';

@Component({
  selector: 'app-time-slot-chips',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="time-slots">
      <div class="slot-group">
        <div class="slot-group-header">
          <i class="bi bi-sun-fill"></i> Mañana
        </div>
        <div class="slot-group-body">
          <button *ngFor="let slot of morningSlots()"
                  class="slot-btn"
                  [class.selected]="selectedSlot?.startTime === slot.startTime"
                  (click)="selectSlot(slot)">
            <span class="slot-time">{{ formatTime(slot.startTime) }}</span>
          </button>
          <div *ngIf="morningSlots().length === 0" class="slot-empty">Sin horarios</div>
        </div>
      </div>
      <div class="slot-group">
        <div class="slot-group-header">
          <i class="bi bi-moon-fill"></i> Tarde
        </div>
        <div class="slot-group-body">
          <button *ngFor="let slot of afternoonSlots()"
                  class="slot-btn"
                  [class.selected]="selectedSlot?.startTime === slot.startTime"
                  (click)="selectSlot(slot)">
            <span class="slot-time">{{ formatTime(slot.startTime) }}</span>
          </button>
          <div *ngIf="afternoonSlots().length === 0" class="slot-empty">Sin horarios</div>
        </div>
      </div>
      <div *ngIf="slots.length === 0" class="text-muted text-center py-3">
        No hay horarios disponibles para esta fecha
      </div>
    </div>
  `,
  styles: [`
    .time-slots { display: flex; flex-direction: column; gap: 16px; }
    .slot-group { border: 1px solid var(--bs-border-color); border-radius: 12px; overflow: hidden; }
    .slot-group-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 0.85rem; font-weight: 600; background: var(--bs-tertiary-bg); border-bottom: 1px solid var(--bs-border-color); }
    .slot-group-body { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 6px; padding: 10px 14px; }
    .slot-btn { border: 1px solid var(--bs-border-color); border-radius: 8px; padding: 8px 4px; background: var(--bs-body-bg); cursor: pointer; transition: all .15s; text-align: center; }
    .slot-btn:hover { border-color: #1976d2; background: #e3f2fd; }
    .slot-btn.selected { border-color: #1976d2; background: #1976d2; }
    .slot-btn.selected .slot-time { color: white; }
    .slot-time { font-size: 0.8rem; font-weight: 600; color: var(--bs-body-color); }
    .slot-empty { font-size: 0.8rem; color: var(--bs-secondary-color); grid-column: 1 / -1; text-align: center; padding: 4px 0; }
  `]
})
export class TimeSlotChipsComponent {
  @Input() slots: TimeSlotDTO[] = [];
  @Input() selectedSlot?: TimeSlotDTO | null;
  @Output() slotSelected = new EventEmitter<TimeSlotDTO>();

  morningSlots = computed(() =>
    this.slots.filter(s => s.startTime >= '08:00' && s.startTime < '12:00')
  );
  afternoonSlots = computed(() =>
    this.slots.filter(s => s.startTime >= '12:00')
  );

  selectSlot(slot: TimeSlotDTO) {
    this.slotSelected.emit(slot);
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  }
}
