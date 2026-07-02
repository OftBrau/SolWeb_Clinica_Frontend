import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="mini-calendar">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button class="btn btn-sm btn-outline-secondary" (click)="prevMonth()">&laquo;</button>
        <strong>{{ monthName }} {{ year() }}</strong>
        <button class="btn btn-sm btn-outline-secondary" (click)="nextMonth()">&raquo;</button>
      </div>
      <div class="row g-1 text-center">
        <div class="col" *ngFor="let d of dayNames">{{ d }}</div>
      </div>
      <div class="row g-1 text-center">
        <ng-container *ngFor="let day of days()">
          <div class="col">
            <button class="btn btn-sm calendar-cell"
                    [class.available]="day.available"
                    [class.unavailable]="!day.available"
                    [class.selected]="day.date === selectedDate"
                    [class.past]="day.past"
                    [disabled]="!day.available || day.past"
                    (click)="selectDate(day.date)">
              {{ day.day }}
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .mini-calendar { max-width: 350px; }
    .calendar-cell { width: 100%; height: 38px; border-radius: 50%; font-size: 0.85rem; padding: 0; }
    .calendar-cell.available { background: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
    .calendar-cell.unavailable { background: #f5f5f5; color: #bbb; border-color: #eee; cursor: not-allowed; }
    .calendar-cell.selected { background: #1976d2; color: white; border-color: #1565c0; }
    .calendar-cell.past { opacity: 0.4; }
  `]
})
export class MiniCalendarComponent implements OnInit {
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
    const today = new Date().toISOString().split('T')[0];
    const cells: DayCell[] = [];
    for (let i = 0; i < startDay; i++) {
      cells.push({ day: 0, date: '', available: false, past: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.year()}-${String(this.month()).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        date: dateStr,
        available: this.availableDates.includes(dateStr),
        past: dateStr < today
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
