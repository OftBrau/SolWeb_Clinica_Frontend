import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { TimeSlotDTO } from '../../../core/models/scheduling.models';

@Component({
  selector: 'app-time-slot-chips',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="time-slots">
      <div *ngIf="morningSlots().length > 0" class="mb-3">
        <h6 class="text-muted mb-2">Mañana</h6>
        <div class="d-flex flex-wrap gap-2">
          <button *ngFor="let slot of morningSlots()"
                  class="btn btn-sm slot-chip"
                  [class.selected]="selectedSlot?.startTime === slot.startTime"
                  [class.available]="selectedSlot?.startTime !== slot.startTime"
                  (click)="selectSlot(slot)">
            {{ formatTime(slot.startTime) }}
          </button>
        </div>
      </div>
      <div *ngIf="afternoonSlots().length > 0">
        <h6 class="text-muted mb-2">Tarde</h6>
        <div class="d-flex flex-wrap gap-2">
          <button *ngFor="let slot of afternoonSlots()"
                  class="btn btn-sm slot-chip"
                  [class.selected]="selectedSlot?.startTime === slot.startTime"
                  [class.available]="selectedSlot?.startTime !== slot.startTime"
                  (click)="selectSlot(slot)">
            {{ formatTime(slot.startTime) }}
          </button>
        </div>
      </div>
      <div *ngIf="slots.length === 0" class="text-muted text-center py-3">
        No hay horarios disponibles para esta fecha
      </div>
    </div>
  `,
  styles: [`
    .slot-chip { min-width: 80px; border-radius: 20px; font-size: 0.85rem; }
    .slot-chip.available { background: #e3f2fd; color: #1565c0; border-color: #90caf9; }
    .slot-chip.selected { background: #1976d2; color: white; border-color: #1565c0; }
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
