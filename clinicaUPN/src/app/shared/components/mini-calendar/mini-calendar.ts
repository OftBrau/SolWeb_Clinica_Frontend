import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { NgFor, NgClass, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  template: `
    <div class="mini-calendar">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button class="btn btn-sm btn-outline-secondary" (click)="prevMonth()">&laquo;</button>
        <strong>{{ monthName }} {{ year() }}</strong>
        <button class="btn btn-sm btn-outline-secondary" (click)="nextMonth()">&raquo;</button>
      </div>
      <div class="cal-weekdays">
        <span *ngFor="let d of dayNames">{{ d }}</span>
      </div>
      <div class="cal-days">
        <ng-container *ngFor="let day of days()">
          <button class="cal-cell"
                  [class.available]="day.available"
                  [class.unavailable]="!day.available"
                  [class.selected]="day.date === selectedDate"
                  [class.past]="day.past"
                  [class.empty]="day.day === 0"
                  [disabled]="!day.available || day.past"
                  (click)="selectDate(day.date)">
            {{ day.day > 0 ? day.day : '' }}
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .mini-calendar { width: 100%; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; text-transform: uppercase; }
    .cal-weekdays span { padding: 4px 0; }
    .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .cal-cell { border-radius: 6px; font-size: 0.85rem; border: 1px solid transparent; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px 0; transition: background .15s, border-color .15s; min-height: 36px; font-weight: 500; color: var(--bs-body-color); }
    .cal-cell.available { background: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
    .cal-cell.available:hover { background: #c8e6c9; }
    .cal-cell.unavailable { background: #f5f5f5; color: #ccc; border-color: #eee; cursor: not-allowed; }
    .cal-cell.selected { background: #1976d2; color: white; border-color: #1565c0; }
    .cal-cell.past { opacity: 0.3; }
    .cal-cell.empty { visibility: hidden; pointer-events: none; }
  `]
})
export class MiniCalendarComponent implements OnInit, OnChanges {
  @Input() availableDates: string[] = [];
  @Input() selectedDate: string = '';
  @Output() dateSelected = new EventEmitter<string>();
  @Output() monthChanged = new EventEmitter<string>();

  year = signal<number>(0);
  month = signal<number>(0);
  days = signal<DayCell[]>([]);
  monthName = '';
  dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  ngOnInit() {
    const now = new Date();
    this.year.set(now.getFullYear());
    this.month.set(now.getMonth() + 1);
    this.renderMonth();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['availableDates']) {
      this.renderMonth();
    }
  }

  prevMonth() {
    let m = this.month() - 1;
    let y = this.year();
    if (m < 1) { m = 12; y--; }
    this.month.set(m);
    this.year.set(y);
    this.renderMonth();
    this.monthChanged.emit(`${this.year()}-${String(this.month()).padStart(2, '0')}`);
  }

  nextMonth() {
    let m = this.month() + 1;
    let y = this.year();
    if (m > 12) { m = 1; y++; }
    this.month.set(m);
    this.year.set(y);
    this.renderMonth();
    this.monthChanged.emit(`${this.year()}-${String(this.month()).padStart(2, '0')}`);
  }

  private renderMonth() {
    const date = new Date(this.year(), this.month() - 1, 1);
    this.monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(this.year(), this.month(), 0).getDate();
    const startDay = (date.getDay() + 6) % 7;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const cells: DayCell[] = [];
    for (let i = 0; i < startDay; i++) {
      cells.push({ day: 0, date: '', available: false, past: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.year()}-${String(this.month()).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const past = dateStr < todayStr || dateStr > maxDateStr;
      cells.push({
        day: d,
        date: dateStr,
        available: this.availableDates.includes(dateStr),
        past
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: 0, date: '', available: false, past: true });
    }
    this.days.set(cells);
  }

  selectDate(date: string) {
    if (date) this.dateSelected.emit(date);
  }
}

interface DayCell {
  day: number;
  date: string;
  available: boolean;
  past: boolean;
}
